import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { CallableContext } from 'firebase-functions/lib/common/providers/https';
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

export const getChatHistory = onCall(async (request: { data?: any } | unknown, context?: CallableContext) => {
  console.log('🔍 Retrieving Chat History', { request });

  // Basic validation
  if (!request || typeof request !== 'object') {
    console.error('❌ Invalid request');
    throw new HttpsError('invalid-argument', 'Invalid request');
  }

  // Handle nested data structure
  const data = (request as { data?: any }).data || request;

  const { userId, chatId } = data as {
    userId?: string, 
    chatId?: string
  };

  console.log('🔍 Extracting User ID:', { userId });

  // Validate userId and chatId
  if (!userId) {
    console.error('❌ Missing userId', { data });
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  try {
    // Optional: If chatId is provided, fetch specific chat history
    const baseQuery = firestore.collection('chat_histories')
      .where('userId', '==', userId);
    
    const query = chatId 
      ? baseQuery.where('chatId', '==', chatId)
      : baseQuery;
    
    const querySnapshot = await query.get();

    // Transform query results into an array of chat histories
    // Group chats by date and assign entry numbers
    const chatsByDate = querySnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      const date = data.createdAt 
        ? new Date(data.createdAt).toLocaleDateString('en-US', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          })
        : new Date().toLocaleDateString('en-US', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          });
      
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    const chatHistories = Object.entries(chatsByDate).flatMap(([date, docs]) => 
      docs.map((doc, index) => {
        const data = doc.data();
        return {
          chatId: doc.id,
          title: `${date} - Entry #${index + 1}`,
          createdAt: data.createdAt || new Date().toISOString(),
          // Intentionally exclude messages to prevent overwhelming data transfer
        };
      })
    );

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
