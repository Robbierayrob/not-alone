import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.GOOGLE_CLOUD_PROJECT || 'notalone-de4fc',
  });
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

/**
 * Represents the structure of a chat message in the history
 */
interface ChatHistory {
  role: string;
  parts: Array<{text: string}>;
}

/**
 * Loads chat history from Firestore for a given session
 * @param {string} sessionId - The unique identifier for the chat session
 * @return {Promise<ChatHistory[]>} Array of chat history messages
 */
async function loadChatHistory(sessionId: string): Promise<ChatHistory[]> {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  const chatDoc = await firestore.collection('chatSessions').doc(sessionId).get();
  return chatDoc.exists ? chatDoc.data()?.history || [] : [];
}

/**
 * Saves chat history to Firestore
 * @param {string} sessionId - The unique identifier for the chat session
 * @param {ChatHistory[]} history - Array of chat messages to save
 * @return {Promise<void>}
 */
async function saveChatHistory(sessionId: string, history: ChatHistory[]) {
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  await firestore.collection('chatSessions').doc(sessionId).set({
    history,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export interface ChatRequest {
  message: string;
  userId: string;
  sessionId?: string; // Optional session ID for chat continuity
}

export interface ChatResponse {
  message: string;
  userMessage: string;
  timestamp: Date;
}

interface ChatInteraction {
  userId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: admin.firestore.Timestamp;
  sessionId?: string;
  metadata: {
    modelVersion: string;
    processingTime: number;
    createdAt: admin.firestore.Timestamp;
  };
}

/**
 * Processes a chat message through Vertex AI, stores interaction, and returns the response
 * @param {functions.https.CallableRequest<ChatRequest>} data - The request data containing the message and user ID
 * @param {functions.https.CallableContext} context - The context of the function call
 * @returns {Promise<ChatResponse>} The AI generated response with user message
 */
export const processChat = functions.https.onCall(async (request) => {
  // Enhanced logging for tracking function calls
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { message } = request.data;

  try {
    const startTime = Date.now();

    // Load existing chat history from Firestore
    const sessionId = request.data.sessionId || request.auth.uid;
    if (!sessionId) {
      throw new functions.https.HttpsError('invalid-argument', 'Session ID is required');
    }
    const chatHistory = await loadChatHistory(sessionId);

    // Start chat session with loaded history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new functions.https.HttpsError('internal', 'Invalid response format from AI model');
    }

    const aiResponse = response.candidates[0].content.parts[0].text;

    // Update chat history
    chatHistory.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: aiResponse }] }
    );

    // Save updated history to Firestore
    await saveChatHistory(sessionId, chatHistory);
    const processingTime = Date.now() - startTime;

    // Prepare chat interaction data
    const chatInteraction: ChatInteraction = {
      userId: request.auth?.uid || 'anonymous',
      userMessage: message,
      aiResponse,
      timestamp: admin.firestore.Timestamp.now(),
      metadata: {
        modelVersion: 'gemini-1.5-flash-002',
        processingTime,
        createdAt: admin.firestore.Timestamp.now(),
      },
    };

    // Only add sessionId if it exists
    if (request.data.sessionId) {
      chatInteraction.sessionId = request.data.sessionId;
    }

    // Validate required fields before storage
    if (!chatInteraction.userId || !chatInteraction.userMessage || !chatInteraction.aiResponse) {
      throw new Error('Missing required fields for chat interaction');
    }

    // Store chat interaction in Firestore
    try {
      const docRef = await firestore.collection('chatInteractions').add(chatInteraction);
      console.log(`Chat interaction stored with ID: ${docRef.id}`);
    } catch (storageError) {
      console.error('Failed to store chat interaction:', storageError);
      // Non-critical error, continue with response
    }

    return {
      message: aiResponse,
      userMessage: message,
      timestamp: admin.firestore.Timestamp.now().toDate(),
    };

  } catch (error) {
    console.error('Error processing chat:', error);
    throw new functions.https.HttpsError('internal', 'Error processing chat');
  }
});
