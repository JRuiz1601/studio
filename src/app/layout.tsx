import type { Metadata } from 'next';
import { GeistSans as Geist } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import QueryClientProvider from '@/components/query-client-provider'; // Import QueryClientProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = GeistMono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <QueryClientProvider> {/* Wrap children with QueryClientProvider */}
          {children}
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
