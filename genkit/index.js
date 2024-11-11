const functions = require('firebase-functions');
const { VertexAI } = require('@google-cloud/vertexai');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore
const db = getFirestore();

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT,
  location: 'us-central1',
});

// Helper function to process relationship data
async function processRelationshipData(message, history) {
  try {
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.0-pro',
    });

    const prompt = `
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

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    
    return JSON.parse(result.response.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error('Error processing relationship data:', error);
    return null;
  }
}

// Helper function to merge relationship data
function mergeRelationshipData(currentData, newData) {
  const merged = { ...currentData };

  if (newData.nodes) {
    newData.nodes.forEach(newNode => {
      const existingNodeIndex = merged.nodes?.findIndex(node => node.id === newNode.id) ?? -1;
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
        if (!merged.nodes) merged.nodes = [];
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

  if (newData.links) {
    if (!merged.links) merged.links = [];
    newData.links.forEach(newLink => {
      const existingLinkIndex = merged.links.findIndex(link => 
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

// Cloud Function to handle chat messages
exports.handleChat = functions.https.onCall(async (data, context) => {
  try {
    const { message, chatId } = data;
    
    // Get chat reference
    const chatRef = db.collection('chats').doc(chatId);
    const chatDoc = await chatRef.get();
    
    if (!chatDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Chat not found');
    }

    const chatData = chatDoc.data();
    const history = chatData.messages || [];

    // Initialize Vertex AI chat
    const model = vertexAI.preview.getGenerativeModel({
      model: 'gemini-1.0-pro',
    });

    const systemPrompt = `You are an AI assistant focused on helping users improve their relationships and personal growth. 
    As you engage in conversation, analyze the text to identify:
    1. Entities (people, places, objects, concepts)
    2. Actions/interactions between entities
    3. Emotional states and relationship dynamics
    4. Key events and their impact

    Format your internal understanding as a graph structure where:
    - Nodes represent entities, emotions, and key concepts
    - Edges represent relationships, actions, and influences between nodes

    Provide empathetic, constructive responses that help users:
    - Understand relationship patterns
    - Identify areas for growth
    - Develop healthy communication strategies
    - Build stronger connections

    Always maintain a supportive, non-judgmental tone.`;

    let aiResponse;
    
    if (!message && !history.length) {
      // Handle initial system prompt
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      });
      aiResponse = result.response.candidates[0].content.parts[0].text;
    } else if (!message) {
      // Return existing graph data
      const graphDoc = await db.collection('relationships').doc('graphData').get();
      return { 
        message: '',
        chatId,
        graphData: graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] }
      };
    } else {
      // Normal message flow
      const chat = await model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          parts: [{ text: msg.content }],
        })),
      });

      const result = await chat.sendMessage(message);
      aiResponse = result.response.candidates[0].content.parts[0].text;
    }

    // Update chat history
    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    ];

    await chatRef.update({
      messages: updatedHistory,
      lastUpdated: new Date().toISOString()
    });

    // Process relationship data
    const relationshipData = await processRelationshipData(message, updatedHistory);
    
    // Update graph data
    const graphRef = db.collection('relationships').doc('graphData');
    const graphDoc = await graphRef.get();
    
    let graphData;
    if (relationshipData) {
      const currentData = graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
      graphData = mergeRelationshipData(currentData, relationshipData);
      await graphRef.set(graphData);
    } else {
      graphData = graphDoc.exists ? graphDoc.data() : { nodes: [], links: [] };
    }

    return { 
      message: aiResponse,
      chatId,
      graphData
    };
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('internal', 'Something went wrong', error);
  }
});

// Cloud Function to get all chats
exports.getChats = functions.https.onCall(async (data, context) => {
  try {
    const chatsSnapshot = await db.collection('chats').orderBy('createdAt', 'desc').get();
    return chatsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error fetching chats', error);
  }
});

// Cloud Function to create new chat
exports.createChat = functions.https.onCall(async (data, context) => {
  try {
    const chatRef = db.collection('chats').doc();
    const timestamp = new Date().toISOString();
    
    await chatRef.set({
      title: 'New Chat',
      createdAt: timestamp,
      messages: []
    });

    return {
      chatId: chatRef.id,
      title: 'New Chat',
      createdAt: timestamp
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error creating chat', error);
  }
});

// Cloud Function to delete chat
exports.deleteChat = functions.https.onCall(async (data, context) => {
  try {
    const { chatId } = data;
    await db.collection('chats').doc(chatId).delete();
    
    const remainingChats = await db.collection('chats').orderBy('createdAt', 'desc').get();
    return {
      success: true,
      chats: remainingChats.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Error deleting chat', error);
  }
});

// Cloud Function to get suggestions
exports.getSuggestions = functions.https.onCall(async (data, context) => {
  // For now, returning static suggestions
  return {
    suggestions: [
      { id: '1', text: 'How can I improve communication?', icon: '💭' },
      { id: '2', text: 'Help me resolve a conflict', icon: '🤝' },
      { id: '3', text: 'Understanding my emotions', icon: '❤️' },
      { id: '4', text: 'Building trust in relationships', icon: '🔒' }
    ],
    timestamp: new Date().toISOString()
  };
});
