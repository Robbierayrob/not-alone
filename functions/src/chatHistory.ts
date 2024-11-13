import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Ensure Firebase Admin is initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
  
  // Connect to local Firestore emulator
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    console.log('Connecting to Firestore Emulator:', process.env.FIRESTORE_EMULATOR_HOST);
    admin.firestore().settings({
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false
    });
  }
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

export const saveChatHistory = functions.https.onCall(async (request: functions.https.CallableRequest) => {
  // Authenticate the request
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { 
    userId, 
    chatId, 
    messages, 
    timestamp 
  } = request.data;

  if (!userId || !chatId || !messages) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  try {
    // Create a document in the chat history collection
    const chatHistoryRef = firestore.collection('chatHistories').doc(chatId);
    
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

    // Save the entire chat history
    await chatHistoryRef.set(chatHistoryData, { merge: true });

    // Optionally, create a user-specific subcollection for easier querying
    const userChatHistoryRef = firestore
      .collection('users')
      .doc(userId)
      .collection('chats')
      .doc(chatId);

    await userChatHistoryRef.set(chatHistoryData, { merge: true });

    console.log(`Chat history saved for user ${userId}, chat ${chatId}`);

    return { 
      success: true, 
      message: 'Chat history saved successfully' 
    };

  } catch (error) {
    console.error('Error saving chat history:', error);
    throw new functions.https.HttpsError(
      'internal', 
      'Failed to save chat history',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
