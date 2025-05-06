'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // Added footer
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, SlidersHorizontal, Clock, Info, ShieldCheck, HeartPulse, Home, TrendingUp, GraduationCap, Zap, Activity, CalendarDays } from 'lucide-react'; // Added more icons
import type { Policy, PolicyStatus, PolicyType } from '@/app/(app)/insurances/page'; // Import Policy types
import { policyIcons } from '@/app/(app)/insurances/page'; // Import policyIcons mapping
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { cn } from '@/lib/utils'; // Import cn
import { Button } from '@/components/ui/button'; // Import Button component

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

// Mapping for status colors and icons (Refined)
const statusConfig: Record<PolicyStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; Icon: React.ComponentType<{ className?: string }>; textClass: string }> = {
    active: { variant: 'default', Icon: CheckCircle, textClass: 'text-green-600 dark:text-green-400' }, // Use success color
    manual: { variant: 'secondary', Icon: SlidersHorizontal, textClass: 'text-blue-600 dark:text-blue-400' },
    'auto-pending': { variant: 'outline', Icon: Clock, textClass: 'text-yellow-600 dark:text-yellow-400' },
    inactive: { variant: 'outline', Icon: Info, textClass: 'text-muted-foreground' },
};


export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);
  const { Icon: StatusIcon, variant: statusVariant, textClass: statusTextClass } = statusConfig[policy.status];
  const PolicyIcon = policyIcons[policy.type] || Info; // Get the specific icon for the policy type

  useEffect(() => {
    // Format the coverage or goal amount on the client side
    const amount = policy.goalAmount ?? policy.coverageAmount;
    if (amount !== undefined && amount !== null) {
        setFormattedAmount(amount.toLocaleString());
    } else {
        setFormattedAmount(null); // Handle cases where neither is present
    }
  }, [policy.coverageAmount, policy.goalAmount]);

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col justify-between border-l-4", // Added flex structure
        policy.status === 'active' ? 'border-l-green-500' :
        policy.status === 'auto-pending' ? 'border-l-yellow-500' :
        policy.status === 'manual' ? 'border-l-blue-500' :
        'border-l-border' // Default border for inactive
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <PolicyIcon className="h-7 w-7 text-primary flex-shrink-0" />
                <CardTitle className="text-lg leading-tight">{policy.name}</CardTitle>
            </div>
            <Badge variant={statusVariant} className={cn("capitalize flex items-center gap-1 text-xs", statusTextClass)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {policy.status.replace('-', ' ')}
            </Badge>
        </div>
         <CardDescription className="text-xs pt-1 flex flex-wrap gap-x-2 items-center"> {/* Adjusted for wrapping */}
            <span>Premium: ${policy.premium}/mo</span>
            {policy.nextPaymentDate && (
                <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Next: {policy.nextPaymentDate}</span>
            )}
         </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 pb-4 flex-grow">
        <div className="space-y-1">
            {formattedAmount ? (
                <p className="text-sm font-medium">
                    {policy.goalAmount !== undefined ? 'Goal' : 'Coverage'}: ${formattedAmount}
                </p>
             ) : policy.status !== 'inactive' ? ( // Show skeleton only if active/pending but amount is loading
                 <Skeleton className="h-5 w-24" />
             ) : (
                  <p className="text-sm text-muted-foreground italic">Not applicable</p> // For inactive policies without amounts
             )}

             {/* Feature Indicators */}
             <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                 {policy.isAdaptivePremium && (
                     <span className="flex items-center gap-1" title="Adaptive Premium Enabled">
                         <Activity className="h-3.5 w-3.5 text-purple-500" /> Adaptive
                     </span>
                 )}
                 {policy.isAutoActive && (
                     <span className="flex items-center gap-1" title="Automatic Activation Enabled">
                         <Zap className="h-3.5 w-3.5 text-orange-500" /> Auto-Activate
                     </span>
                 )}
                  {/* Show placeholder if no features enabled */}
                  {!policy.isAdaptivePremium && !policy.isAutoActive && policy.status !== 'inactive' && (
                    <span className="italic">Standard Policy</span>
                  )}
             </div>
        </div>
      </CardContent>
       <CardFooter className="p-3 pt-2 border-t bg-muted/30">
          <Button variant="link" size="sm" className="w-full p-0 h-auto text-primary text-xs justify-center">
             Manage & Details
          </Button>
       </CardFooter>
    </Card>
  );
}
