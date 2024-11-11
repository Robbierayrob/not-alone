import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { processRelationshipData, updateGraphData, getGraphData } from "../relationships";
import { VertexAI } from "@google-cloud/vertexai";

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: "us-central1",
});

/**
 * Retrieves all chats for the authenticated user
 */
export const getChats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const chatsSnapshot = await admin
      .firestore()
      .collection('chats')
      .where('userId', '==', context.auth.uid)
      .orderBy('createdAt', 'desc')
      .get();

    return chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching chats');
  }
});

export const createNewChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const chatRef = await admin.firestore().collection('chats').add({
      userId: context.auth.uid,
      title: 'New Chat',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      messages: []
    });

    return {
      id: chatRef.id,
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      messages: []
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error creating chat');
  }
});

export const deleteChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { chatId } = data;
  
  try {
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const chat = await chatRef.get();

    if (!chat.exists) {
      throw new functions.https.HttpsError('not-found', 'Chat not found');
    }

    if (chat.data()?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized to delete this chat');
    }

    await chatRef.delete();
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error deleting chat');
  }
});

export const processChat = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { message, chatId } = data;

  try {
    const chatRef = admin.firestore().collection('chats').doc(chatId);
    const chat = await chatRef.get();

    if (!chat.exists) {
      throw new functions.https.HttpsError('not-found', 'Chat not found');
    }

    const chatData = chat.data();
    const history = chatData?.messages || [];

    // Initialize Gemini chat
    const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const systemPrompt = `You are an AI assistant focused on helping users improve their relationships and personal growth...`; // Your existing system prompt

    const geminiChat = model.startChat({
      history: history.length > 0 ? history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })) : [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ]
    });

    let aiResponse;
    if (!message && !history.length) {
      const result = await geminiChat.sendMessage(systemPrompt);
      const response = await result.response;
      aiResponse = response.text();
    } else if (!message) {
      return { message: '', chatId };
    } else {
      const result = await geminiChat.sendMessage(message);
      const response = await result.response;
      aiResponse = response.text();
    }

    // Update chat history
    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ];

    await chatRef.update({
      messages: updatedHistory
    });

    // Process relationship data
    const relationshipData = await processRelationshipData(message, updatedHistory);
    if (relationshipData) {
      await updateGraphData(relationshipData, context.auth.uid);
    }

    // Get current graph data
    const graphData = await getGraphData(context.auth.uid);

    return {
      message: aiResponse,
      chatId,
      graphData
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error processing chat');
  }
});
