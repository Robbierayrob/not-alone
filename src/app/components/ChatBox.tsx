"use client";

import { FormEvent, useRef, useEffect } from 'react';

interface ChatBoxProps {
  messages: Array<{role: string, content: string}>;
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function ChatBox({
  messages,
  input,
  isLoading,
  onInputChange,
  onSubmit
}: ChatBoxProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-4 md:px-8 py-6 relative z-10 flex flex-col-reverse"
      >
        <div className="w-full max-w-5xl mx-auto">
          {messages.map((message, index) => (
            <div key={index} className={`mb-8 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-4 rounded-lg max-w-[85%] shadow-sm ${
                message.role === 'user' 
                  ? 'bg-primary text-white ml-auto' 
                  : 'bg-gray-100 mr-auto'
              }`}>
                <span className={message.role === 'assistant' ? 'typing-animation' : ''}>
                  {message.content}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 md:p-6 relative z-10 flex items-center">
        <div className="flex gap-3 mr-6">
          <button 
            aria-label="Profile settings"
            className="p-2.5 md:p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button 
            aria-label="Get support"
            className="p-2.5 md:p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/20 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7 text-gray-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Examine your relationships..."
            className="w-full max-w-4xl p-4 md:p-5 pr-14 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-pink-200 outline-none shadow-sm hover:shadow-md transition-all duration-300 text-base"
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
    </>
  );
}
