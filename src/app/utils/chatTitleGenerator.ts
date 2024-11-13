export interface ChatEntry {
  id: string;
  chatId: string;
  userId: string;
  createdAt: string;
  lastUpdated: string;
  messages: Array<{role: string, content: string, timestamp: string}>;
  messageCount: number;
}

export const generateChatTitles = (chats: ChatEntry[]): ChatEntry[] => {
  // Group chats by date
  const chatsByDate: { [key: string]: ChatEntry[] } = {};
  
  chats.forEach(chat => {
    const date = new Date(chat.createdAt);
    const dateKey = date.toLocaleDateString();
    
    if (!chatsByDate[dateKey]) {
      chatsByDate[dateKey] = [];
    }
    chatsByDate[dateKey].push(chat);
  });

  // Sort and assign titles
  return Object.keys(chatsByDate).flatMap((dateKey) => {
    const dateSortedChats = chatsByDate[dateKey].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return dateSortedChats.map((chat, chatIndex) => {
      const date = new Date(chat.createdAt);
      const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const titleSuffix = dateSortedChats.length > 1 
        ? ` (Chat ${chatIndex + 1})` 
        : '';
      
      // Generate a dynamic title based on the first user message
      const firstUserMessage = chat.messages.find(msg => msg.role === 'user')?.content || 'New Conversation';
      const truncatedMessage = firstUserMessage.length > 50 
        ? firstUserMessage.substring(0, 50) + '...' 
        : firstUserMessage;
      
      return {
        ...chat,
        title: truncatedMessage
      };
    });
  });
};
