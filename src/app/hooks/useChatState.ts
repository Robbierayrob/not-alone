'use client';

import { useState, useCallback, useEffect } from 'react';
import { User } from 'firebase/auth';
import { apiService } from '../services/api';

// Enhanced type definitions
interface ChatMessage {
  role: string;
  content: string;
  isTyping?: boolean;
}

interface ChatEntry {
  id: string;
  chatId: string;
  userId: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

// Extend User type to include custom properties
interface ExtendedUser extends User {
  uid: string;
  accessToken?: string;
}

// Comprehensive chat state management hook
export function useChatState(user: ExtendedUser | null, userToken: string | null) {
  // State for managing chat-related data
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<ChatEntry[]>([]);
  const [currentChatId, setCurrentChatId] = useState('default-chat');
  const [isLoading, setIsLoading] = useState(false);

  // Load chat history
  const loadChats = useCallback(async () => {
    try {
      if (user && userToken) {
        console.log('🔄 Loading Chats for User:', user.uid);
        const data = await apiService.loadChats(user.uid, userToken);
        
        // Sort chats by creation time (newest first)
        const transformedChats: ChatEntry[] = data.map(chat => ({
          id: chat.id || chat.chatId,
          chatId: chat.chatId,
          userId: chat.userId,
          title: (chat as any).title || `Chat from ${new Date(chat.createdAt).toLocaleDateString()}`,
          createdAt: chat.createdAt,
          messages: chat.messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }))
        }));

        const sortedChats = transformedChats.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setChats(sortedChats);
        console.log('✅ Chats Loaded:', sortedChats.length);
        return sortedChats;
      }
      return [];
    } catch (error) {
      console.error('❌ Error Loading Chats:', error);
      return [];
    }
  }, [user, userToken]);

  // Create a new chat
  const createNewChat = useCallback(async () => {
    try {
      const chatId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆕 Creating New Chat:', chatId);
      
      setCurrentChatId(chatId);
      setMessages([]);
      
      await loadChats();
      return chatId;
    } catch (error) {
      console.error('❌ Error Creating Chat:', error);
      return 'default-chat';
    }
  }, [loadChats]);

  // Load messages for a specific chat
  const loadChatMessages = useCallback(async (chatId: string) => {
    try {
      if (user && userToken) {
        console.log('📬 Loading Messages for Chat:', chatId);
        const messages = await apiService.loadChatMessages(user.uid, userToken, chatId);
        
        setMessages(messages);
        setCurrentChatId(chatId);
        console.log('✅ Messages Loaded:', messages.length);
      }
    } catch (error) {
      console.error('❌ Error Loading Chat Messages:', error);
    }
  }, [user, userToken]);

  // Reset chat state
  const resetChatState = useCallback(() => {
    console.log('🔄 Resetting Chat State');
    setMessages([]);
    setCurrentChatId('default-chat');
    setChats([]);
  }, []);

  // Initial chat load effect
  useEffect(() => {
    if (user && userToken) {
      loadChats();
    }
  }, [user, userToken, loadChats]);

  return {
    messages,
    chats,
    currentChatId,
    isLoading,
    loadChats,
    createNewChat,
    loadChatMessages,
    resetChatState,
    setMessages,
    setChats,
    setCurrentChatId,
    setIsLoading
  };
}
