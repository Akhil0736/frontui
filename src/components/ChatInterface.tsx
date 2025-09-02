'use client';
import { useChatContext } from "@/context/ChatContext";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AIInputField } from './ui/ai-input';
import { AnimatePresence, motion } from "framer-motion";
import { ShiningText } from "./ui/shining-text";

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
      // The context needs a moment to update with the new chat
      // This is a bit of a workaround, a better solution might involve waiting for context update
      await new Promise(resolve => setTimeout(resolve, 0));
      // Re-fetch from context after it's been created
      // This part is tricky and depends on how useChatContext state updates are propagated.
      // For now, we assume sendMessage will handle a null currentChat correctly,
      // or we pass the new ID. Let's adjust sendMessage to be safer.
    }
    
    setIsLoading(true);
    await sendMessage(prompt.trim());
    setIsLoading(false);
  };
  
  return (
    <div className="flex flex-1 flex-col h-screen bg-transparent">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
               <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-200">
                What can I help you with?
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/20">
         <AIInputField onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
}
