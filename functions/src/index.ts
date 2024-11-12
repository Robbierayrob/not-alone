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

interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export const processChat = functions.https.onCall(async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  if (!request.data?.message) {
    throw new functions.https.HttpsError('invalid-argument', 'Message is required');
  }

  try {
    const { message, history = [] } = request.data;

    // Start chat session with history if provided
    const chat = model.startChat({
      history: history as ChatMessage[],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send message and get streaming response
    const result = await chat.sendMessage(message);
    const response = await result.response;

    if (!response?.candidates?.[0]?.content) {
      throw new functions.https.HttpsError('internal', 'Invalid response from AI model');
    }

    const aiResponse = response.candidates[0].content.parts
      .map(part => part.text)
      .join(' ')
      .trim();

    return {
      message: aiResponse,
      userMessage: message,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error('Chat processing error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Error processing chat'
    );
  }
});
