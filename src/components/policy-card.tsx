
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, SlidersHorizontal, Clock, Info } from 'lucide-react';
import type { Policy } from '@/app/(app)/insurances/page'; // Import Policy type

interface PolicyCardProps {
  policy: Policy;
  onClick: () => void;
}

type PolicyStatus = Policy['status'];

const getStatusBadgeVariant = (status: PolicyStatus): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'active': return 'default'; // Consider a success variant if available
      case 'manual': return 'secondary';
      case 'auto-pending': return 'outline'; // Consider a warning variant
      default: return 'secondary';
    }
};

const getStatusIcon = (status: PolicyStatus) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'manual': return <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />;
      case 'auto-pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
};

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const [formattedCoverage, setFormattedCoverage] = useState<string | null>(null);

  useEffect(() => {
    // Format the coverage amount only on the client side
    setFormattedCoverage(policy.coverageAmount.toLocaleString());
  }, [policy.coverageAmount]);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{policy.name}</CardTitle>
          <Badge variant={getStatusBadgeVariant(policy.status)} className="capitalize flex items-center gap-1">
            {getStatusIcon(policy.status)}
            {policy.status.replace('-', ' ')}
          </Badge>
        </div>
        <CardDescription>Current Premium: ${policy.premium}/mo</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display formatted coverage or a placeholder */}
        <p className="text-sm text-muted-foreground">
          Coverage: {formattedCoverage ? `$${formattedCoverage}` : 'Loading...'}
        </p>
      </CardContent>
    </Card>
  );
}

