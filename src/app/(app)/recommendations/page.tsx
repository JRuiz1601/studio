'use client';

import { useState } from 'react';
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
import { Info, Lightbulb, BarChart, TrendingUp, Fingerprint, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  aiReasoning: string; // Explanation from AI
  predictedSavings?: number; // Optional predicted savings
  coverageAmount: number;
  estimatedPremium: number;
  type: 'new_policy' | 'upgrade' | 'adjustment';
}

// Mock data for recommendations
const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_pension_boost',
    title: 'Boost Your Pension Savings',
    aiReasoning: 'Our analysis suggests a potential gap in your retirement savings based on your age and current contributions. Increasing your voluntary pension contributions could significantly improve your long-term financial security.',
    predictedSavings: 15000, // Example predicted future value increase
    coverageAmount: 0, // Not applicable directly
    estimatedPremium: 50, // Additional monthly contribution
    type: 'adjustment',
  },
  {
    id: 'rec_travel_insurance',
    title: 'Consider Travel Insurance',
    aiReasoning: 'Based on your recent location data and upcoming calendar events (placeholder), short-term travel insurance might be beneficial for your planned trip.',
    coverageAmount: 2000,
    estimatedPremium: 15, // Estimated cost for a short trip
    type: 'new_policy',
  },
   {
     id: 'rec_health_upgrade',
     title: 'Upgrade Health Coverage',
     aiReasoning: 'Your current health plan has limitations. Based on general risk factors for your profile, upgrading to a plan with broader coverage is recommended for better protection against unexpected medical costs.',
     predictedSavings: 300, // Predicted annual saving by avoiding out-of-pocket costs
     coverageAmount: 25000, // Increased coverage
     estimatedPremium: 80, // New total premium
     type: 'upgrade',
   },
];

type SignatureStatus = 'idle' | 'signing' | 'success' | 'error';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<SignatureStatus>('idle');
  const { toast } = useToast();


   const handleActivate = async () => {
     if (!selectedRec) return;

     setSignatureStatus('signing');
     try {
       // Simulate biometric signature
       const result = await recognizeFace(); // Use facial recognition as biometric signature
       if (result.success) {
         setSignatureStatus('success');
         toast({
           title: "Recommendation Activated!",
           description: `${selectedRec.title} has been successfully activated.`,
         });
         // TODO: Add API call to confirm activation on the backend
         // Optionally remove the recommendation from the list or update its status
         setRecommendations(prev => prev.filter(r => r.id !== selectedRec.id));
          // Close dialog after a short delay
          setTimeout(() => {
              // Find the close button and click it programmatically
              const closeButton = document.querySelector('[data-radix-dialog-close]');
              if (closeButton instanceof HTMLElement) {
                  closeButton.click();
              }
             setSelectedRec(null);
             setSignatureStatus('idle');
          }, 1500);

       } else {
         throw new Error(result.message || 'Biometric signature failed.');
       }
     } catch (error) {
       console.error("Activation error:", error);
       setSignatureStatus('error');
       toast({
         title: "Activation Failed",
         description: error instanceof Error ? error.message : "Could not verify biometric signature.",
         variant: "destructive",
       });
        // Reset status after error display
        setTimeout(() => setSignatureStatus('idle'), 3000);
     }
   };

   const renderActivationButton = () => {
       switch (signatureStatus) {
         case 'signing':
           return <Button disabled className="w-full"><Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" /> Signing...</Button>;
         case 'success':
           return <Button disabled className="w-full bg-green-500 hover:bg-green-600"><Check className="mr-2 h-4 w-4" /> Activated!</Button>;
         case 'error':
           return <Button onClick={handleActivate} className="w-full" variant="destructive">Retry Activation</Button>;
         case 'idle':
         default:
           return <Button onClick={handleActivate} className="w-full"><Fingerprint className="mr-2 h-4 w-4" /> Activate with Biometrics</Button>;
       }
    };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Recommendations</h1>
      <p className="text-muted-foreground">AI-powered suggestions to optimize your coverage and savings.</p>

      {recommendations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
            <Dialog key={rec.id} onOpenChange={(open) => { if (!open) setSelectedRec(null); setSignatureStatus('idle'); }}>
              <DialogTrigger asChild>
                <Card
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedRec(rec)}
                    >
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      {rec.title}
                    </CardTitle>
                     <Badge variant="outline" className="w-fit capitalize">{rec.type.replace('_', ' ')}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{rec.aiReasoning}</p>
                  </CardContent>
                   <CardFooter className="text-sm pt-4">
                      {rec.predictedSavings !== undefined && (
                         <span className="flex items-center gap-1 text-green-600">
                           <TrendingUp className="h-4 w-4" /> Predicted Benefit: ${rec.predictedSavings.toLocaleString()}
                         </span>
                       )}
                        {rec.estimatedPremium > 0 && rec.predictedSavings === undefined && (
                            <span className="text-muted-foreground">Est. Cost: ${rec.estimatedPremium}/mo</span>
                        )}
                   </CardFooter>
                </Card>
              </DialogTrigger>
                {/* Dialog Content moved outside trigger */}
            </Dialog>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8">
          <CardHeader>
             <CardTitle>All Set!</CardTitle>
          </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">No new recommendations at this moment. We'll notify you if anything changes.</p>
           </CardContent>
        </Card>
      )}

       {/* Dialog Content for Details */}
       <DialogContent className="sm:max-w-lg">
         {selectedRec && (
           <>
             <DialogHeader>
               <DialogTitle className="text-xl">{selectedRec.title}</DialogTitle>
               <DialogDescription>Review the details and confirm activation.</DialogDescription>
             </DialogHeader>
             <div className="py-4 space-y-4">
               <div>
                 <h4 className="font-semibold mb-1 flex items-center gap-2"><Info className="h-4 w-4" /> AI Reasoning</h4>
                 <p className="text-sm text-muted-foreground">{selectedRec.aiReasoning}</p>
               </div>
                <Separator />
               <div>
                 <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="h-4 w-4" /> Details</h4>
                  <div className="space-y-1 text-sm">
                    {selectedRec.coverageAmount > 0 && (
                        <div className="flex justify-between"><span>Coverage Amount:</span> <span>${selectedRec.coverageAmount.toLocaleString()}</span></div>
                    )}
                     {selectedRec.estimatedPremium > 0 && (
                        <div className="flex justify-between"><span>Estimated Cost / Contribution:</span> <span>${selectedRec.estimatedPremium}/mo</span></div>
                     )}
                     {selectedRec.predictedSavings !== undefined && (
                        <div className="flex justify-between text-green-600"><span>Predicted Benefit:</span> <span>+${selectedRec.predictedSavings.toLocaleString()}</span></div>
                     )}
                     <div className="flex justify-between"><span>Type:</span> <Badge variant="secondary" className="capitalize">{selectedRec.type.replace('_', ' ')}</Badge></div>
                  </div>
               </div>
               <Separator />
                <p className="text-xs text-muted-foreground">By clicking activate, you agree to the terms associated with this {selectedRec.type === 'new_policy' ? 'new policy' : 'change'} and authorize the estimated premium charge or contribution, verified by your biometric signature.</p>
             </div>
             <DialogFooter>
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

    </div>
  );
}
