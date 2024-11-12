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

export const processChat = functions.https.onCall(async (request) => {
  console.log('🚀 Incoming request:', {
    auth: request.auth ? 'Authenticated' : 'Not authenticated',
    data: request.data,
  });

  // Authentication check
  if (!request.auth) {
    console.error('❌ Authentication missing');
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  // Validate message
  if (!request.data?.message) {
    console.error('❌ Message missing in request data');
    throw new functions.https.HttpsError('invalid-argument', 'Message is required');
  }

  try {
    const { message } = request.data;
    const userId = request.auth.uid;
    
    console.log('📥 Processing request:', {
      messageLength: message.length,
      userId,
    });

    console.log('💬 Sending message to Gemini:', message);
    
    const result = await model.generateContent(message);
    const response = await result.response;

    console.log('📊 Raw Gemini response:', response);

    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('❌ Invalid AI response structure:', response);
      throw new functions.https.HttpsError('internal', 'Invalid response from AI model');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;

    console.log('✅ Processed response:', {
      responseLength: aiResponse.length,
      timestamp: new Date().toISOString(),
    });

    const finalResponse = {
      message: aiResponse,
      userMessage: message,
      timestamp: new Date().toISOString(),
      userId,
    };

    console.log('📤 Sending final response:', finalResponse);
    return finalResponse;

  } catch (error) {
    console.error('💥 Chat processing error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Error processing chat'
    );
  }
});
