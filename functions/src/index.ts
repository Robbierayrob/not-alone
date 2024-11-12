import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Vertex AI
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'notalone-de4fc',
  location: 'australia-southeast1',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  message: string;
}

/**
 * Processes a chat message through Vertex AI and returns the AI response
 * @param {functions.https.CallableRequest<ChatRequest>} request - The request data containing the message
 * @returns {Promise<ChatResponse>} The AI generated response
 */
export const processChat = functions.https.onCall(async (request): Promise<ChatResponse> => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message } = request.data as ChatRequest;

  try {
    const result = await model.generateContent(message);
    const response = await result.response;

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new functions.https.HttpsError('internal', 'Invalid response format from AI model');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;
    return {
      message: aiResponse,
    };
  } catch (error) {
    console.error('Error processing chat:', error);
    throw new functions.https.HttpsError('internal', 'Error processing chat');
  }
});
