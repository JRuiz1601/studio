
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Lightbulb, BarChart, TrendingUp, Fingerprint, Check, Loader, GraduationCap, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { recognizeFace } from '@/services/biometrics'; // Assume biometric service exists

interface Recommendation {
  id: string;
  title: string;
  aiReasoning: string; // Explanation from AI (Now used as "reason")
  predictedSavings?: number; // Optional predicted savings
  coverageAmount?: number; // Optional, for insurance policies
  estimatedPremium?: number; // Optional estimated cost/contribution
  type: 'new_policy' | 'upgrade' | 'adjustment' | 'profile_update' | 'education_explore';
  icon: React.ComponentType<{ className?: string }>;
  benefit: string; // Explicit benefit
  ctaLabel: string; // Specific CTA text
}

// Mock data for recommendations, aligned with Dashboard structure - Translated to English
const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_profile_update',
    title: 'Optimize Your Recommendations!',
    aiReasoning: 'A complete profile helps us give you more accurate suggestions.', // reason
    benefit: 'Ensure your protection and advice perfectly match you.',
    ctaLabel: 'Review my Profile',
    icon: Users,
    type: 'profile_update',
  },
  {
    id: 'rec_education_explore',
    title: "Secure Your Children's University",
    aiReasoning: 'We detected that your dependents (simulated) are school-aged.', // reason
    benefit: 'Guarantee their future studies regardless of unforeseen events and start saving in a planned way.',
    ctaLabel: 'Explore Education Insurance',
    icon: GraduationCap,
    type: 'education_explore',
    coverageAmount: 20000, // Example data
    estimatedPremium: 60, // Example data
  },
  {
    id: 'rec_pension_boost',
    title: 'Boost Your Pension Savings',
    aiReasoning: 'Our analysis suggests a potential gap in your retirement savings based on your age and current contributions.', // reason
    predictedSavings: 15000,
    benefit: 'Increasing your voluntary pension contributions could significantly improve your long-term financial security.',
    ctaLabel: 'Increase Contributions',
    icon: TrendingUp,
    estimatedPremium: 50, // Additional monthly contribution
    type: 'adjustment',
  },
   {
     id: 'rec_health_upgrade',
     title: 'Upgrade Health Coverage',
     aiReasoning: 'Your current health plan has limitations based on general risk factors for your profile.', // reason
     predictedSavings: 300,
     benefit: 'Upgrading to a plan with broader coverage is recommended for better protection against unexpected medical costs.',
     ctaLabel: 'Explore Upgrade Options',
     coverageAmount: 25000, // Increased coverage
     estimatedPremium: 80, // New total premium
     icon: Lightbulb,
     type: 'upgrade',
   },
];

