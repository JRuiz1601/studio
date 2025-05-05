import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import QueryClientProvider from '@/components/query-client-provider'; // Import QueryClientProvider

export const metadata: Metadata = {
  title: 'Zyren Mobile', // Updated App Name
  description: 'Your personalized insurance companion.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The 'dark' class will be applied dynamically by the settings page logic
    <html lang="en" className={GeistSans.variable} suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <QueryClientProvider> {/* Wrap children with QueryClientProvider */}
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
