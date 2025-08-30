
'use client';

import Sidebar from '@/components/dashboard/sidebar';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { useState } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);

    try {
      const response = await chat(prompt);
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Failed to get response from AI:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
      });
       // remove the user message if the call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="w-full h-screen bg-background overflow-hidden">
      <BackgroundGradientAnimation
        firstColor="255, 255, 255"
        secondColor="255, 182, 193"
        thirdColor="255, 255, 255"
        fourthColor="255, 105, 180"
        fifthColor="255, 255, 255"
        pointerColor="255, 105, 180"
      >
        <div className="relative z-20 h-full w-full">
          <Sidebar />

          <div className="h-full ml-[80px] relative flex flex-col justify-between">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div 
                      key="luna-title"
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 flex flex-col items-center justify-center h-full"
                    >
                      <h1 
                        className="gradient-glow font-headline font-black text-[220px] leading-none tracking-tighter"
                      >
                        Luna
                      </h1>
                    </motion.div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={`flex items-start gap-4 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                              L
                            </div>
                          )}
                          <div
                            className={`max-w-xl p-4 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </div>
            
            <div 
              className={`mx-auto w-full px-4 transition-all duration-500 ease-in-out ${
                messages.length === 0
                  ? 'pb-24'
                  : 'pb-8'
              }`}
            >
              <div
                className={`mx-auto transition-all duration-500 ${
                  messages.length === 0
                    ? 'max-w-2xl'
                    : 'max-w-4xl'
                }`}
              >
                <PromptInputBox onSend={handleSend} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      </BackgroundGradientAnimation>
    </main>
  );
}
