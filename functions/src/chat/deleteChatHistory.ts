import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
  
  if (process.env.FUNCTIONS_EMULATOR) { // Check if running in emulator
    console.log('Connecting to Firestore Emulator: localhost:8080');
    admin.firestore().settings({
      host: 'localhost:8080',
      ssl: false
    });
  }
}

const firestore = admin.firestore();

export const deleteChatHistory = onCall(async (request) => {
  console.log('🚀 Incoming delete chat history request:', {
    auth: request.auth ? 'Authenticated' : 'Not authenticated',
    data: request.data,
  });

  // Authentication check
  if (!request.auth) {
    console.error('❌ Authentication missing');
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // Validate request data
  if (!request.data || !request.data.userId || !request.data.chatId) {
    console.error('❌ User ID or Chat ID missing');
    throw new HttpsError('invalid-argument', 'User ID and Chat ID are required');
  }

  const { userId, chatId } = request.data;

  // Validate that the requested userId matches the authenticated user
  if (userId !== request.auth.uid) {
    console.error('❌ Unauthorized user access', { 
      requestedUserId: userId, 
      authenticatedUserId: request.auth.uid 
    });
    throw new HttpsError('permission-denied', 'You can only delete your own chat histories');
  }

  try {
    // Check if the chat document exists and belongs to the user
    const chatDocRef = firestore.collection('chat_histories').doc(chatId);
    const chatDoc = await chatDocRef.get();

    if (!chatDoc.exists) {
      console.warn(`❗ Chat document not found: ${chatId}`);
      throw new HttpsError('not-found', 'Chat history not found');
    }

    const chatData = chatDoc.data();
    if (chatData?.userId !== userId) {
      console.error('❌ Attempt to delete another user\'s chat', { 
        requestedUserId: userId, 
        chatOwnerId: chatData?.userId 
      });
      throw new HttpsError('permission-denied', 'You can only delete your own chat histories');
    }

    // Delete the chat document
    await chatDocRef.delete();

    console.log(`✅ Successfully deleted chat history: ${chatId} for user: ${userId}`);

    return { 
      success: true, 
      message: 'Chat history deleted successfully',
      chatId: chatId
    };

  } catch (error) {
    console.error('❌ Delete Chat History Error:', error);
    
    if (error instanceof HttpsError) {
      throw error;  // Re-throw HttpsErrors as they are
    }

    throw new HttpsError(
      'internal', 
      'Failed to delete chat history',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
