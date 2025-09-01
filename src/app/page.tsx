'use client';

import { useState, useEffect, useRef } from 'react';
import { chat } from '@/ai/flows/chat';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { AIInputField } from '@/components/ui/ai-input';
import LunaLogo from '@/components/ui/luna-logo';
import { ShiningText } from '@/components/ui/shining-text';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string>(
    () => `session_${Date.now()}`
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      { role: 'assistant', content: '...', id: assistantMessageId },
    ];
    setMessages(newMessages);

    try {
      const { response, sessionId: newSessionId } = await chat(
        prompt,
        sessionId
      );
      setSessionId(newSessionId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, content: response } : msg
        )
      );
    } catch (error) {
      console.error('Failed to get response from AI:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI. Please try again.',
      });
      // Remove the user and "thinking" messages if the call fails
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full h-screen bg-transparent overflow-hidden">
      <AuroraBackground>
        <div className="flex-1 flex flex-col h-full relative">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <LunaLogo />
              <div className="chatbox">
                <AIInputField onSend={handleSend} isLoading={isLoading} />
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
                      <div className={'max-w-xl py-4 text-black'}>
                        {message.role === 'assistant' &&
                        message.content === '...' ? (
                          <ShiningText text="Luna is thinking..." />
                        ) : (
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
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
      </AuroraBackground>
    </main>
  );
}
