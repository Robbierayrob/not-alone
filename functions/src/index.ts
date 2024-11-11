import * as functions from 'firebase-functions';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'notalone-de4fc',
  location: 'australia-southeast1',
});

const model = vertex.preview.getGenerativeModel({
  model: 'gemini-1.5-flash-002',
});

/**
 * Simple chat endpoint that processes messages through Vertex AI
 */
export const processChat = functions.https.onCall(async (data) => {
  const { message } = data;

  try {
    const result = await model.generateContent(message);
    const response = await result.response;
    const aiResponse = response.text();

    return {
      message: aiResponse,
    };
  } catch (error) {
    console.error('Error processing chat:', error);
    throw new functions.https.HttpsError('internal', 'Error processing chat');
  }
});
