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
        className="flex-1 overflow-y-auto px-4 md:px-8 py-6 relative z-10 flex flex-col-reverse"
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

      <div className="border-t border-gray-200 p-4 relative z-10">
        <form onSubmit={onSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
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
    </>
  );
}
