'use client';

import { useState, useRef, useEffect, type FormEvent, useCallback } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Mic, Square, AlertCircle, Info } from 'lucide-react'; // Added Info
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { chatWithAI } from '@/ai/flows/chat-flow'; // Import the flow function
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image'; // Import Image

interface Message {
  id: string;
  role: 'user' | 'ai' | 'system'; // Added 'system' role for initial tips
  content: string;
  attachment?: { name: string; type: string }; // Optional attachment info
}

// Initial messages/tips to display
const initialMessages: Message[] = [
  {
    id: 'system-welcome',
    role: 'system',
    content: "Welcome to Zyren Chat! How can I assist you today? Feel free to ask about your coverage, explore options, or get tips.",
  },
   {
    id: 'system-faq1',
    role: 'system',
    content: "Tip: Ask me 'Do I have active coverage?' to quickly check your status.",
  },
   {
    id: 'system-faq2',
    role: 'system',
    content: "FAQ: You can manage your policies under the 'Mis Seguros' section.",
  },
];


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false); // State for AI typing indicator
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null); // To stop tracks
  const { toast } = useToast();

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = (scrollAreaRef.current.firstChild as HTMLElement)?.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        requestAnimationFrame(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        });
      }
    }
  }, []);

  // Scroll to bottom when messages change or AI starts typing
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, scrollToBottom]);

  // Focus input on load and set initial messages
  useEffect(() => {
    inputRef.current?.focus();
    // Set initial messages only if messages array is empty
    if (messages.length === 0) {
       setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Cleanup function to stop recording and release media resources
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop(); // Stop recording if active
      audioStreamRef.current?.getTracks().forEach(track => track.stop()); // Stop camera/mic tracks
    };
  }, []);

  const handleSendMessage = async (e?: FormEvent<HTMLFormElement>, messageContentOverride?: string, attachment?: Message['attachment']) => {
    e?.preventDefault();
    const messageContent = (messageContentOverride || inputValue).trim();

    if ((!messageContent && !attachment) || isLoading) return;

     // Clear initial system messages when user sends the first message
     if (messages.length > 0 && messages.every(m => m.role === 'system')) {
       setMessages([]);
     }


    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: messageContent,
      ...(attachment && { attachment }), // Add attachment info if present
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(''); // Clear input after sending
    setIsLoading(true);
    setIsAiTyping(true); // AI starts "typing"
    scrollToBottom(); // Scroll after adding user message

    // --- AI Response Handling ---
    try {
      // TODO: If attachment exists, convert it to data URI or prepare for upload/Genkit input
      let genkitInputMessage = messageContent;
      if (attachment) {
         // For now, just append filename to message for visibility
         genkitInputMessage += `\n[Attached: ${attachment.name}]`;
         // IMPORTANT: Genkit flow needs to be updated to handle potential file data URIs
      }

      const aiResponse = await chatWithAI({ message: genkitInputMessage });

       const aiMessage: Message = {
          id: Date.now().toString() + '-ai', // Ensure unique ID
          role: 'ai',
          content: aiResponse.response,
        };

        // Add AI response
        setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error chatting with AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response from AI. Please try again.',
        variant: 'destructive',
      });

       const aiErrorMessage: Message = {
          id: Date.now().toString() + '-ai-error',
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
        };
       setMessages((prev) => [...prev, aiErrorMessage]);

    } finally {
      setIsLoading(false);
      setIsAiTyping(false); // AI stops "typing"
       inputRef.current?.focus(); // Refocus input after response/error
    }
  };

  // --- Document Attachment ---
  const handleAttachDocument = () => {
    if (isLoading || isRecording) return;
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.size, file.type);
    toast({
        title: 'File Selected',
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
    });

    // Immediately add a message indicating the file attachment and trigger send
    // TODO: In a real scenario, read the file content (e.g., as data URI for images/text)
    // or prepare it for upload before calling handleSendMessage.
    // For now, just send filename. Update Genkit flow if sending content.
    handleSendMessage(undefined, `[Attached File: ${file.name}]`, { name: file.name, type: file.type });


    // Reset file input to allow selecting the same file again
    event.target.value = '';
  };


  // --- Voice Input ---
   const requestMicPermission = async (): Promise<boolean> => {
       if (hasMicPermission === true) return true;
       if (typeof navigator?.mediaDevices?.getUserMedia !== 'function') {
           toast({ title: 'Error', description: 'Audio recording is not supported in this browser.', variant: 'destructive' });
           setHasMicPermission(false);
           return false;
       }
       try {
           // Request permission
           audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
           setHasMicPermission(true);
           return true;
       } catch (error) {
           console.error('Microphone permission error:', error);
           toast({
               title: 'Microphone Access Denied',
               description: 'Please enable microphone permissions in your browser settings.',
               variant: 'destructive',
           });
           setHasMicPermission(false);
           return false;
       }
   };

  const startRecording = async () => {
      const permissionGranted = await requestMicPermission();
      if (!permissionGranted || !audioStreamRef.current) return;

      try {
          setIsRecording(true);
          audioChunksRef.current = []; // Reset chunks
          mediaRecorderRef.current = new MediaRecorder(audioStreamRef.current);

          mediaRecorderRef.current.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunksRef.current.push(event.data);
              }
          };

          mediaRecorderRef.current.onstop = async () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Or appropriate MIME type
              console.log('Recording stopped, Blob created:', audioBlob);

               toast({
                 title: 'Processing Audio...',
                 description: `Audio captured (${(audioBlob.size / 1024).toFixed(1)} KB).`,
               });

              // TODO: Process the audioBlob
              // 1. Convert Blob to Data URI or upload to a server
              // 2. Send Data URI/URL to a transcription service (like Google Speech-to-Text via Genkit or other API)
              // 3. Once transcription is received, call handleSendMessage with the transcribed text

               // --- Placeholder for Transcription & Sending ---
               // Example: Simulate transcription delay and send placeholder
               await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
               const transcribedText = "[Simulated Audio Transcription]"; // Replace with actual transcription
               handleSendMessage(undefined, transcribedText);
               // --- End Placeholder ---

              // Stop the tracks only after processing is done or decided not to use
              audioStreamRef.current?.getTracks().forEach(track => track.stop());
              audioStreamRef.current = null; // Clear the stream ref
              setIsRecording(false); // Set recording state to false AFTER processing/sending
          };

           mediaRecorderRef.current.onerror = (event) => {
               console.error("MediaRecorder error:", event);
               toast({ title: "Recording Error", description: "An error occurred during recording.", variant: "destructive" });
               setIsRecording(false);
               // Stop tracks on error too
               audioStreamRef.current?.getTracks().forEach(track => track.stop());
               audioStreamRef.current = null;
           };


          mediaRecorderRef.current.start();
      } catch (error) {
          console.error("Failed to start recording:", error);
          toast({ title: "Recording Error", description: "Could not start recording.", variant: "destructive" });
          setIsRecording(false);
           // Ensure tracks are stopped if setup failed
           audioStreamRef.current?.getTracks().forEach(track => track.stop());
           audioStreamRef.current = null;
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop(); // onstop handler will manage state and cleanup
      } else {
          // If somehow stop is called without active recording, ensure cleanup
          audioStreamRef.current?.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
          setIsRecording(false); // Ensure state consistency
      }
  };

  const handleVoiceInput = () => {
    if (isLoading) return;

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))] relative overflow-hidden">
       {/* Particle Background - Requires a library like react-tsparticles or custom CSS */}
       {/* Example Placeholder: <ParticleBackground /> */}
       <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-muted/50 to-background dark:from-zinc-900 dark:via-zinc-800/50 dark:to-zinc-900">
          {/* Add particle effect here if desired */}
       </div>


      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        // Define accepted file types (adjust as needed)
        accept="application/pdf, image/*, .doc, .docx, .txt, text/plain"
      />

      {/* Permission Denied Alert */}
       {hasMicPermission === false && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microphone Access Needed</AlertTitle>
            <AlertDescription>
              Please grant microphone permissions in your browser settings to use voice input.
            </AlertDescription>
          </Alert>
       )}


      <Card className="flex flex-col flex-1 overflow-hidden shadow-lg rounded-lg border bg-card/80 backdrop-blur-sm z-10"> {/* Added backdrop blur */}
        <CardHeader className="border-b bg-card/80 flex flex-row items-center justify-between">
          {/* Left side: Logo, Title */}
          <div className="flex items-center gap-3">
              {/* Replace static placeholder with the new floating robot avatar */}
               <div className="relative h-12 w-12"> {/* Adjust size as needed */}
                 <Image
                   src="/zyren-bot-avatar.png" // Path to the new friendly robot image
                   alt="Zyren Bot Avatar"
                   layout="fill"
                   objectFit="contain"
                   data-ai-hint="friendly robot mascot" // AI hint for image generation
                 />
               </div>
              <CardTitle className="text-lg font-semibold">
                Chat with Zy
              </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-3 animate-in fade-in duration-300',
                     message.role === 'user' ? 'justify-end' : message.role === 'system' ? 'justify-center' : 'justify-start'
                  )}
                >
                  {/* AI Avatar (left side) */}
                  {message.role === 'ai' && (
                    <Avatar className={cn("h-8 w-8 border flex-shrink-0")}>
                       {/* Keep smaller bubble avatar for consistency in chat flow */}
                       <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                   {/* System Message Styling */}
                   {message.role === 'system' && (
                      <div className="text-center w-full max-w-md mx-auto my-2 p-3 bg-accent/50 border border-accent rounded-md text-xs text-accent-foreground flex items-center justify-center gap-2">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>{message.content}</span>
                      </div>
                   )}

                   {/* User and AI Message Bubbles */}
                  {message.role !== 'system' && (
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 max-w-[75%] shadow-sm',
                        message.role === 'user'
                          ? 'bg-primary/90 text-primary-foreground rounded-br-none' // User bubble style
                          : 'bg-card text-card-foreground border border-border rounded-bl-none' // AI bubble style
                      )}
                    >
                       {/* Content */}
                       <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                       {/* Attachment info */}
                       {message.attachment && (
                           <div className="mt-2 pt-1 border-t border-primary/30 text-xs opacity-80 flex items-center gap-1">
                               <Paperclip className="h-3 w-3" />
                               <span>{message.attachment.name}</span>
                           </div>
                       )}
                    </div>
                  )}
                   {/* User Avatar (right side) */}
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border flex-shrink-0">
                       {/* <AvatarImage src="URL_TO_USER_IMAGE" alt="User Avatar" /> */}
                       <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {/* AI Typing Indicator */}
               {isAiTyping && (
                 <div className="flex items-end gap-3 justify-start animate-in fade-in duration-300">
                   <Avatar className="h-8 w-8 border flex-shrink-0">
                     <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                   </Avatar>
                   <div className="rounded-lg px-4 py-2 bg-card text-card-foreground border border-border rounded-bl-none shadow-sm">
                     <div className="flex items-center justify-center h-5 space-x-1">
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce-dot delay-0"></span>
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce-dot delay-150"></span>
                        <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce-dot delay-300"></span>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4 bg-card/80">
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
             {/* Document Attachment Button */}
            <Button type="button" variant="ghost" size="icon" onClick={handleAttachDocument} disabled={isLoading || isRecording} aria-label="Attach Document">
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Attach Document</span>
            </Button>
             {/* Voice Input Button */}
             <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleVoiceInput}
                disabled={isLoading || hasMicPermission === false} // Disable if loading or no mic permission
                className={cn(isRecording && "text-destructive hover:text-destructive")}
                aria-label={isRecording ? 'Stop Recording' : 'Use Voice Input'}
              >
               {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
               <span className="sr-only">{isRecording ? 'Stop Recording' : 'Use Voice Input'}</span>
             </Button>

            <Input
              ref={inputRef}
              type="text"
              placeholder={isRecording ? "Recording... Speak now" : "Type your message or use voice..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading || isRecording} // Disable input while loading or recording
              className="flex-1"
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={isLoading || isRecording || !inputValue.trim()} aria-label="Send Message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

        {/* Add global styles for animations if not already present */}
        <style jsx global>{`
          /* Keep existing animations */
          @keyframes float {
            0%, 100% { transform: translateY(-5%); }
            50% { transform: translateY(5%); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          @keyframes pulse-speak { /* Example simple speaking animation */
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .animate-pulse-speak {
             animation: pulse-speak 1s ease-in-out infinite;
          }

           @keyframes bounce-dot {
              0%, 80%, 100% { transform: scale(0); }
              40% { transform: scale(1.0); }
            }
           .animate-bounce-dot {
             animation: bounce-dot 1.4s infinite ease-in-out both;
           }
           .delay-150 { animation-delay: -0.16s; }
           .delay-300 { animation-delay: -0.32s; }
        `}</style>
    </div>
  );
}
