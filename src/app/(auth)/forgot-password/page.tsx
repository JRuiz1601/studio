'use client';

import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useState } from 'react';

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
import { forgotPasswordSchema } from '@/schemas/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setIsLoading(true);
    console.log('Forgot password request:', values);
    // TODO: Replace with actual Firebase password reset logic
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoading(false);

    // Simulate success for now
    setIsSuccess(true);
    toast({
      title: 'Password Reset Email Sent',
      description: 'Check your inbox for instructions to reset your password.',
    });
    form.reset(); // Clear the form on success
  }

  return (
    <>
      <h2 className="text-2xl font-semibold text-center text-foreground mb-6">
        Forgot Your Password?
      </h2>
      <p className="text-muted-foreground text-center text-sm mb-6">
        Enter your email address below and we&apos;ll send you a link to reset your password.
      </p>

      {isSuccess && (
        <Alert variant="default" className="mb-4 bg-green-100 border-green-300 text-green-800">
          <AlertTitle>Check Your Email</AlertTitle>
          <AlertDescription>
            A password reset link has been sent to the provided email address if it exists in our system.
          </AlertDescription>
        </Alert>
      )}

      {!isSuccess && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email address" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </Form>
      )}

      <div className="mt-6 text-center text-sm">
        Remembered your password?{' '}
        <Link href="/login" passHref> {/* Updated link */}
          <span className="underline text-primary hover:text-primary/80 cursor-pointer">
            Back to Login
          </span>
        </Link>
      </div>
    </>
  );
}
