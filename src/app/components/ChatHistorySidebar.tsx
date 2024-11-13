"use client";

import { useEffect, useState } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface ChatHistorySidebarProps {
  isSidebarOpen: boolean;
  chats: Array<{
    id: string;
    title: string;
    createdAt: string;
    messages: Array<{role: string, content: string}>;
  }>;
  currentChatId: string;
  onCreateNewChat: () => Promise<string>;  // Changed to async function
  onChatSelect: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onLoadChats?: () => void;  // Optional callback to trigger chat loading
}

export default function ChatHistorySidebar({
  isSidebarOpen,
  chats,
  currentChatId,
  onCreateNewChat,
  onChatSelect,
  onDeleteChat,
  onLoadChats  // New optional prop
}: ChatHistorySidebarProps) {
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  // Trigger chat loading when component mounts or sidebar opens
  useEffect(() => {
    if (isSidebarOpen && onLoadChats) {
      console.log('🔄 Triggering chat load from sidebar');
      onLoadChats();
    }
  }, [isSidebarOpen, onLoadChats]);

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
          {chats.map((chat) => (
            <div key={chat.id} className="relative group">
              <button
                onClick={() => onChatSelect(chat.id)}
                className={`w-full px-4 py-3 rounded-lg text-left hover:bg-gray-100 
                  ${currentChatId === chat.id ? 'bg-gray-100' : ''} transition-colors`}
              >
                <div className="flex flex-col">
                  <span className="font-medium truncate">{chat.title}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmation(chat.id);
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
          ))}

          {deleteConfirmation && (
            <DeleteConfirmationModal
              key={deleteConfirmation}
              isOpen={true}
              onClose={() => setDeleteConfirmation(null)}
              onConfirm={() => {
                if (deleteConfirmation) {
                  onDeleteChat(deleteConfirmation);
                  setDeleteConfirmation(null);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
