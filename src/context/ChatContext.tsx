'use client';
import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  confidence?: number;
  modulesUsed?: string[];
  citations?: unknown[];
  queryType?: string;
  isFallback?: boolean;
  error?: string;
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

    let lunaData: any = null;
    let lunaError: string | null = null;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content }),
      });

      const json = await response.json().catch(() => null);
      lunaData = json;

      if (!response.ok) {
        const message = json?.error || json?.message || `Luna request failed with status ${response.status}`;
        throw new Error(message);
      }

      if (!json || typeof json.response !== 'string') {
        throw new Error('Unexpected response format from Luna.');
      }
    } catch (error: any) {
      console.error('Luna chat request failed:', error);
      lunaError = error?.message ?? 'Unknown error connecting to Luna.';
      lunaData = lunaData || {
        response:
          "I'm having trouble reaching Luna right now, but I'm still here for you. Let's try again in a moment.",
        isFallback: true,
      };
      lunaData.error = lunaError;
    }

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content:
        typeof lunaData?.response === 'string'
          ? lunaData.response
          : "I'm having trouble reaching Luna right now, but I'm still here for you. Let's try again in a moment.",
      role: 'assistant',
      timestamp: new Date(),
    };

    if (typeof lunaData?.confidence === 'number') {
      aiResponse.confidence = lunaData.confidence;
    }

    if (Array.isArray(lunaData?.modules_used)) {
      aiResponse.modulesUsed = lunaData.modules_used.filter((module: unknown): module is string => typeof module === 'string');
    }

    if (Array.isArray(lunaData?.citations)) {
      aiResponse.citations = lunaData.citations;
    }

    if (typeof lunaData?.query_type === 'string') {
      aiResponse.queryType = lunaData.query_type;
    }

    if (typeof lunaData?.error === 'string') {
      aiResponse.error = lunaData.error;
    }

    if (lunaData?.isFallback) {
      aiResponse.isFallback = true;
    }

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
