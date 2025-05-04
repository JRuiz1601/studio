'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { loginSchema } from '@/schemas/auth';
// import { recognizeFace } from '@/services/biometrics'; // Biometric check bypassed
import { Fingerprint } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [facialRecognitionStatus, setFacialRecognitionStatus] = useState<{type: 'info' | 'success' | 'error', message: string} | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identificationNumber: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    console.log('Login attempt (bypassed):', values);

    // **Bypass actual authentication**
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate short delay

    setIsLoading(false);

    toast({
      title: 'Login Successful (Demo)',
      description: 'Redirecting to dashboard...',
    });
    // Directly redirect to dashboard, skipping onboarding for demo flow
    router.push('/dashboard');
  }

  async function handleFacialRecognition() {
    setIsLoading(true);
    setFacialRecognitionStatus({type: 'info', message: 'Simulating facial recognition...'});

    // **Bypass actual facial recognition**
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    setIsLoading(false);
    setFacialRecognitionStatus({type: 'success', message: 'Facial recognition simulated. Logging in...'});

    toast({
      title: 'Login Successful (Demo)',
      description: 'Facial recognition simulated.',
    });
    // Directly redirect to dashboard, skipping onboarding for demo flow
    router.push('/dashboard');

    // Optionally clear the message after a delay
    setTimeout(() => setFacialRecognitionStatus(null), 3000);
  }

  const renderFacialRecognitionStatus = (): ReactNode => {
    if (!facialRecognitionStatus) return null;

    let variant: 'default' | 'destructive' = 'default';
    if (facialRecognitionStatus.type === 'error') variant = 'destructive';

     // Simple spinner for info state
    const IconComponent = facialRecognitionStatus.type === 'info'
      ? () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      : facialRecognitionStatus.type === 'success'
      ? () => <Fingerprint className="h-4 w-4 text-green-500" /> // Example success icon
      : () => <Fingerprint className="h-4 w-4 text-red-500" />; // Example error icon


    return (
      <Alert variant={variant} className="mt-4">
         <IconComponent />
        <AlertTitle className={facialRecognitionStatus.type === 'info' ? 'ml-2' : ''}>
          {facialRecognitionStatus.type === 'info' ? 'Processing...' : facialRecognitionStatus.type === 'success' ? 'Success' : 'Error'}
        </AlertTitle>
        <AlertDescription>
          {facialRecognitionStatus.message}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-semibold text-center text-foreground mb-6">
        Login to Zyren
      </h2>
      {renderFacialRecognitionStatus()}
      {/* Although bypassed, keep the form structure for UI consistency */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="identificationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identification Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your ID number" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In (Demo)'}
          </Button>
        </form>
      </Form>

      <Button
        variant="outline"
        className="w-full mt-4"
        onClick={handleFacialRecognition}
        disabled={isLoading}
      >
        <Fingerprint className="mr-2 h-4 w-4" />
        {isLoading && facialRecognitionStatus?.type === 'info' ? 'Processing...' : 'Login with Facial Recognition (Demo)'}
      </Button>

      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" passHref>
          <span className="underline text-muted-foreground hover:text-primary cursor-pointer">
            Forgot your password?
          </span>
        </Link>
      </div>

      <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" passHref>
          <span className="underline text-primary hover:text-primary/80 cursor-pointer">
            Register here
          </span>
        </Link>
      </div>
    </>
  );
}