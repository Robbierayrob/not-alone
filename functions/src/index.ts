import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Initialize Vertex AI
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'notalone-de4fc',
  location: 'australia-southeast1',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

const firestore = admin.firestore();

interface ChatRequest {
  message: string;
  userId: string;
}

interface ChatResponse {
  message: string;
  userMessage: string;
}

/**
 * Processes a chat message through Vertex AI, stores interaction, and returns the response
 * @param {functions.https.CallableRequest<ChatRequest>} data - The request data containing the message and user ID
 * @param {functions.https.CallableContext} context - The context of the function call
 * @returns {Promise<ChatResponse>} The AI generated response with user message
 */
export const processChat = functions.https.onCall(async (request: functions.https.CallableRequest<ChatRequest>): Promise<ChatResponse> => {
  const { data, context } = request;
  // Enhanced logging for tracking function calls
  console.info('Processing chat interaction', { 
    userId: context.auth?.uid, 
    timestamp: new Date().toISOString() 
  });

  // Check if the user is authenticated
  if (!context.auth) {
    console.warn('Unauthenticated access attempt');
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message, userId } = data as ChatRequest;

  try {
    // Generate AI response
    const result = await model.generateContent(message);
    const response = await result.response;

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid AI response format', { message });
      throw new functions.https.HttpsError('internal', 'Invalid response format from AI model');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;

    // Store chat interaction in Firestore
    try {
      await firestore.collection('chatInteractions').add({
        userId,
        userMessage: message,
        aiResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (storageError) {
      console.error('Failed to store chat interaction', { 
        error: storageError, 
        userId, 
        message 
      });
      // Non-critical error, we'll still return the AI response
    }

    return {
      message: aiResponse,
      userMessage: message
    };

  } catch (error) {
    console.error('Comprehensive chat processing error', { 
      error, 
      userId: context.auth.uid, 
      message 
    });
    throw new functions.https.HttpsError('internal', 'Comprehensive error processing chat interaction');
  }
});
