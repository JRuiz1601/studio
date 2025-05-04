import type { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
       {/* Onboarding steps will be rendered here, often using a carousel or stepper component */}
       {children}
    </div>
  );
}
