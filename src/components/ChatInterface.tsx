'use client';
import { useChatContext } from "@/context/ChatContext";
import { useTheme } from "next-themes";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BeamsBackground } from '@/components/ui/beams-background';
import { Send, Paperclip, Mic } from 'lucide-react';
import AIInputField from "./ui/ai-input";
import { LunaLogo } from "./ui/luna-logo";

export default function ChatInterface() {
  const { currentChat, sendMessage, loadChat, createNewChat } = useChatContext();
  const { theme } = useTheme();
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const chatId = params?.id as string;
    if (chatId) {
      loadChat(chatId);
    } else if (!currentChat) {
      //
    }
  }, [params, loadChat, router, currentChat, createNewChat]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    let chatToUpdateId = currentChat?.id;

    if (!chatToUpdateId) {
        chatToUpdateId = createNewChat();
        router.push(`/chat/${chatToUpdateId}`);
        // Give router time to push the new URL and context to update
        await new Promise(resolve => setTimeout(resolve, 0)); 
    }
    
    setIsLoading(true);
    await sendMessage(prompt.trim(), chatToUpdateId);
    setIsLoading(false);
  };
  
  const isEmpty = !currentChat || currentChat.messages.length === 0;

  if (isEmpty) {
    return (
        <BeamsBackground className="h-full">
            <div className="flex flex-col h-full relative z-10">
                <div className="flex-1 flex items-center justify-center p-4">
                  <LunaLogo />
                </div>
                <div className="p-6 backdrop-blur-sm">
                    <AIInputField onSend={handleSend} isLoading={isLoading} />
                </div>
            </div>
        </BeamsBackground>
    );
  }

  return (
    <div className={`flex flex-1 flex-col h-full ${theme === 'light' ? 'bg-white' : 'bg-black'} transition-colors duration-300`}>
      {/* Header */}
      <div className={`p-4 border-b ${theme === 'light' ? 'border-neutral-200 bg-white/95' : 'border-neutral-700 bg-black/95'} backdrop-blur-sm sticky top-0 z-10`}>
        <h1 className={`text-xl font-semibold ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-200'}`}>
          {currentChat?.title || 'Chat'}
        </h1>
      </div>

      {/* Messages Area */}
       <div className="flex-1 overflow-y-auto p-4 font-luna">
            <div className="space-y-6 max-w-3xl mx-auto">
            {currentChat.messages.map((message) => (
                <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                <div
                    className={`max-w-[80%] p-4 rounded-2xl font-proxima-regular ${
                    message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : theme === 'light'
                        ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                        : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                    }`}
                >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
                </motion.div>
            ))}
            </div>
      </div>

      {/* Input Area */}
      <div className={`p-4 border-t ${theme === 'light' ? 'border-neutral-200 bg-white/95' : 'border-neutral-700 bg-black/95'} backdrop-blur-sm sticky bottom-0`}>
         <AIInputField onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
