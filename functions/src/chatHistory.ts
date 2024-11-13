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

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface ChatHistoryData {
  userId: string;
  chatId: string;
  messages: ChatMessage[];
  metadata: {
    createdAt: string;
    messageCount: number;
    lastInteractionTime: string;
  };
}

export const saveChatHistory = onCall(async (data: any, context?: CallableContext) => {
  console.log('🔍 COMPREHENSIVE saveChatHistory function called:', {
    timestamp: new Date().toISOString(),
    hasAuth: !!context?.auth,
    requestData: JSON.stringify(data, null, 2)
  });

  // Log the entire request object for maximum visibility
  console.log('🔬 Full Request Data:', JSON.stringify(data, null, 2));

  // Authenticate the request
  if (!context?.auth) {
    console.error('❌ Authentication missing in saveChatHistory');
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { 
    userId, 
    chatId, 
    messages, 
    timestamp 
  } = data;

  if (!userId || !chatId || !messages) {
    throw new HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Create a document in the chat history collection
    // Create a root-level collection for all chat histories
    const rootChatHistoryRef = firestore
      .collection('notalone_chat_histories')
      .doc(chatId);
    
    const chatHistoryData: ChatHistoryData = {
      userId,
      chatId,
      messages,
      metadata: {
        createdAt: timestamp,
        messageCount: messages.length,
        lastInteractionTime: messages[messages.length - 1].timestamp
      }
    };

    // Save the entire chat history in the root collection
    await rootChatHistoryRef.set(chatHistoryData, { merge: true });

    // Create a subcollection for user-specific chat histories
    const userChatHistoryRef = firestore
      .collection('notalone_users')
      .doc(userId)
      .collection('chat_histories')
      .doc(chatId);

    await userChatHistoryRef.set(chatHistoryData, { merge: true });

    // Optional: Add a reference to the user's chat history list
    const userChatListRef = firestore
      .collection('notalone_users')
      .doc(userId);

    await userChatListRef.set({
      chatHistories: admin.firestore.FieldValue.arrayUnion(chatId)
    }, { merge: true });

    console.log(`Chat history saved for user ${userId}, chat ${chatId}`);

    return { 
      success: true, 
      message: 'Chat history saved successfully' 
    };

  } catch (error) {
    console.error('Error saving chat history:', error);
    throw new HttpsError(
      'internal', 
      'Failed to save chat history',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
