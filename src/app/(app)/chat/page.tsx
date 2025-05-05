'use client';

import { useState, useRef, useEffect, type FormEvent, useCallback } from 'react';
import { Send, User, Bot, Loader2, Paperclip, Mic, Square, AlertCircle } from 'lucide-react'; // Added Square, AlertCircle
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { chatWithAI } from '@/ai/flows/chat-flow'; // Import the flow function
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachment?: { name: string; type: string }; // Optional attachment info
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
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

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: messageContent,
      ...(attachment && { attachment }), // Add attachment info if present
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(''); // Clear input after sending
    setIsLoading(true);
    // Immediately show loading indicator for AI response
    scrollToBottom(); // Scroll after adding user message

    const aiLoadingMessageId = Date.now().toString() + '-ai-loading';
    const aiLoadingMessage: Message = {
      id: aiLoadingMessageId,
      role: 'ai',
      content: '...', // Placeholder for loading
    };
    setMessages((prev) => [...prev, aiLoadingMessage]);
    scrollToBottom(); // Scroll after adding loading message


    try {
      // TODO: If attachment exists, convert it to data URI or prepare for upload/Genkit input
      let genkitInputMessage = messageContent;
      if (attachment) {
         // For now, just append filename to message for visibility
         genkitInputMessage += `\n[Attached: ${attachment.name}]`;
      }

      const aiResponse = await chatWithAI({ message: genkitInputMessage });

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

       const aiErrorMessage: Message = {
          id: aiLoadingMessageId, // Use the same ID to replace
          role: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
        };
       setMessages((prev) => prev.map(msg => msg.id === aiLoadingMessageId ? aiErrorMessage : msg));

    } finally {
      setIsLoading(false);
       inputRef.current?.focus(); // Refocus input after response/error
       // No need to scroll here, handled by useEffect on messages change
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
    // TODO: In a real scenario, read the file content (e.g., as data URI for images)
    // or prepare it for upload before calling handleSendMessage.
    handleSendMessage(undefined, '', { name: file.name, type: file.type });


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

          mediaRecorderRef.current.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Or appropriate MIME type
              console.log('Recording stopped, Blob created:', audioBlob);
              // TODO: Process the audioBlob - e.g., send to a transcription service or AI
              toast({
                  title: 'Recording Finished',
                  description: `Audio captured (${(audioBlob.size / 1024).toFixed(1)} KB). Processing not implemented.`,
              });

              // For now, send a text message indicating audio was recorded
              handleSendMessage(undefined, '[Audio Recording Captured - Processing Pending]');


              // Stop the tracks only after processing is done or decided not to use
              audioStreamRef.current?.getTracks().forEach(track => track.stop());
              audioStreamRef.current = null; // Clear the stream ref
              setIsRecording(false);
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
          mediaRecorderRef.current.stop();
          // onstop handler will set isRecording to false and clean up stream
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
    <div className="container mx-auto p-4 md:p-6 flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))]">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        className="hidden"
        // Define accepted file types
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


      <Card className="flex flex-col flex-1 overflow-hidden shadow-lg rounded-lg border">
        <CardHeader className="border-b bg-card flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
              <Avatar className={cn("h-10 w-10 border-2 border-primary shadow-md", isLoading && "animate-pulse")}>
                 {/* Optional: Add AvatarImage here */}
                 {/* <AvatarImage src="URL_TO_ZY_IMAGE" alt="Zy Avatar" /> */}
                 <AvatarFallback><Bot className="h-5 w-5 text-primary" /></AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg font-semibold">
                Chat with Zy
              </CardTitle>
          </div>
          {/* Optional: Add status or other elements here if needed */}
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-3 animate-in fade-in duration-300',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'ai' && (
                    <Avatar className={cn("h-8 w-8 border flex-shrink-0", isLoading && message.content === '...' && "animate-pulse")}>
                       {/* <AvatarImage src="URL_TO_ZY_IMAGE_SMALL" alt="Zy Avatar" /> */}
                       <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-4 py-2 max-w-[75%] shadow-sm',
                      message.role === 'user'
                        ? 'bg-primary/90 text-primary-foreground rounded-br-none'
                        : 'bg-card text-card-foreground border border-border rounded-bl-none'
                    )}
                  >
                     {message.content === '...' && isLoading ? (
                        <div className="flex items-center justify-center h-5">
                           <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                     ) : (
                         <>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {/* Display attachment info if exists */}
                            {message.attachment && (
                                <div className="mt-2 pt-1 border-t border-primary/30 text-xs opacity-80 flex items-center gap-1">
                                    <Paperclip className="h-3 w-3" />
                                    <span>{message.attachment.name}</span>
                                </div>
                            )}
                         </>
                     )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 border flex-shrink-0">
                       {/* Optional: Add User Avatar Image */}
                       {/* <AvatarImage src="URL_TO_USER_IMAGE" alt="User Avatar" /> */}
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
             {/* Document Attachment Button */}
            <Button type="button" variant="ghost" size="icon" onClick={handleAttachDocument} disabled={isLoading || isRecording}>
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
            <Button type="submit" size="icon" disabled={isLoading || isRecording || (!inputValue.trim() && messages.length === 0)}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

