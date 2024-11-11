import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Vertex AI
const vertex = new VertexAI({project: process.env.GOOGLE_CLOUD_PROJECT, location: 'us-central1'});
const model = vertex.preview.getGenerativeModel({
  model: "gemini-1.5-flash-002"
});

export interface ChatMessage {
  role: string;
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  userId?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  details?: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  details?: Record<string, unknown>;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  metadata?: {
    lastUpdated: string;
    version: string;
  };
}

export interface Suggestion {
  id: string;
  text: string;
  icon: string;
}

/**
 * Retrieves all chats for the authenticated user
 */
export const getChats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const chatsSnapshot = await db
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
    const chatRef = await db.collection('chats').add({
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
    const chatRef = db.collection('chats').doc(chatId);
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
    const chatRef = db.collection('chats').doc(chatId);
    const chat = await chatRef.get();

    if (!chat.exists) {
      throw new functions.https.HttpsError('not-found', 'Chat not found');
    }

    const chatData = chat.data();
    const history = chatData?.messages || [];

    // Initialize Gemini chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
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

async function processRelationshipData(message: string, history: any[]) {
  const relationshipPrompt = `
    Analyze the following conversation for relationship information:
    ${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    Current message: ${message}
    
    Extract and structure the following information:
    1. People mentioned (names, ages, gender, descriptions)
    2. Relationships between people
    3. Interactions or events between people
    4. Emotional states or sentiments
    
    Return the data in a structured format matching our graph schema.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const result = await model.generateContent(relationshipPrompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error processing relationship data:', error);
    return null;
  }
}

async function updateGraphData(newData: any, userId: string) {
  const graphRef = db.collection('relationships').doc(userId);
  const graphDoc = await graphRef.get();
  
  let currentData = graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
  const merged = mergeRelationshipData(currentData, newData);
  
  await graphRef.set(merged);
  return merged;
}

async function getGraphData(userId: string) {
  const graphRef = db.collection('relationships').doc(userId);
  const graphDoc = await graphRef.get();
  
  return graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
}

function mergeRelationshipData(currentData: any, newData: any) {
  const merged = { ...currentData };

  // Merge nodes
  if (newData.nodes) {
    newData.nodes.forEach((newNode: any) => {
      const existingNodeIndex = merged.nodes.findIndex((node: any) => node.id === newNode.id);
      if (existingNodeIndex >= 0) {
        merged.nodes[existingNodeIndex] = {
          ...merged.nodes[existingNodeIndex],
          ...newNode,
          details: {
            ...merged.nodes[existingNodeIndex].details,
            ...newNode.details,
            lastUpdated: new Date().toISOString()
          }
        };
      } else {
        merged.nodes.push({
          ...newNode,
          details: {
            ...newNode.details,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    });
  }

  // Merge links
  if (newData.links) {
    newData.links.forEach((newLink: any) => {
      const existingLinkIndex = merged.links.findIndex((link: any) => 
        link.source === newLink.source && link.target === newLink.target
      );
      if (existingLinkIndex >= 0) {
        merged.links[existingLinkIndex] = {
          ...merged.links[existingLinkIndex],
          ...newLink,
          details: {
            ...merged.links[existingLinkIndex].details,
            ...newLink.details,
            lastUpdated: new Date().toISOString()
          }
        };
      } else {
        merged.links.push({
          ...newLink,
          details: {
            ...newLink.details,
            lastUpdated: new Date().toISOString()
          }
        });
      }
    });
  }

  merged.metadata = {
    lastUpdated: new Date().toISOString(),
    version: "1.0"
  };

  return merged;
}

// Suggestions endpoint
export const getSuggestions = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const prompt = `Generate 4 conversation starter suggestions for a relationship advice chatbot. 
    Each suggestion should be focused on personal growth and relationships.
    Format the response as a JSON array with objects containing:
    - id (string)
    - text (the suggestion, max 50 chars)
    - icon (a single relevant emoji)`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = JSON.parse(response.text());

    return {
      suggestions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating suggestions:', error);
    throw new functions.https.HttpsError('internal', 'Error generating suggestions');
  }
});
