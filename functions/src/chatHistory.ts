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

export const saveChatHistory = onCall(async (request: unknown, context?: CallableContext) => {
  console.log('🔍 Saving Chat History', { request });

  // Basic validation
  if (!request || typeof request !== 'object') {
    console.error('❌ Invalid request');
    throw new HttpsError('invalid-argument', 'Invalid request');
  }

  // Handle nested data structure
  const data = (request as any).data || request;

  const { userId, chatId, messages } = data as {
    userId?: string, 
    chatId?: string, 
    messages?: any[]
  };

  console.log('🔍 Extracted Data:', { userId, chatId, messagesCount: messages?.length });

  // Minimal validation
  if (!userId || !chatId) {
    console.error('❌ Missing userId or chatId', { data });
    throw new HttpsError('invalid-argument', 'User ID and Chat ID are required');
  }

  try {
    // Simplest possible Firestore save
    const docRef = firestore
      .collection('chat_histories')
      .doc(chatId);

    await docRef.set({
      userId,
      chatId,
      messages,
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Chat history saved: ${chatId}`);

    return { 
      success: true, 
      message: 'Chat history saved' 
    };

  } catch (error) {
    console.error('❌ Save Chat History Error:', error);
    throw new HttpsError(
      'internal', 
      'Failed to save chat history',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
});
