
'use client';

import Sidebar from '@/components/dashboard/sidebar';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { useState } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { BackgroundGradientAnimation } from '@/components/ui/background-gradient-animation';
import InputPanel from '@/components/dashboard/input-panel';

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

          <div className="h-full ml-[80px] relative flex flex-col">
            
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 -mt-20">
                        <h1 className="text-8xl font-headline font-black text-white">Luna</h1>
                        <p className="text-3xl font-cursive text-white/80">Welcome, how can I help you today?</p>
                        <div className="mt-4">
                            <InputPanel />
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6 max-w-4xl mx-auto w-full">
                        <AnimatePresence>
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
                                className={`max-w-xl p-4 rounded-2xl bg-primary/80 backdrop-blur-sm text-primary-foreground`}
                                >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                     <div className="w-full max-w-4xl mx-auto py-6">
                        <PromptInputBox onSend={handleSend} isLoading={isLoading} />
                    </div>
                </>
            )}
          </div>
        </div>
      </BackgroundGradientAnimation>
    </main>
  );
}
