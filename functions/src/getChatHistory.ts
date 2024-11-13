import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const firestore = admin.firestore();

// Connect to local Firestore emulator
if (process.env.NODE_ENV === 'development') {
  console.log('Connecting to Firestore Emulator: localhost:8080');
  firestore.settings({
    host: 'localhost:8080',
    ssl: false
  });
}

export const getChatHistory = onCall(async (request: unknown, context?: CallableContext) => {
  console.log('🔍 Retrieving Chat History', { request });

  // Basic validation
  if (!request || typeof request !== 'object') {
    console.error('❌ Invalid request');
    throw new HttpsError('invalid-argument', 'Invalid request');
  }

  // Handle nested data structure
  const data = (request as any).data || request;

  const { userId } = data as {
    userId?: string
  };

  console.log('🔍 Extracting User ID:', { userId });

  // Validate userId
  if (!userId) {
    console.error('❌ Missing userId', { data });
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    // Query Firestore for all chat histories belonging to the user
    const chatHistoriesRef = firestore.collection('chat_histories');
    const query = chatHistoriesRef.where('userId', '==', userId);
    
    const querySnapshot = await query.get();

    // Transform query results into an array of chat histories
    const chatHistories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`✅ Retrieved chat histories for user: ${userId}`, {
      totalChats: chatHistories.length
    });

    return { 
      success: true, 
      message: 'Chat histories retrieved',
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
