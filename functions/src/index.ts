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

// Store chat sessions with explicit history tracking
const chatSessions = new Map<string, {
  chat: any;
  history: Array<{role: string, parts: Array<{text: string}>}>;
}>();

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
    // Generate new chat ID only if one wasn't provided
    const sessionChatId = chatId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = request.auth.uid;
    
    console.log('📝 Using chat ID:', chatId);
    
    console.log('📥 Processing request:', {
      messageLength: message.length,
      userId,
      chatId,
    });

    // Get or create chat session
    let chatSession = chatSessions.get(sessionChatId);
    if (!chatSession) {
      console.log('🆕 Creating new chat session:', sessionChatId);
      const initialHistory = [
        {
          role: "user",
          parts: [{ text: "You are a relationship counselor AI assistant. Help users understand and improve their relationships." }]
        },
        {
          role: "assistant", 
          parts: [{ text: "I understand my role as a relationship counselor AI assistant. I'm here to help users explore and improve their relationships." }]
        },
        {
          role: "user",
          parts: [{ text: "Tell me about my relationships" }]
        },
        {
          role: "assistant",
          parts: [{ text: "I'd be happy to help you explore and understand your relationships. What specific aspects would you like to discuss?" }]
        }
      ];

      const chat = await model.startChat({ history: initialHistory });
      
      chatSession = {
        chat,
        history: initialHistory
      };
      
      chatSessions.set(sessionChatId, chatSession);
      
      console.log('📝 Chat session created:', {
        chatId: sessionChatId,
        sessionExists: chatSessions.has(sessionChatId)
      });
    }

    const chat = chatSession.chat;
    const history = chatSession.history;

    console.log('💬 Sending message to Gemini:', message);
    
    // Update history with current user message
    const userMessagePart = { role: "user", parts: [{ text: message }] };
    history.push(userMessagePart);

    const result = await chat.sendMessage(message);
    const response = result.response;
    
    if (!response?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;
    
    // Update history with AI response
    const aiResponsePart = { role: "model", parts: [{ text: aiResponse }] };
    history.push(aiResponsePart);

    // Log the current chat history for debugging
    console.log('📚 Current Chat History:', {
      chatId: sessionChatId,
      historyLength: history.length,
      lastMessages: history.slice(-4)  // Show last 4 messages
    });
    
    console.log('✅ Response received:', {
      responseLength: aiResponse.length,
      timestamp: new Date().toISOString(),
    });

    const finalResponse = {
      message: aiResponse,
      userMessage: message,
      timestamp: new Date().toISOString(),
      userId,
      chatId: sessionChatId
    };

    console.log('📤 Sending response:', finalResponse);
    return { result: finalResponse };

  } catch (error) {
    console.error('💥 Chat processing error:', error);
    
    // Specific handling for 429 Too Many Requests
    if (error instanceof Error && error.message.includes('429')) {
      throw new functions.https.HttpsError(
        'resource-exhausted', 
        'Too many requests. Please try again later.'
      );
    }
    
    throw new functions.https.HttpsError(
      'internal',
      error instanceof Error ? error.message : 'Error processing chat'
    );
  }
});
