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

export const saveChatHistory = onCall(async (data: unknown, context?: CallableContext) => {
  console.log('🔍 COMPREHENSIVE saveChatHistory function called:', {
    timestamp: new Date().toISOString(),
    hasAuth: !!context?.auth,
    requestDataType: typeof data,
    rawData: JSON.stringify(data, null, 2)
  });

  // Validate input data structure
  if (typeof data !== 'object' || data === null) {
    console.error('❌ Invalid data type in saveChatHistory');
    throw new HttpsError('invalid-argument', 'Invalid data structure');
  }

  // Type-safe destructuring with runtime checks
  const { 
    userId, 
    chatId, 
    messages, 
    timestamp 
  } = data as {
    userId?: string, 
    chatId?: string, 
    messages?: ChatMessage[], 
    timestamp?: string
  };

  // Provide a default timestamp if not provided
  const safeTimestamp = timestamp || new Date().toISOString();

  // More flexible userId validation
  if (!userId) {
    console.error('❌ Missing userId');
    throw new HttpsError('invalid-argument', 'User ID is required');
  }

  // Ensure userId is a non-empty string
  const sanitizedUserId = String(userId).trim();
  if (sanitizedUserId.length === 0) {
    console.error('❌ Empty userId');
    throw new HttpsError('invalid-argument', 'User ID cannot be empty');
  }

  if (!chatId || typeof chatId !== 'string') {
    console.error('❌ Invalid or missing chatId');
    throw new HttpsError('invalid-argument', 'Invalid chat ID');
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    console.error('❌ Invalid or empty messages array');
    throw new HttpsError('invalid-argument', 'Invalid messages');
  }

  // Additional message validation
  const invalidMessages = messages.some(msg => 
    !msg || 
    typeof msg !== 'object' || 
    !['user', 'model'].includes(msg.role) || 
    typeof msg.content !== 'string' || 
    typeof msg.timestamp !== 'string'
  );

  if (invalidMessages) {
    console.error('❌ Messages contain invalid entries');
    throw new HttpsError('invalid-argument', 'Invalid message format');
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
        createdAt: safeTimestamp,
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
