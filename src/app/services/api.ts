export const API_BASE_URL = 'http://localhost:3001';
export const CLOUD_FUNCTION_URL = 'https://processchat-qpos73qvxq-uc.a.run.app';
export const LOCAL_FUNCTION_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/processChat';
export const GET_CHAT_HISTORY_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/getChatHistory';

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
  async loadChats(userId: string, token: string) {
    try {
      // Extensive pre-request logging
      console.group('🔍 loadChats Detailed Diagnostics');
      console.log('🔑 Input Validation', {
        userIdProvided: !!userId,
        userIdType: typeof userId,
        userIdLength: userId?.length,
        tokenProvided: !!token,
        tokenType: typeof token,
        tokenLength: token?.length
      });

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

      console.log('📡 Request Configuration', {
        url: requestConfig.url,
        method: requestConfig.method,
        bodyUserId: requestConfig.body.data.userId,
        bodyUserIdType: typeof requestConfig.body.data.userId
      });

      // Perform fetch with enhanced error tracking
      const response = await fetch(GET_CHAT_HISTORY_URL, {
        method: 'POST',
        headers: requestConfig.headers,
        body: JSON.stringify(requestConfig.body),
      });

      console.log('🌐 Response Details', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
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
        console.log('📦 Raw Response Text', rawResponse);
        
        responseData = JSON.parse(rawResponse);
        console.log('📦 Parsed Response Data', {
          responseType: typeof responseData,
          keys: Object.keys(responseData),
          chatHistoriesType: typeof responseData.chatHistories,
          chatHistoriesLength: responseData.chatHistories?.length,
          chatHistoriesContent: responseData.chatHistories
        });
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

      console.log('✅ Chat Histories Retrieved', {
        totalChats: responseData.chatHistories.length,
        chatIds: responseData.chatHistories.map((chat: any) => chat.chatId)
      });

      console.groupEnd();

      // Return chat histories or empty array
      return responseData.chatHistories || [];
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
