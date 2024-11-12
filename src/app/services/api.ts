export const API_BASE_URL = 'http://localhost:3001';
export const CLOUD_FUNCTION_URL = 'https://processchat-qpos73qvxq-uc.a.run.app';
export const LOCAL_FUNCTION_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/processChat';

export const apiService = {
  // Chat related API calls
  async sendMessage(message: string, token: string, chatId?: string) {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      console.log('🚀 Sending message to API:', {
        messageLength: message.length,
        chatId
      });

      const response = await fetch(LOCAL_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            message,
            chatId: chatId || `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      const data = await response.json();
      if (!data?.result?.result) {
        throw new Error('Invalid response format from server');
      }
      return data.result.result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error instanceof Error ? error : new Error('Failed to send message');
    }
  },

  async fetchGraphData(chatId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '',
          chatId
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching graph data:', error);
      throw error;
    }
  },

  // Chat history related API calls
  async loadChats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats`);
      return await response.json();
    } catch (error) {
      console.error('Error loading chats:', error);
      throw error;
    }
  },

  async createNewChat() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/new`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating new chat:', error);
      throw error;
    }
  },

  async deleteChat(chatId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }
};
