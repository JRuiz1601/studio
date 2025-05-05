
'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { chatWithAI } from '@/ai/flows/chat-flow'; // Import the flow function
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element within the ScrollArea
      const scrollElement = (scrollAreaRef.current.firstChild as HTMLElement)?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        // Use requestAnimationFrame for smoother scrolling after render
        requestAnimationFrame(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        });
      }
    }
  }, [messages]);


  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const messageContent = inputValue.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const aiLoadingMessageId = Date.now().toString() + '-ai-loading';
    const aiLoadingMessage: Message = {
      id: aiLoadingMessageId,
      role: 'ai',
      content: '...', // Placeholder for loading
    };
    setMessages((prev) => [...prev, aiLoadingMessage]);

    try {
      // Call the Genkit flow
      const aiResponse = await chatWithAI({ message: messageContent });

       const aiMessage: Message = {
          id: Date.now().toString() + '-ai', // Ensure unique ID
          role: 'ai',
          content: aiResponse.response,
        };

        // Replace loading placeholder with actual response
        setMessages((prev) => prev.map(msg => msg.id === aiLoadingMessageId ? aiMessage : msg));

    } catch (error) {
      console.error('Error chatting with AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI. Please try again.',
        variant: 'destructive',
      });

       // Replace loading placeholder with an error message
        const aiErrorMessage: Message = {
          id: aiLoadingMessageId, // Use the same ID to replace
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
        };
       setMessages((prev) => prev.map(msg => msg.id === aiLoadingMessageId ? aiErrorMessage : msg));

    } finally {
      setIsLoading(false);
       // Refocus input after response/error
       inputRef.current?.focus();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))]"> {/* Adjust height considering header */}
      <Card className="flex flex-col flex-1 overflow-hidden shadow-lg rounded-lg border">
        <CardHeader className="border-b bg-card">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold">
            <Avatar className={cn("h-8 w-8 border", isLoading && "animate-pulse")}>
              <AvatarFallback><Bot className="h-4 w-4 text-primary" /></AvatarFallback>
            </Avatar>
            Chat with Zy
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-3 animate-in fade-in duration-300', // Added animation
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'ai' && (
                    <Avatar className={cn("h-8 w-8 border flex-shrink-0", isLoading && message.content === '...' && "animate-pulse")}>
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[75%] shadow-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none' // Slightly different rounding for user
                        : 'bg-card text-card-foreground border border-border rounded-bl-none' // Slightly different rounding for AI
                    )}
                  >
                     {message.content === '...' && isLoading ? ( // Render spinner for loading message
                        <div className="flex items-center justify-center h-5">
                           <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                     ) : (
                         <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                     )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border flex-shrink-0">
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 bg-card">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
