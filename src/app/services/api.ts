export const API_BASE_URL = 'http://localhost:3001';
export const CLOUD_FUNCTION_URL = 'https://processchat-qpos73qvxq-uc.a.run.app';
export const LOCAL_FUNCTION_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/processChat';
export const GET_CHAT_HISTORY_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/getChatHistory';

export const apiService = {
  // Chat related API calls
  sendMessage: async (message: string, token: string, chatId?: string) => {
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
            chatId: chatId || undefined
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        
        // Special handling for 429 Too Many Requests
        if (response.status === 429) {
          return {
            error: "Too many requests. Please wait a moment and try again.",
            message: null
          };
        }
        
        throw new Error(errorData.error?.message || 'Failed to send message');
      }

      const data = await response.json();
      if (!data?.result?.result) {
        throw new Error('Invalid response format from server');
      }
      return data.result.result;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle 429 error specifically
      if (error instanceof Error && error.message.includes('429')) {
        return {
          error: "Too many requests. Please wait a moment and try again.",
          message: null
        };
      }
      
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
  // Helper function to generate meaningful chat titles
  private generateChatTitle = (chats: any[]): any[] => {
    // Group chats by date
    const chatsByDate: { [key: string]: any[] } = {};
    
    chats.forEach(chat => {
      const date = new Date(chat.createdAt);
      const dateKey = date.toLocaleDateString();
      
      if (!chatsByDate[dateKey]) {
        chatsByDate[dateKey] = [];
      }
      chatsByDate[dateKey].push(chat);
    });

    // Sort and assign titles
    return Object.keys(chatsByDate).flatMap((dateKey) => {
      const dateSortedChats = chatsByDate[dateKey].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return dateSortedChats.map((chat, chatIndex) => {
        const date = new Date(chat.createdAt);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const titleSuffix = dateSortedChats.length > 1 
          ? ` (Chat ${chatIndex + 1})` 
          : '';
        
        return {
          ...chat,
          title: `${date.toLocaleDateString()} at ${timeString}${titleSuffix}`
        };
      });
    });
  }

  loadChats: async (userId: string, token: string) => {
    try {
      // Extensive pre-request logging
      console.group('🔍 loadChats Detailed Diagnostics');
    
      if (!token) {
        console.error('❌ No authentication token');
        throw new Error('Authentication token is required');
      }

      if (!userId) {
        console.error('❌ No user ID provided');
        throw new Error('User ID is required');
      }

      // Detailed request configuration logging
      const requestConfig = {
        url: GET_CHAT_HISTORY_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: {
          data: {
            userId: userId,
            chatId: undefined
          }
        }
      };

      // Perform fetch with enhanced error tracking
      const response = await fetch(GET_CHAT_HISTORY_URL, {
        method: 'POST',
        headers: requestConfig.headers,
        body: JSON.stringify(requestConfig.body),
      });

      // Comprehensive error handling for non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error Response', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`HTTP Error: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      // Detailed response parsing
      let responseData;
      try {
        const rawResponse = await response.text();
        const parsedResponse = JSON.parse(rawResponse);
        responseData = parsedResponse.result; // Extract from result object
      } catch (parseError) {
        console.error('❌ JSON Parsing Error', {
          error: parseError,
          responseText: await response.text()
        });
        throw new Error('Failed to parse response JSON');
      }

      // Validate response structure
      if (!responseData || !responseData.chatHistories) {
        console.warn('⚠️ Unexpected Response Structure', {
          responseData,
          hasSuccess: responseData?.success,
          hasMessage: responseData?.message,
          rawKeys: responseData ? Object.keys(responseData) : 'No keys'
        });
        return [];
      }

      // Generate meaningful titles
      const chatHistoriesWithTitles = this.generateChatTitle(responseData.chatHistories);

      console.log('✅ Chat Histories Retrieved', {
        totalChats: chatHistoriesWithTitles.length,
        chatIds: chatHistoriesWithTitles.map((chat: any) => chat.chatId),
        titles: chatHistoriesWithTitles.map((chat: any) => chat.title)
      });

      console.groupEnd();

      // Return chat histories with generated titles
      return chatHistoriesWithTitles;
    } catch (error) {
      console.error('❌ Complete loadChats Error', {
        errorName: error instanceof Error ? error.name : 'Unknown Error',
        errorMessage: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      console.groupEnd();
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
