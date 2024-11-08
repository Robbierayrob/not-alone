"use client";

import { useState } from 'react';

export default function DairyPage() {
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
        <div className="mb-4">
          <button className="w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-left">
            + New Chat
          </button>
        </div>
        <div className="space-y-2">
          {/* Chat history would go here */}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        {/* Pulsating Circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pulsating-circle"></div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 relative z-10">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={`inline-block p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100'
              }`}>
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 relative z-10">
          <form className="max-w-4xl mx-auto relative">
            <input
              type="text"
              placeholder="Start your dairy..."
              className="w-full p-4 pr-12 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-pink-200 outline-none"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
