import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

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
 * @returns {Promise<void>}
 */
exports.storeChatInteraction = functions.https.onCall(async (request): Promise<void> => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message, userId } = request.data as ChatInteractionRequest;

  try {
    // Call the existing processChat function to get the AI response
    const processChat = functions.httpsCallable('processChat');
    const chatResponse = await processChat({ message });

    // Prepare the interaction data for Firestore
    const interactionData: ChatInteractionResponse = {
      userMessage: message,
      aiResponse: chatResponse.data.message
    };

    // Store the interaction in Firestore
    await firestore.collection('chatInteractions').add({
      userId,
      ...interactionData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Error storing chat interaction:', error);
    throw new functions.https.HttpsError('internal', 'Error storing chat interaction');
  }
});
