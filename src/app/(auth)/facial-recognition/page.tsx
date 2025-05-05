'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

type ScanStatus = 'idle' | 'scanning' | 'validating' | 'success' | 'error';

export default function FacialRecognitionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Simulate camera access and scanning process
  useEffect(() => {
    async function setupCamera() {
      if (status !== 'scanning' || !navigator.mediaDevices?.getUserMedia) return;

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        // Simulate scanning progress
        const interval = setInterval(() => {
          setProgress((prev) => {
            const nextProgress = prev + 10;
            if (nextProgress >= 100) {
              clearInterval(interval);
              setStatus('validating');
              // Simulate validation
              setTimeout(() => {
                // Simulate success/failure randomly for demo
                if (Math.random() > 0.2) {
                   setStatus('success');
                } else {
                   setStatus('error');
                   setErrorMessage('Scan quality poor. Please ensure good lighting and hold still.');
                   setProgress(0); // Reset progress on error
                }
              }, 1500);
              return 100;
            }
            return nextProgress;
          });
        }, 300);
      } catch (err) {
        console.error('Camera access error:', err);
        setStatus('error');
        setErrorMessage('Could not access camera. Please check permissions and try again.');
      }
    }

    setupCamera();

    // Cleanup function to stop the camera stream
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
       if (videoRef.current) {
         videoRef.current.srcObject = null;
       }
    };
  }, [status]);


  const handleStartScan = () => {
    setStatus('scanning');
    setProgress(0);
    setErrorMessage(null);
  };

  const handleContinue = () => {
    toast({
      title: 'Facial Recognition Setup Complete',
      description: 'Redirecting to onboarding...',
    })
    // TODO: Add logic to save facial data reference if needed
    router.push('/dashboard');
  };

  const handleRetry = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMessage(null);
  };

  const renderStatusContent = () => {
    switch (status) {
      case 'scanning':
      case 'validating':
        return (
          <>
            <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden mb-4 border border-border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Optional overlay for guidance */}
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-dashed border-primary rounded-full opacity-50"></div>
              </div>
               {status === 'validating' && (
                 <div className="absolute inset-0 bg-background/70 flex flex-col items-center justify-center text-foreground">
                    <Loader className="animate-spin h-8 w-8 mb-2" />
                    <p>Validating...</p>
                 </div>
               )}
            </div>
            <Progress value={progress} className="w-full mb-2" />
            <CardDescription className="text-center">
              {status === 'scanning' ? 'Position your face within the frame. Hold still.' : 'Validating your scan...'}
            </CardDescription>
          </>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="mb-2">Scan Successful!</CardTitle>
            <CardDescription>Your facial data has been captured.</CardDescription>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
             <CardTitle className="mb-2">Scan Failed</CardTitle>
            <CardDescription className="text-destructive">{errorMessage || 'An unknown error occurred.'}</CardDescription>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center text-center">
            <Camera className="h-16 w-16 text-primary mb-4" />
             <CardTitle className="mb-2">Facial Recognition Setup</CardTitle>
            <CardDescription>We need to capture your facial biometrics for secure login.</CardDescription>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-4 text-left space-y-1">
                <li>Ensure you are in a well-lit area.</li>
                <li>Remove glasses or hats if possible.</li>
                <li>Hold your device steady at eye level.</li>
                <li>Follow the on-screen prompts.</li>
            </ul>
          </div>
        );
    }
  };

   const renderFooterButton = () => {
     switch (status) {
       case 'scanning':
       case 'validating':
         return <Button disabled className="w-full"><Loader className="animate-spin mr-2 h-4 w-4" />{status === 'scanning' ? 'Scanning...' : 'Validating...'}</Button>;
       case 'success':
         return <Button onClick={handleContinue} className="w-full">Continue to Dashboard</Button>;
       case 'error':
         return <Button onClick={handleRetry} variant="outline" className="w-full">Retry Scan</Button>;
       case 'idle':
       default:
         return <Button onClick={handleStartScan} className="w-full">Start Scan</Button>;
     }
   };

  return (
      <Card className="w-full max-w-md shadow-none border-none bg-transparent">
        <CardHeader className="p-0 mb-6">
           {/* Header is handled by layout, keeping structure */}
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {renderStatusContent()}
        </CardContent>
        <CardFooter className="flex justify-center mt-6">
          {renderFooterButton()}
        </CardFooter>
      </Card>
  );
}
