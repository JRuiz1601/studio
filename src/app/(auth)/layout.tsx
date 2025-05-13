import type { ReactNode } from 'react';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg">
         {/* Placeholder for Zyren Logo */}
        <div className="flex justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-16 w-16 text-primary">
             <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                 <stop offset="0%" style={{stopColor: 'hsl(var(--primary))', stopOpacity: 1}} />
                 <stop offset="100%" style={{stopColor: 'hsl(var(--accent))', stopOpacity: 1}} />
               </linearGradient>
             </defs>
             <path fill="url(#grad1)" d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C25.15,95 5,74.85 5,50 C5,25.15 25.15,5 50,5 Z M50,15 C30.67,15 15,30.67 15,50 C15,69.33 30.67,85 50,85 C69.33,85 85,69.33 85,50 C85,30.67 69.33,15 50,15 Z M33,33 L67,33 L33,67 L67,67" stroke="hsl(var(--card))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
        {children}
      </div>
    </div>
  );
}
