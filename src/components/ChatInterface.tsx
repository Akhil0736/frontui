
'use client';
import { useChatContext } from "@/context/ChatContext";
import { useTheme } from "next-themes";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AIInputField } from "./ui/ai-input";
import { AnimatePresence } from "framer-motion";
import { BeamsBackground } from "./ui/beams-background";

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
      const newId = createNewChat();
      router.push(`/chat/${newId}`);
    }
  }, [params, loadChat, router, currentChat, createNewChat]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    let chatToUpdate = currentChat;

    if (!chatToUpdate) {
      const newChatId = createNewChat();
      router.push(`/chat/${newChatId}`);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    setIsLoading(true);
    await sendMessage(prompt.trim());
    setIsLoading(false);
  };
  
  const isEmpty = !currentChat || currentChat.messages.length === 0;

  if (isEmpty) {
    return (
        <BeamsBackground className="h-full w-full">
            <div className="flex flex-1 flex-col h-screen bg-transparent relative">
                <div className="flex-1 overflow-y-auto pb-24">
                </div>
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-transparent">
                    <AIInputField onSend={handleSend} isLoading={isLoading} />
                </div>
            </div>
        </BeamsBackground>
    )
  }

  return (
    <div className={`flex flex-1 flex-col h-screen relative transition-colors duration-300 ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
      <div className="flex-1 overflow-y-auto pb-24">
            <AnimatePresence>
              <div className="space-y-4 max-w-4xl mx-auto w-full pt-8 px-4">
                  {currentChat?.messages.map((message) => (
                      <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-start gap-4 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                      >
                      {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                          L
                          </div>
                      )}
                      <div className={`max-w-xl p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : theme === 'light'
                            ? 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            : 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                        }`}>
                          <p className="whitespace-pre-wrap">
                              {message.content}
                          </p>
                      </div>
                      </motion.div>
                  ))}
              </div>
            </AnimatePresence>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-4 border-t border-transparent">
          <AIInputField onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
