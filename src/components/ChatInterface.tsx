'use client';
import { useChatContext } from "@/context/ChatContext";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Send, Sparkles } from 'lucide-react';
import { AIInputField } from "./ui/ai-input";
import { AnimatePresence } from "framer-motion";

export default function ChatInterface() {
  const { currentChat, sendMessage, loadChat, createNewChat } = useChatContext();
  const params = useParams();
  const router = useRouter();
  const [input, setInput] = useState('');
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

  return (
    <div className="flex flex-1 flex-col h-screen bg-transparent relative">
      {isEmpty ? (
        <AuroraBackground className="h-full items-stretch justify-stretch">
          <div className="flex flex-col h-full relative z-10">
            <div className="flex-1 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0.0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.3,
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="relative flex flex-col gap-6 items-center justify-center px-4 text-center max-w-3xl"
              >
                <div className="flex items-center gap-3 mb-4">
                   <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                    What can I help you with?
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-8">
                  {[
                    "Explain quantum computing",
                    "Write a creative story",
                    "Help me plan my day", 
                    "Review my code"
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="p-4 rounded-xl border border-neutral-300/50 dark:border-neutral-600/50 backdrop-blur-sm bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-200 text-left"
                    >
                      <span className="text-neutral-700 dark:text-neutral-300">{prompt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="p-4 border-t border-border/20">
                <AIInputField onSend={handleSend} isLoading={isLoading} />
            </div>
          </div>
        </AuroraBackground>
      ) : (
        <div className="flex flex-col h-full bg-background">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
             <AnimatePresence>
               <div className="space-y-4 max-w-4xl mx-auto w-full">
                  {currentChat.messages.map((message) => (
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
                      <div className={'max-w-xl py-4 text-foreground'}>
                          <p className="whitespace-pre-wrap">
                              {message.content}
                          </p>
                      </div>
                      </motion.div>
                  ))}
               </div>
            </AnimatePresence>
          </div>
          <div className="p-4 border-t border-border/20">
             <AIInputField onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
}
