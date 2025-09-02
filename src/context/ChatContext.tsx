'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { chat } from '@/ai/flows/chat';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatThread {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  currentChat: ChatThread | null;
  chatThreads: ChatThread[];
  createNewChat: () => string;
  sendMessage: (content: string, chatId: string) => void;
  loadChat: (chatId: string) => void;
  clearCurrentChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentChat, setCurrentChat] = useState<ChatThread | null>(null);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string>(() => `session_${Date.now()}`);

  const createNewChat = (): string => {
    const newChatId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newChat: ChatThread = {
      id: newChatId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentChat(newChat);
    setChatThreads(prev => [newChat, ...prev].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    return newChatId;
  };

  const sendMessage = async (content: string, chatId: string) => {
    let chatToUpdate = chatThreads.find(chat => chat.id === chatId);
    if (!chatToUpdate) {
        // This case should ideally not happen if createNewChat is called first
        // But as a fallback, create it.
        const newChat: ChatThread = {
            id: chatId,
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        setChatThreads(prev => [newChat, ...prev]);
        chatToUpdate = newChat;
    }


    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    const updatedChatWithMessage = {
      ...chatToUpdate,
      messages: [...chatToUpdate.messages, userMessage],
      title: chatToUpdate.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : chatToUpdate.title,
      updatedAt: new Date()
    };

    setCurrentChat(updatedChatWithMessage);
    
    setChatThreads(prev => {
        const updated = prev.map(c => c.id === chatId ? updatedChatWithMessage : c);
        return updated.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    const { response, sessionId: newSessionId } = await chat(
        content,
        sessionId
      );
    setSessionId(newSessionId);

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date()
    };

    const finalChat = {
      ...updatedChatWithMessage,
      messages: [...updatedChatWithMessage.messages, aiResponse],
      updatedAt: new Date()
    };

    setCurrentChat(finalChat);
    setChatThreads(prev => {
        const updated = prev.map(c => c.id === chatId ? finalChat : c);
        return updated.sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });
  };

  const loadChat = (chatId: string) => {
    let chat = chatThreads.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
    } else {
      // Create a new one if it doesn't exist in state.
      // This can happen if the user navigates directly to a chat URL
      // that isn't in the local state.
      const newChat: ChatThread = {
        id: chatId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCurrentChat(newChat);
      setChatThreads(prev => [newChat, ...prev].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()));
    }
  };

  const clearCurrentChat = () => {
    setCurrentChat(null);
  };

  return (
    <ChatContext.Provider value={{
      currentChat,
      chatThreads,
      createNewChat,
      sendMessage,
      loadChat,
      clearCurrentChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};
