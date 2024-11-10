// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fs = require('fs').promises;
const path = require('path');

// Firebase setup would go here:
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
// const firebaseConfig = { ... };
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// Mock chat data
const mockChats = [
  {
    id: 'chat-1',
    title: 'First Chat',
    createdAt: '2024-01-01T00:00:00.000Z',
    messages: []
  },
  {
    id: 'chat-2',
    title: 'Second Chat',
    createdAt: '2024-01-02T00:00:00.000Z',
    messages: []
  }
];

let chatHistory = new Map(mockChats.map(chat => [chat.id, chat]));

// Mock save function (no-op for now)
const saveChatHistory = () => {};

// Get all chats
app.get('/api/chats', (req, res) => {
  const chats = Array.from(chatHistory.values());
  res.json(chats);
});

// Create new chat
// Delete chat
app.delete('/api/chats/:chatId', (req, res) => {
  const { chatId } = req.params;
  if (chatHistory.has(chatId)) {
    chatHistory.delete(chatId);
    saveChatHistory();
    // Force immediate update of chat list
    const remainingChats = Array.from(chatHistory.values());
    res.json({ success: true, chats: remainingChats });
  } else {
    res.status(404).json({ error: 'Chat not found' });
  }
});

app.post('/api/chats/new', (req, res) => {
  const chatId = `chat-${Date.now()}`;
  const timestamp = new Date().toISOString();
  chatHistory.set(chatId, {
    id: chatId,
    title: 'New Chat',
    createdAt: timestamp,
    messages: []
  });
  saveChatHistory();
  res.json({ chatId, title: 'New Chat', createdAt: timestamp });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    if (!chatHistory.has(chatId)) {
      chatHistory.set(chatId, []);
    }
    const chatData = chatHistory.get(chatId);
    if (!chatData) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    const history = chatData.messages || [];
    
    // Initialize Gemini chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
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

    const chat = model.startChat({
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

    // Get response from Gemini
    if (!message && !history.length) {
      // If it's the first message and empty, use system prompt
      const result = await chat.sendMessage(systemPrompt);
      const response = await result.response;
      const aiResponse = response.text();
      return res.json({ 
        message: aiResponse,
        chatId,
        graphData
      });
    } else if (!message) {
      // If message is empty but we have history, just return graph data
      return res.json({ 
        message: '',
        chatId,
        graphData
      });
    }
    
    // Normal message flow
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Update history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: aiResponse });
    chatData.messages = history;
    chatHistory.set(chatId, chatData);
    saveChatHistory();

    // Process message for relationship data
    const relationshipData = await processRelationshipData(message, history);
    
    // Update graph data
    if (relationshipData) {
      const graphPath = path.join(__dirname, '..', 'server', 'chat-sessions', 'mock-relationships.json');
      try {
        const currentData = JSON.parse(await fs.readFile(graphPath, 'utf8'));
        const updatedData = mergeRelationshipData(currentData, relationshipData);
        await fs.writeFile(graphPath, JSON.stringify(updatedData, null, 2));
        graphData = updatedData;
        
        // Firebase version would be:
        // await setDoc(doc(db, 'relationships', 'graphData'), updatedData);
        
      } catch (error) {
        console.error('Error updating graph data:', error);
        graphData = {
          nodes: [],
          links: []
        };
      }
    } else {
      // Load existing graph data
      try {
        const graphPath = path.join(__dirname, '..', 'server', 'chat-sessions', 'mock-relationships.json');
        graphData = JSON.parse(await fs.readFile(graphPath, 'utf8'));
        
        // Firebase version would be:
        // const docSnap = await getDoc(doc(db, 'relationships', 'graphData'));
        // graphData = docSnap.exists() ? docSnap.data() : { nodes: [], links: [] };
        
      } catch (error) {
        console.error('Error loading graph data:', error);
        graphData = {
          nodes: [],
          links: []
        };
      }
    }

    res.json({ 
      message: aiResponse,
      chatId,
      graphData
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
async function processRelationshipData(message, history) {
  // Extract relationship information from the message using the LLM
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
    const extractedData = JSON.parse(response.text());
    return extractedData;
  } catch (error) {
    console.error('Error processing relationship data:', error);
    return null;
  }
}

function mergeRelationshipData(currentData, newData) {
  const merged = { ...currentData };

  // Merge nodes
  if (newData.nodes) {
    newData.nodes.forEach(newNode => {
      const existingNodeIndex = merged.nodes.findIndex(node => node.id === newNode.id);
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
