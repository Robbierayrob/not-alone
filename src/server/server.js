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

// Chat history store with file persistence
const CHAT_STORAGE_PATH = path.join(__dirname, 'chat_history.json');

// Load existing chat history or create new
let chatHistory = new Map();
try {
  if (fs.existsSync(CHAT_STORAGE_PATH)) {
    const data = JSON.parse(fs.readFileSync(CHAT_STORAGE_PATH, 'utf8'));
    chatHistory = new Map(Object.entries(data));
  }
} catch (error) {
  console.error('Error loading chat history:', error);
}

// Save chat history to file
const saveChatHistory = () => {
  const obj = Object.fromEntries(chatHistory);
  fs.writeFileSync(CHAT_STORAGE_PATH, JSON.stringify(obj, null, 2));
};

// Get all chat IDs
app.get('/api/chats', (req, res) => {
  const chats = Array.from(chatHistory.keys()).map(id => ({
    id,
    preview: chatHistory.get(id)[0]?.content || 'New Chat'
  }));
  res.json(chats);
});

// Create new chat
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
    const history = chatData.messages;
    
    // Initialize Gemini chat
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-002" });
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }))
    });

    // Get response from Gemini
    const result = await chat.sendMessage([{ text: message }]);
    const response = await result.response;
    const aiResponse = response.text();

    // Update history
    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: aiResponse });
    chatData.messages = history;
    chatHistory.set(chatId, chatData);
    saveChatHistory();

    res.json({ 
      message: aiResponse,
      chatId
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
