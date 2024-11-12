import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { processChat } from './index'; // Import processChat from index.ts

// Initialize Firestore if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const firestore = admin.firestore();

interface ChatInteractionRequest {
  message: string;
  userId: string;
}

interface ChatInteractionResponse {
  userMessage: string;
  aiResponse: string;
}

/**
 * Stores chat interactions in Firestore
 * @param {functions.https.CallableRequest<ChatInteractionRequest>} request - The request data containing the message and user ID
 * @returns {Promise<ChatInteractionResponse>}
 */
exports.storeChatInteraction = functions.https.onCall(async (data, context): Promise<ChatInteractionResponse> => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message, userId } = data as ChatInteractionRequest;

  try {
    // Call the processChat function to get the AI response
    const chatResponse = await processChat(data, context);

    // Prepare the interaction data for Firestore
    const interactionData: ChatInteractionResponse = {
      userMessage: message,
      aiResponse: (chatResponse as any)?.message ?? ''
    };

    // Store the interaction in Firestore
    await firestore.collection('chatInteractions').add({
      userId,
      ...interactionData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return interactionData;

  } catch (error) {
    console.error('Error storing chat interaction:', error);
    throw new functions.https.HttpsError('internal', 'Error storing chat interaction');
  }
});
