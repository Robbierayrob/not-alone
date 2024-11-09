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

const fs = require('fs');
const path = require('path');

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

    // Load graph data
    let graphData;
    try {
      const graphPath = path.join(__dirname, '..', 'server', 'chat-sessions', 'mock-relationships.json');
      graphData = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
      console.log('Successfully loaded graph data:', graphData);
    } catch (error) {
      console.error('Error loading graph data:', error);
      graphData = {
        nodes: [],
        links: []
      };
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
