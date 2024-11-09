"use client";

import { useState, FormEvent, useRef, useEffect } from 'react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import GraphView from '../components/GraphView';

export default function DairyPage() {
  // State management
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false);
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  });
  const [currentChatId, setCurrentChatId] = useState('default-chat');
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [chats, setChats] = useState<Array<{
    id: string;
    title: string;
    createdAt: string;
    messages: Array<{role: string, content: string}>;
  }>>([]);
  
  // Refs for scrolling
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll handling
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Load chat history
  const loadChats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  // Create new chat
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/chats/${chatId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (currentChatId === chatId) {
        setCurrentChatId('default-chat');
        setMessages([]);
      }
      setChats(data.chats);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting chat:', error instanceof Error ? error.message : String(error));
      setDeleteConfirmation(null);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/chats/new', {
        method: 'POST'
      });
      const data = await response.json();
      setCurrentChatId(data.chatId);
      setMessages([]);
      loadChats();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadChats();
    scrollToBottom();
  }, []);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          chatId: currentChatId
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-gray-50 border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <div className="mb-4">
            <button 
              onClick={createNewChat}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-left"
            >
              + New Chat
            </button>
          </div>
          <div className="space-y-2">
            {chats.map((chat) => (
              <div key={chat.id} className="relative group">
                <button
                  onClick={() => setCurrentChatId(chat.id)}
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
                onConfirm={() => deleteConfirmation && deleteChat(deleteConfirmation)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        {/* Graph View Toggle Button */}
        <button 
          onClick={() => setIsGraphViewOpen(!isGraphViewOpen)}
          className={`fixed right-4 top-20 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-all duration-300 z-50 ${isGraphViewOpen ? 'bg-primary text-white hover:bg-primary/90' : ''}`}
          aria-label={isGraphViewOpen ? "Close graph view" : "Open graph view"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          </button>
        )}
        {/* Floating sidebar toggle */}
        <button 
          onClick={toggleSidebar}
          className={`fixed ${isSidebarOpen ? 'left-[260px]' : 'left-4'} top-20 p-2 rounded-lg bg-white shadow-md hover:bg-gray-100 transition-all duration-300 z-50`}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

        {/* Pulsating Circle */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-30'}`}>
          <div className="pulsating-circle"></div>
        </div>

        {/* Chat messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-2 py-4 relative z-10 flex flex-col-reverse"
        >
          <div className="w-full max-w-5xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
                  message.role === 'user' 
                    ? 'bg-primary text-white ml-auto' 
                    : 'bg-gray-100 mr-auto'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 relative z-10">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Start your diary..."
              className="w-full p-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-pink-200 outline-none shadow-sm hover:shadow-md transition-all duration-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Graph View Sidebar */}
      {graphData.nodes.length > 0 && (
        <div className={`${isGraphViewOpen ? 'w-96' : 'w-0'} bg-gray-50 border-l border-gray-200 transition-all duration-300 overflow-hidden`}>
          <div className="h-full w-full">
            <GraphView graphData={graphData} />
          </div>
        </div>
      )}
    </div>
  );
}
