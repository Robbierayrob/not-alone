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

// Store chat sessions
const chatSessions = new Map();

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
    const { message, chatId } = request.data;
    const userId = request.auth.uid;
    
    console.log('📥 Processing request:', {
      messageLength: message.length,
      userId,
      chatId,
    });

    // Get or create chat session
    let chat = chatSessions.get(chatId);
    if (!chat) {
      console.log('🆕 Creating new chat session:', chatId);
      chat = await model.startChat({
        context: "You are a relationship counselor AI assistant. Help users understand and improve their relationships.",
        examples: [{
          input: { content: "Tell me about my relationships" },
          output: { content: "I'd be happy to help you explore and understand your relationships. What specific aspects would you like to discuss?" }
        }]
      });
      chatSessions.set(chatId, chat);
      console.log('📝 Chat session created:', {
        chatId,
        sessionExists: chatSessions.has(chatId)
      });
    }

    console.log('💬 Sending message to Gemini:', message);
    
    const result = await chat.sendMessage(message, {
      stream: true
    });

    let aiResponse = '';
    const chunks = [];

    console.log('🔄 Starting stream processing');
    for await (const chunk of result.stream) {
      const chunkText = chunk.candidates[0]?.content?.parts?.[0]?.text || '';
      chunks.push(chunkText);
      aiResponse += chunkText;
      console.log('📦 Received chunk:', {
        chunkLength: chunkText.length,
        totalLength: aiResponse.length
      });
    }

    console.log('✅ Stream complete:', {
      totalChunks: chunks.length,
      finalLength: aiResponse.length,
      timestamp: new Date().toISOString(),
    });

    const finalResponse = {
      message: aiResponse,
      userMessage: message,
      timestamp: new Date().toISOString(),
      userId,
      chatId,
      chunks
    };

    console.log('📤 Sending final response:', finalResponse);
    return { result: finalResponse };

  } catch (error) {
    console.error('💥 Chat processing error:', error);
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Error processing chat'
    );
  }
});
