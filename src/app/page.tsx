'use client';

import { useState, useEffect, useRef } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { AIInputField } from '@/components/ui/ai-input';
import LunaLogo from '@/components/ui/luna-logo';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { Home as HomeIcon, Settings, CreditCard, LogOut } from 'lucide-react';
import Link from 'next/link';
import { ShiningText } from '@/components/ui/shining-text';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Luna
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};


export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => `session_${Date.now()}`);

  const links = [
    { label: 'Home', href: '/', icon: <HomeIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Settings', href: '/settings', icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Billing', href: '/billing', icon: <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: 'Logout', href: '/logout', icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" /> },
];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();

    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: prompt, id: userMessageId },
      { role: 'assistant', content: '...', id: assistantMessageId }
    ];
    setMessages(newMessages);

    try {
      const { response, sessionId: newSessionId } = await chat(prompt, sessionId);
      setSessionId(newSessionId);
      setMessages(prevMessages => prevMessages.map(msg => 
        msg.id === assistantMessageId ? { ...msg, content: response } : msg
      ));
    } catch (error) {
      console.error("Failed to get response from AI:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the AI. Please try again.",
      });
      // Remove the user and "thinking" messages if the call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <main className="w-full h-screen bg-background overflow-hidden">
      <AuroraBackground>
        <div className="relative z-20 h-full w-full flex">
           <Sidebar open={open} setOpen={setOpen}>
            <SidebarBody className="justify-between gap-10">
              <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                {open ? <Logo /> : <LogoIcon />}
                <div className="mt-8 flex flex-col gap-2">
                  {links.map((link, idx) => (
                    <SidebarLink key={idx} link={link} />
                  ))}
                </div>
              </div>
            </SidebarBody>
          </Sidebar>

          <div className="flex-1 flex flex-col h-full relative">
            
            {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <LunaLogo />
                    <div className="chatbox">
                        <AIInputField onSend={handleSend} isLoading={isLoading}/>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col justify-between h-full">
                    <div className="chat-scroll flex-1 overflow-y-auto p-8 pt-6 space-y-6 max-w-4xl mx-auto w-full">
                        <AnimatePresence>
                            {messages.map((message) => (
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
                                <div
                                className={'max-w-xl py-4 text-black'}
                                >
                                {message.role === 'assistant' && message.content === '...' ? (
                                    <ShiningText text="Luna is thinking..." />
                                ) : (
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                                </div>
                            </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </AnimatePresence>
                    </div>
                     <div className="chat-composer w-full px-4">
                        <AIInputField onSend={handleSend} isLoading={isLoading} />
                    </div>
                </div>
            )}
          </div>
        </div>
      </AuroraBackground>
    </main>
  );
}
