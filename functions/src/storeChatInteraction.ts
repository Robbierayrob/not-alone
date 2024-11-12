import * as functions from 'firebase-functions/v2';
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
exports.storeChatInteraction = functions.https.onCall(async (event): Promise<void> => {
  // Check if the user is authenticated
  if (!event.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message, userId } = event.data as ChatInteractionRequest;

  try {
    // Call the existing processChat function to get the AI response
    const processChat = functions.https.onCall(async (processEvent) => {
      // This is a mock implementation. You'll need to adjust based on your actual processChat function
      const processedMessage = await admin.firestore().collection('functions').doc('processChat').get();
      return processedMessage.data();
    });

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
