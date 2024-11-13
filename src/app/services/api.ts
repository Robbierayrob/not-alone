export const API_BASE_URL = 'http://localhost:3001';
export const CLOUD_FUNCTION_URL = 'https://processchat-qpos73qvxq-uc.a.run.app';
export const LOCAL_FUNCTION_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/processChat';
export const GET_CHAT_HISTORY_URL = 'http://127.0.0.1:5001/notalone-de4fc/us-central1/getChatHistory';

import { generateChatTitles } from '../utils/chatTitleGenerator';

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

  async fetchGraphData(userId: string, token: string, chatId: string) {
    try {
      // Detailed request configuration logging
      console.group('🔍 fetchGraphData Detailed Diagnostics');
      
      if (!token) {
        console.error('❌ No authentication token');
        throw new Error('Authentication token is required');
      }

      if (!userId) {
        console.error('❌ No user ID provided');
        throw new Error('User ID is required');
      }

      const requestConfig = {
        url: 'http://127.0.0.1:5001/notalone-de4fc/us-central1/saveProfileHistory',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: {
          data: {
            userId: userId,
            chatId: chatId
          }
        }
      };

      // Perform fetch with enhanced error tracking
      const response = await fetch(requestConfig.url, {
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
        console.log('🔍 Raw Full Response:', rawResponse);
        const parsedResponse = JSON.parse(rawResponse);
        console.log('🔍 Parsed Full Response:', JSON.stringify(parsedResponse, null, 2));
        responseData = parsedResponse.result; // Extract from result object
        console.log('🔍 Extracted Full Result:', JSON.stringify(responseData, null, 2));
      } catch (parseError) {
        console.error('❌ JSON Parsing Error', {
          error: parseError,
          responseText: await response.text()
        });
        throw new Error('Failed to parse response JSON');
      }

      // Validate response structure
      if (!responseData) {
        console.warn('⚠️ Unexpected Response Structure', {
          responseData,
          rawKeys: responseData ? Object.keys(responseData) : 'No keys'
        });
        return { 
          nodes: [], 
          links: [], 
          metadata: {}, 
          userId: null, 
          fullRawData: null 
        };
      }

      console.log('✅ Full Profile History Data Retrieved', {
        totalNodes: responseData.nodes?.length || 0,
        totalLinks: responseData.links?.length || 0,
        metadata: responseData.metadata,
        userId: responseData.userId
      });

      console.groupEnd();

      return {
        nodes: responseData.nodes || [],
        links: responseData.links || [],
        metadata: responseData.metadata || {},
        userId: responseData.userId || null,
        fullRawData: responseData  // Include the entire raw data for comprehensive access
      };
    } catch (error) {
      console.error('❌ Complete fetchGraphData Error', {
        errorName: error instanceof Error ? error.name : 'Unknown Error',
        errorMessage: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      console.groupEnd();
      throw error;
    }
  },

  // Chat history related API calls
  // Removed inline title generation method

  loadChats: async (userId: string, token: string) => {
    try {
      // Extensive pre-request logging
      console.group('🔍 loadChats Detailed Diagnostics');
      
      // Ensure consistent chat object structure
      const normalizeChats = (chats: { chatId: any; id: any; }[]) => chats.map((chat: { chatId: any; id: any; }) => ({
        ...chat,
        chatId: chat.chatId || chat.id,  // Ensure chatId exists
        id: undefined  // Remove potential duplicate id
      }));
    
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

      // Generate meaningful titles using utility function
      const chatHistoriesWithTitles = generateChatTitles(responseData.chatHistories)
        .map(chat => ({
          ...chat,
          chatId: chat.chatId || chat.id,  // Ensure chatId exists
          id: undefined  // Remove potential duplicate id
        }));

      console.log('✅ Chat Histories Retrieved', {
        totalChats: chatHistoriesWithTitles.length,
        chatIds: chatHistoriesWithTitles.map((chat: any) => chat.chatId),
        titles: chatHistoriesWithTitles.map((chat: any) => chat.title)
      });

      console.groupEnd();

      // Return chat histories with generated titles and normalized structure
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

  // New method to load specific chat messages
  loadChatMessages: async (userId: string, token: string, chatId: string) => {
    try {
      console.log('🔍 Loading messages for chat:', chatId);

      const response = await fetch(GET_CHAT_HISTORY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            userId: userId,
            chatId: chatId
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      const chatHistories = responseData.result.chatHistories;

      // Find the specific chat by chatId
      const chatHistory = chatHistories.find((chat: any) => chat.chatId === chatId);

      if (!chatHistory) {
        console.error('❌ No chat found with ID:', chatId);
        return [];
      }

      console.log('✅ Chat Messages Retrieved', {
        chatId,
        messageCount: chatHistory.messages.length
      });

      // Sort messages by timestamp to ensure chronological order
      const sortedMessages = chatHistory.messages.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return sortedMessages;
    } catch (error) {
      console.error('❌ Error loading chat messages:', error);
      throw error;
    }
  },

  

  async deleteChat(userId: string, token: string, chatId: string) {
    try {
      console.log('🗑️ Attempting to delete chat:', {
        userId,
        chatId,
        tokenProvided: !!token
      });

      if (!token) {
        console.error('❌ No authentication token');
        throw new Error('Authentication token is required');
      }

      const response = await fetch(LOCAL_FUNCTION_URL.replace('processChat', 'deleteChatHistory'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            userId,
            chatId
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete Chat Error Response', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`HTTP Error: ${response.status} - ${errorText || 'Unknown error'}`);
      }

      const responseData = await response.json();

      console.log('✅ Chat Deletion Response:', {
        success: responseData.result?.success,
        message: responseData.result?.message,
        chatId: responseData.result?.chatId
      });

      return responseData.result;
    } catch (error) {
      console.error('❌ Complete deleteChat Error', {
        errorName: error instanceof Error ? error.name : 'Unknown Error',
        errorMessage: error instanceof Error ? error.message : error,
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  }
};
