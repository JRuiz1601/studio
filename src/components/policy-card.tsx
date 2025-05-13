'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, SlidersHorizontal, Clock, Info, Zap, Activity, CalendarDays, Coins } from 'lucide-react';
import type { Policy, PolicyStatus } from '@/data/policies'; // Import PolicyStatus from data/policies
import { policyIcons } from '@/data/policies'; // Import policyIcons from data/policies
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

const statusConfig: Record<PolicyStatus, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; Icon: React.ComponentType<{ className?: string }>; textClass: string }> = {
    active: { variant: 'default', Icon: CheckCircle, textClass: 'text-green-600 dark:text-green-400' },
    manual: { variant: 'secondary', Icon: SlidersHorizontal, textClass: 'text-blue-600 dark:text-blue-400' },
    'auto-pending': { variant: 'outline', Icon: Clock, textClass: 'text-yellow-600 dark:text-yellow-400' },
    inactive: { variant: 'outline', Icon: Info, textClass: 'text-muted-foreground' },
};


export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const [formattedAmount, setFormattedAmount] = useState<string | null>(null);
  const { Icon: StatusIcon, variant: statusVariant, textClass: statusTextClass } = statusConfig[policy.status];
  const PolicyIconComponent = policyIcons[policy.type] || Info;

  useEffect(() => {
    const amount = policy.goalAmount ?? policy.coverageAmount;
    if (amount !== undefined && amount !== null) {
        // Simulate fetching or calculating formatted amount
        // In a real app, this might involve API calls or complex formatting logic
        // For now, directly format it
        setFormattedAmount(amount.toLocaleString());
    } else {
        setFormattedAmount(null);
    }
  }, [policy.coverageAmount, policy.goalAmount]);

  return (
    <Card
      className={cn(
        "cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out flex flex-col justify-between border-l-4",
        policy.status === 'active' ? 'border-l-green-500' :
        policy.status === 'auto-pending' ? 'border-l-yellow-500' :
        policy.status === 'manual' ? 'border-l-blue-500' :
        'border-l-border'
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <PolicyIconComponent className="h-7 w-7 text-primary flex-shrink-0" />
                <CardTitle className="text-lg leading-tight">{policy.name}</CardTitle>
            </div>
            <Badge variant={statusVariant} className={cn("capitalize flex items-center gap-1 text-xs", statusTextClass)}>
                <StatusIcon className="h-3.5 w-3.5" />
                {policy.status.replace('-', ' ')}
            </Badge>
        </div>
         <CardDescription className="text-xs pt-1 flex flex-wrap gap-x-3 items-center">
            <span className="flex items-center gap-1"><Coins className="h-3.5 w-3.5 text-amber-500" /> Cost: {policy.creditCost} credits</span>
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
             ) : policy.status !== 'inactive' ? (
                 <Skeleton className="h-5 w-24" />
             ) : (
                  <p className="text-sm text-muted-foreground italic">Not applicable</p>
             )}

             <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                 {policy.isAdaptivePremium && (
                     <span className="flex items-center gap-1" title="Adaptive Cost Enabled">
                         <Activity className="h-3.5 w-3.5 text-purple-500" /> Adaptive Cost
                     </span>
                 )}
                 {policy.isAutoActive && (
                     <span className="flex items-center gap-1" title="Automatic Activation Enabled">
                         <Zap className="h-3.5 w-3.5 text-orange-500" /> Auto-Activate
                     </span>
                 )}
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