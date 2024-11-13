import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
  
  // Connect to local Firestore emulator
  console.log('Connecting to Firestore Emulator: localhost:8080');
  admin.firestore().settings({
    host: 'localhost:8080',
    ssl: false
  });
}

const firestore = admin.firestore();

export const getChatHistory = onCall(async (request) => {
  console.log('🚀 Incoming request:', {
    auth: request.auth ? 'Authenticated' : 'Not authenticated',
    data: request.data,
  });

  // Authentication check
  if (!request.auth) {
    console.error('❌ Authentication missing');
    throw new HttpsError('unauthenticated', 'Authentication required');
  }

  // Validate request data
  if (!request.data || !request.data.userId) {
    console.error('❌ User ID missing');
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  const { userId, chatId } = request.data;

  // Validate that the requested userId matches the authenticated user
  if (userId !== request.auth.uid) {
    console.error('❌ Unauthorized user access', { 
      requestedUserId: userId, 
      authenticatedUserId: request.auth.uid 
    });
    throw new HttpsError('permission-denied', 'You can only access your own chat histories');
  }

  try {
    // Fetch chat histories for the specific user
    const baseQuery = firestore.collection('chat_histories')
      .where('userId', '==', userId)
      .orderBy('lastUpdated', 'desc');
    
    const query = chatId 
      ? baseQuery.where('chatId', '==', chatId)
      : baseQuery;
    
    const querySnapshot = await query.get();

    const chatHistories = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        chatId: doc.id,
        userId: data.userId,
        title: data.title || `Chat on ${new Date(data.createdAt).toLocaleDateString()}`,
        createdAt: data.createdAt || new Date().toISOString(),
        lastUpdated: data.lastUpdated || data.createdAt,
        messages: data.messages || [], // Include messages array
        messageCount: (data.messages || []).length
      };
    });

    console.log(`✅ Retrieved chat histories for user: ${userId}`, {
      totalChats: chatHistories.length,
      chatId: chatId || 'All chats'
    });

    return { 
      success: true, 
      message: chatId 
        ? 'Specific chat history retrieved' 
        : 'Chat histories retrieved',
      chatHistories: chatHistories
    };

  } catch (error) {
    console.error('❌ Get Chat History Error:', error);
    throw new HttpsError(
      'internal', 
      'Failed to retrieve chat histories',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
