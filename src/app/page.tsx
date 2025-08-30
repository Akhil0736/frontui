
'use client';

import Image from 'next/image';
import Sidebar from '@/components/dashboard/sidebar';
import { PromptInputBox } from '@/components/ui/ai-prompt-box';
import { useState, useEffect } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [wallpaperUrl, setWallpaperUrl] = useState("https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function getDailyWallpaper() {
        const unsplashApiKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        // If Unsplash credentials aren't provided, return a default wallpaper.
        if (!unsplashApiKey) {
            console.log("Unsplash API key not found. Using default wallpaper.");
            return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
        }

        try {
            const res = await fetch('https://api.unsplash.com/photos/random?query=mac-wallpaper&orientation=landscape&content_filter=high&license=free', {
                headers: {
                    Authorization: `Client-ID ${unsplashApiKey}`
                },
                next: { revalidate: 86400 } // Revalidate once per day (86400 seconds)
            });

            if (!res.ok) {
                console.error('Failed to fetch wallpaper from Unsplash:', await res.text());
                return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
            }

            const data = await res.json();
            return data.urls.full;
        } catch (error) {
            console.error('Error fetching wallpaper:', error);
            return "https://images.unsplash.com/photo-1554034483-04fda0d3507b?q=80&w=2070";
        }
    }

    getDailyWallpaper().then(setWallpaperUrl);
  }, []);

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
    <main className="w-full h-screen bg-[#21283C] overflow-hidden">
      <Image
        src={wallpaperUrl}
        alt="mac wallpaper"
        fill
        className="object-cover w-full h-full absolute inset-0 z-0"
        data-ai-hint="abstract gradient"
        priority
      />
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="relative z-20 h-full w-full">
        <Sidebar />

        <div className="h-full ml-[80px] relative flex flex-col">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                key="luna-title"
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <h1 
                  className="gradient-glow font-headline font-black text-[220px] leading-none tracking-tighter"
                >
                  Luna
                </h1>
              </motion.div>
            ) : (
              <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
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
              </div>
            )}
          </AnimatePresence>
          
          <div 
            className="w-[560px] mx-auto pb-8"
          >
              <PromptInputBox onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
  );
}
