"use client";

import { useEffect, useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ChatHistorySidebarProps {
  isSidebarOpen: boolean;
  chats: Array<{
    id: string;
    chatId: string;
    userId: string;  // Add userId to the chat object
    title: string;
    createdAt: string;
    messages: Array<{role: string, content: string}>;
  }>;
  currentChatId: string;
  onCreateNewChat: () => Promise<string>;
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (userId: string, token: string, chatId: string) => void;
  onLoadChats?: () => void;
  onLoadChatMessages?: (chatId: string) => void;
  userId: string;  // Make userId required
  token: string;   // Make token required
}

export default function ChatHistorySidebar({
  isSidebarOpen,
  chats,
  currentChatId,
  onCreateNewChat,
  onChatSelect,
  onDeleteChat,
  onLoadChats,  // New optional prop
  onLoadChatMessages  // New optional prop
}: ChatHistorySidebarProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Trigger chat loading when component mounts or sidebar opens
  useEffect(() => {
    if (isSidebarOpen && onLoadChats) {
      console.log('🔄 Triggering chat load from sidebar');
      onLoadChats();
    }
  }, [isSidebarOpen, onLoadChats]);

  // Prevent setState during render
  const handleDeleteClick = (chatId: string) => {
    setDeleteConfirmation(chatId);
  };

  return (
    <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
      <div className="p-4">
        <div className="mb-4">
          <button 
            onClick={async () => {
              const newChatId = await onCreateNewChat();
              console.log('🆕 New chat created:', newChatId);
              if (onLoadChats) onLoadChats();  // Reload chats after creating new chat
            }}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-left"
          >
            + New Chat
          </button>
        </div>
        <div className="space-y-2">
          {chats.map((chat, index) => {
            // Ensure chatId is always available, fallback to a generated ID if not
            const chatId = chat.chatId || chat.id || `fallback-chat-${index}`;
          
            return (
              <div key={`${chatId}-${index}`} className="relative group">
                <button
                  onClick={() => {
                    onChatSelect(chatId);
                    // If onLoadChatMessages is provided, load messages for this chat
                    if (onLoadChatMessages) {
                      onLoadChatMessages(chatId);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 
                    ${currentChatId === chatId ? 'bg-gray-100' : ''} transition-colors`}
                >
                  <div className="flex flex-col">
                    <span className="chat-history-title">
                      {chat.title || `Chat ${index + 1}`}
                    </span>
                    <span className="chat-history-subtitle">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(chatId);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 
                    p-2 text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}

          {deleteConfirmation && (
            <DeleteConfirmationModal
              key={`delete-${deleteConfirmation}`}
              isOpen={true}
              onClose={() => setDeleteConfirmation(null)}
              onConfirm={() => {
                if (deleteConfirmation) {
                  onDeleteChat(userId, token, deleteConfirmation);
                  setDeleteConfirmation(null);
                }
              }}
              userId={userId}
              token={token}
            />
          )}
        </div>
      </div>
    </div>
  );
}