type SignatureStatus = 'idle' | 'signing' | 'success' | 'error';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // For initial loading simulation

  // Simulate fetching data
  useEffect(() => {
    setTimeout(() => {
      setRecommendations(mockRecommendations);
      setIsLoading(false);
    }, 1000);
  }, []);


   const handleActivate = async () => {
     if (!selectedRec) return;

     setSignatureStatus('signing');
     try {
       const result = await recognizeFace();
       if (result.success) {
         setSignatureStatus('success');
         toast({
           title: "Recommendation Action Processed!",
           description: `${selectedRec.title} action recorded.`,
         });
         setRecommendations(prev => prev.filter(r => r.id !== selectedRec.id));
          setTimeout(() => {
              setSelectedRec(null);
              setSignatureStatus('idle');
          }, 1500);

       } else {
         throw new Error(result.message || 'Biometric confirmation failed.');
       }
     } catch (error) {
       console.error("Action error:", error);
       setSignatureStatus('error');
       toast({
         title: "Action Failed",
         description: error instanceof Error ? error.message : "Could not verify biometric signature.",
         variant: "destructive",
       });
        setTimeout(() => setSignatureStatus('idle'), 3000);
     }
   };

   const renderActivationButton = () => {
       let buttonText = "Activate with Biometrics";
       if (selectedRec?.type === 'profile_update') {
           buttonText = "Confirm Action";
       } else if (selectedRec?.type === 'education_explore') {
           buttonText = "Confirm Interest";
       }

       switch (signatureStatus) {
         case 'signing':
           return <Button disabled className="w-full"><Loader className="h-4 w-4 mr-2 animate-spin" /> Signing...</Button>;
         case 'success':
           return <Button disabled className="w-full bg-green-500 hover:bg-green-600"><Check className="mr-2 h-4 w-4" /> Confirmed!</Button>;
         case 'error':
           return <Button onClick={handleActivate} className="w-full" variant="destructive">Retry Confirmation</Button>;
         case 'idle':
         default:
           return <Button onClick={handleActivate} className="w-full"><Fingerprint className="mr-2 h-4 w-4" /> {buttonText}</Button>;
       }
    };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Smart Ideas</h1>
      <p className="text-muted-foreground">AI-powered suggestions to optimize your protection and well-being.</p>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div className="p-4 flex justify-center items-center bg-muted/30 h-24 rounded-t-lg">
                <Skeleton className="h-12 w-12" />
              </div>
              <CardHeader className="pt-3 pb-1">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="flex-1 pt-1 pb-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/6" />
              </CardContent>
              <CardFooter className="pt-2 pb-4 border-t">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
                <Card
                    key={rec.id}
                    className="cursor-pointer hover:shadow-md transition-shadow flex flex-col border-l-4 border-primary/30"
                    onClick={() => setSelectedRec(rec)}
                    >
                  <div className="p-4 flex justify-center items-center bg-muted/30 h-24 rounded-t-lg">
                      <rec.icon className="h-12 w-12 text-primary opacity-80" />
                  </div>
                  <CardHeader className="pt-3 pb-1">
                     <CardTitle className="text-base font-medium">{rec.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-1 pb-3 space-y-2">
                      <div className="text-xs text-muted-foreground">
                          <p><span className="font-semibold text-foreground">Why now?</span> {rec.aiReasoning}</p>
                          <p><span className="font-semibold text-green-600">Benefit:</span> {rec.benefit}</p>
                      </div>
                  </CardContent>
                   <CardFooter className="pt-2 pb-4 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
                        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
                           <Link href={`/recommendations#${rec.id}`}>{rec.ctaLabel}</Link>
                        </Button>
                         <Button variant="ghost" size="sm" className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground w-full sm:w-auto justify-center sm:justify-end">
                             Maybe later
                         </Button>
                   </CardFooter>
                </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8 border-dashed">
          <CardHeader>
             <CardTitle>All Set!</CardTitle>
          </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">No new ideas for now. We'll notify you if anything changes.</p>
           </CardContent>
        </Card>
      )}

       <Dialog open={!!selectedRec} onOpenChange={(open) => { if (!open) { setSelectedRec(null); setSignatureStatus('idle'); } }}>
           <DialogContent className="sm:max-w-lg">
             {selectedRec && (
               <>
                 <DialogHeader>
                   <DialogTitle className="text-xl flex items-center gap-2">
                     <selectedRec.icon className="h-5 w-5 text-primary"/>
                     {selectedRec.title}
                    </DialogTitle>
                   <DialogDescription>Review the details and confirm the action.</DialogDescription>
                 </DialogHeader>
                 <div className="py-4 space-y-4">
                   <div>
                     <h4 className="font-semibold mb-1 flex items-center gap-2"><Info className="h-4 w-4" /> AI Reasoning</h4>
                     <p className="text-sm text-muted-foreground">
                         <strong>Why now?</strong> {selectedRec.aiReasoning} <br/>
                         <strong>Benefit:</strong> {selectedRec.benefit}
                     </p>
                   </div>
                    <Separator />
                   <div>
                     <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="h-4 w-4" /> Details</h4>
                      <div className="space-y-1 text-sm">
                        {selectedRec.coverageAmount !== undefined && selectedRec.coverageAmount > 0 && (
                            <div className="flex justify-between"><span>Coverage Amount:</span> <span>${selectedRec.coverageAmount.toLocaleString()}</span></div>
                        )}
                         {selectedRec.estimatedPremium !== undefined && selectedRec.estimatedPremium > 0 && (
                            <div className="flex justify-between"><span>Estimated Cost / Contribution:</span> <span>${selectedRec.estimatedPremium}/mo</span></div>
                         )}
                         {selectedRec.predictedSavings !== undefined && (
                            <div className="flex justify-between text-green-600"><span>Estimated Benefit:</span> _<span>+${selectedRec.predictedSavings.toLocaleString()}</span></div>
                         )}
                         <div className="flex justify-between"><span>Type:</span> <Badge variant="secondary" className="capitalize">{selectedRec.type.replace('_', ' ')}</Badge></div>
                      </div>
                   </div>
                   <Separator />
                    <p className="text-xs text-muted-foreground">By clicking confirm, you agree to the associated terms (if applicable) and authorize the action, verified by your biometric signature.</p>
                 </div>
                 <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                       <Button type="button" variant="secondary" disabled={signatureStatus === 'signing' || signatureStatus === 'success'}>
                         Cancel
                       </Button>
                    </DialogClose>
                    {renderActivationButton()}
                 </DialogFooter>
               </>
             )}
           </DialogContent>
        </Dialog>

    </div>
  );
}

