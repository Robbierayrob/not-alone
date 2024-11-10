'use client';

import { useState, FormEvent, useRef, useEffect, useMemo } from 'react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import GraphView from '../components/GraphView';
import GraphSidebar from '../components/GraphSidebar';
import GraphModal from '../components/GraphModal';
import ChatHistorySidebar from '../components/ChatHistorySidebar';
import ProfileSidebar from '../components/ProfileSidebar';
import ChatBox from '../components/ChatBox';
import SuggestionCards from '../components/SuggestionCards';
import WelcomeMessage from '../components/WelcomeMessage';


export default function DiaryPage() {
  // State management
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isGraphViewOpen, setIsGraphViewOpen] = useState(false);
  const [isGraphModalOpen, setIsGraphModalOpen] = useState(false);
  const [graphData, setGraphData] = useState({
    nodes: [],
    links: []
  });

  const [currentChatId, setCurrentChatId] = useState('default-chat');
  
  // Load initial graph data and handle graph view state
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: '',
            chatId: currentChatId
          }),
        });
        const data = await response.json();
        if (data.graphData) {
          setGraphData(data.graphData);
        }
      } catch (error) {
        console.error('Error fetching graph data:', error);
      }
    };
    fetchGraphData();
  }, [currentChatId]);
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
    setShowSuggestions(false);
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
        if (data.graphData) {
          setGraphData(data.graphData);
        }
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

  const toggleGraphView = () => {
    setIsGraphViewOpen(!isGraphViewOpen);
  };

  const toggleGraphModal = () => {
    setIsGraphModalOpen(!isGraphModalOpen);
  }

  return (
    <main>
      <div className="h-screen flex relative">
        <ProfileSidebar
          isOpen={isProfileSidebarOpen}
          profiles={graphData.nodes}
        />
        
        <ChatHistorySidebar 
          isSidebarOpen={isSidebarOpen}
          chats={chats}
          currentChatId={currentChatId}
          onCreateNewChat={createNewChat}
          onChatSelect={setCurrentChatId}
          onDeleteChat={deleteChat}
        />
  
        {/* Main chat area */}
        <div className={`flex-1 flex flex-col relative transition-all duration-300 ${
          isGraphViewOpen ? 'mr-[600px]' : ''
        }`}>
          {/* Graph View Toggle Button */}
          <div className="fixed right-4 top-20 flex flex-col gap-2 z-50">
            <button
              onClick={toggleGraphModal}
              className="p-2 rounded-lg shadow-md bg-white hover:bg-gray-100 transition-all duration-300 border-2 border-transparent"
              aria-label="Expand graph view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            </button>
            <button 
              onClick={toggleGraphView}
              className={`p-2 rounded-lg shadow-md transition-all duration-300 ${
                isGraphViewOpen 
                  ? 'bg-primary text-white hover:bg-primary/90 border-2 border-white' 
                  : 'bg-white hover:bg-gray-100 border-2 border-transparent'
              }`}
              aria-label={isGraphViewOpen ? "Close graph view" : "Open graph view"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
              </svg>
            </button>
          </div>
  
          {/* Floating sidebar toggles */}
          <div className={`fixed top-20 z-50 flex flex-col gap-2 transition-all duration-300 ${
            isSidebarOpen && isProfileSidebarOpen ? 'left-[532px]' : 
            isSidebarOpen ? 'left-[268px]' : 
            isProfileSidebarOpen ? 'left-[268px]' : 
            'left-4'
          }`}>
            <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-lg shadow-md transition-all duration-300 ${
                isSidebarOpen 
                  ? 'bg-primary text-white hover:bg-primary/90 border-2 border-white' 
                  : 'bg-white hover:bg-gray-100 border-2 border-transparent'
              }`}
              aria-label={isSidebarOpen ? "Close chat history" : "Open chat history"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <button 
              onClick={() => setIsProfileSidebarOpen(!isProfileSidebarOpen)}
              className={`p-2 rounded-lg shadow-md transition-all duration-300 ${
                isProfileSidebarOpen 
                  ? 'bg-primary text-white hover:bg-primary/90 border-2 border-white' 
                  : 'bg-white hover:bg-gray-100 border-2 border-transparent'
              }`}
              aria-label={isProfileSidebarOpen ? "Close profiles" : "Open profiles"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </button>
          </div>
  
          {/* Pulsating Circle */}
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-30'}`}>
            <div className="pulsating-circle"></div>
          </div>
  
          <div className="flex-1 relative">
            <ChatBox
              messages={messages}
              input={input}
              isLoading={isLoading}
              onInputChange={setInput}
              onSubmit={handleSubmit}
              isSidebarOpen={isSidebarOpen}
              isProfileSidebarOpen={isProfileSidebarOpen}
            />
            
            {messages.length === 0 && (
              <>
                <WelcomeMessage 
                  isSidebarOpen={isSidebarOpen} 
                  isProfileSidebarOpen={isProfileSidebarOpen}
                  isGraphViewOpen={isGraphViewOpen}
                />
                <SuggestionCards 
                  isVisible={true}
                  isSidebarOpen={isSidebarOpen}
                  isProfileSidebarOpen={isProfileSidebarOpen}
                  isGraphViewOpen={isGraphViewOpen}
                  onSuggestionClick={(text) => {
                    const userMessage = { role: 'user', content: text };
                    setMessages(prev => [...prev, userMessage]);
                    setShowSuggestions(false);
                    setIsLoading(true);
  
                    fetch('http://localhost:3001/api/chat', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        message: text,
                        chatId: currentChatId
                      }),
                    })
                      .then(response => response.json())
                      .then(data => {
                        if (data.message) {
                          setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
                          if (data.graphData) {
                            setGraphData(data.graphData);
                          }
                        }
                      })
                      .catch(error => console.error('Error:', error))
                      .finally(() => setIsLoading(false));
                  }} 
                />
              </>
            )}
          </div>
  
          <GraphSidebar isOpen={isGraphViewOpen} graphData={graphData} />
          <GraphModal 
            isOpen={isGraphModalOpen}
            onClose={() => setIsGraphModalOpen(false)}
            graphData={graphData}
          />
        </div>
      </div>
    </main>
  );
}
