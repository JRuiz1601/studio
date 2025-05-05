
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
import { Info, Lightbulb, BarChart, TrendingUp, Fingerprint, Check, Loader, GraduationCap, Users } from 'lucide-react'; // Added relevant icons
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger is not needed here as we control open state manually
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
  type: 'new_policy' | 'upgrade' | 'adjustment' | 'profile_update' | 'education_explore'; // Added new types
  icon: React.ComponentType<{ className?: string }>;
  benefit: string; // Explicit benefit
  ctaLabel: string; // Specific CTA text
}

// Mock data for recommendations, aligned with Dashboard structure
const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_profile_update',
    title: '¡Optimiza tus Recomendaciones!',
    aiReasoning: 'Un perfil completo nos ayuda a darte sugerencias más precisas.', // reason
    benefit: 'Asegúrate de que tu protección y consejos se ajustan perfectamente a ti.',
    ctaLabel: 'Revisar mi Perfil',
    icon: Users,
    type: 'profile_update',
  },
  {
    id: 'rec_education_explore',
    title: 'Asegura la U. de tus Hijos',
    aiReasoning: 'Detectamos que tus dependientes (simulado) están en edad escolar.', // reason
    benefit: 'Garantiza sus estudios futuros sin importar imprevistos y empieza a ahorrar de forma planificada.',
    ctaLabel: 'Explorar Seguro Educativo',
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
    icon: TrendingUp, // Use a relevant icon
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
     icon: Lightbulb, // Placeholder icon
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
           title: "Recommendation Action Simulated!", // Changed message as activation isn't always the case
           description: `${selectedRec.title} action recorded.`,
         });
         // TODO: Add API call to confirm activation/action on the backend
         // Optionally remove the recommendation from the list or update its status
         setRecommendations(prev => prev.filter(r => r.id !== selectedRec.id));
          // Close dialog after a short delay
          setTimeout(() => {
              setSelectedRec(null); // This will trigger the onOpenChange of the Dialog
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
        // Reset status after error display
        setTimeout(() => setSignatureStatus('idle'), 3000);
     }
   };

   const renderActivationButton = () => {
       // Adjust button text based on recommendation type
       let buttonText = "Activate with Biometrics";
       if (selectedRec?.type === 'profile_update') {
           buttonText = "Confirm Action"; // Or similar if no backend activation needed
       } else if (selectedRec?.type === 'education_explore') {
           buttonText = "Confirm Interest"; // If it just navigates or records interest
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
      <h1 className="text-2xl font-semibold">Ideas Inteligentes</h1> {/* Updated Title */}
      <p className="text-muted-foreground">Sugerencias basadas en IA para optimizar tu protección y bienestar.</p>

      {recommendations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => (
                // Removed Dialog wrapper from here, Card is just a trigger
                <Card
                    key={rec.id} // Added key here
                    className="cursor-pointer hover:shadow-md transition-shadow flex flex-col" // Added flex-col for footer alignment
                    onClick={() => setSelectedRec(rec)}
                    >
                  {/* Visual Element Area - Placeholder for illustration/larger icon */}
                  <div className="p-4 flex justify-center items-center bg-muted/30 h-24 rounded-t-lg">
                      <rec.icon className="h-12 w-12 text-primary opacity-80" />
                  </div>
                  <CardHeader className="pt-3 pb-1">
                     <CardTitle className="text-base font-medium">{rec.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pt-1 pb-3 space-y-2">
                      {/* XAI Explanation */}
                      <div className="text-xs text-muted-foreground">
                          <p><span className="font-semibold text-foreground">¿Por qué ahora?</span> {rec.aiReasoning}</p>
                          <p><span className="font-semibold text-green-600">Beneficio:</span> {rec.benefit}</p>
                      </div>
                  </CardContent>
                   <CardFooter className="pt-2 pb-4 border-t">
                       {/* Button inside CardFooter for better alignment */}
                      <Button variant="secondary" size="sm" className="w-full">
                         {rec.ctaLabel}
                      </Button>
                      {/* "Perhaps later" button removed for simplicity, can be added back */}
                   </CardFooter>
                </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center p-8 border-dashed">
          <CardHeader>
             <CardTitle>¡Todo Listo!</CardTitle> {/* Updated Title */}
          </CardHeader>
           <CardContent>
             <p className="text-muted-foreground">No hay nuevas ideas por ahora. Te notificaremos si algo cambia.</p>
           </CardContent>
        </Card>
      )}

       {/* Single Dialog controlled by selectedRec state */}
       <Dialog open={!!selectedRec} onOpenChange={(open) => { if (!open) { setSelectedRec(null); setSignatureStatus('idle'); } }}>
           <DialogContent className="sm:max-w-lg">
             {selectedRec && (
               <>
                 <DialogHeader>
                   <DialogTitle className="text-xl flex items-center gap-2">
                     <selectedRec.icon className="h-5 w-5 text-primary"/>
                     {selectedRec.title}
                    </DialogTitle>
                   <DialogDescription>Revisa los detalles y confirma la acción.</DialogDescription>
                 </DialogHeader>
                 <div className="py-4 space-y-4">
                   <div>
                     <h4 className="font-semibold mb-1 flex items-center gap-2"><Info className="h-4 w-4" /> Razonamiento IA</h4>
                     <p className="text-sm text-muted-foreground">
                         <strong>¿Por qué ahora?</strong> {selectedRec.aiReasoning} <br/>
                         <strong>Beneficio:</strong> {selectedRec.benefit}
                     </p>
                   </div>
                    <Separator />
                   <div>
                     <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart className="h-4 w-4" /> Detalles</h4>
                      <div className="space-y-1 text-sm">
                        {selectedRec.coverageAmount !== undefined && selectedRec.coverageAmount > 0 && (
                            <div className="flex justify-between"><span>Monto Cobertura:</span> <span>${selectedRec.coverageAmount.toLocaleString()}</span></div>
                        )}
                         {selectedRec.estimatedPremium !== undefined && selectedRec.estimatedPremium > 0 && (
                            <div className="flex justify-between"><span>Costo / Contribución Estimada:</span> <span>${selectedRec.estimatedPremium}/mo</span></div>
                         )}
                         {selectedRec.predictedSavings !== undefined && (
                            <div className="flex justify-between text-green-600"><span>Beneficio Estimado:</span> <span>+${selectedRec.predictedSavings.toLocaleString()}</span></div>
                         )}
                         <div className="flex justify-between"><span>Tipo:</span> <Badge variant="secondary" className="capitalize">{selectedRec.type.replace('_', ' ')}</Badge></div>
                      </div>
                   </div>
                   <Separator />
                    <p className="text-xs text-muted-foreground">Al hacer clic en confirmar, aceptas los términos asociados (si aplica) y autorizas la acción, verificada mediante tu firma biométrica.</p>
                 </div>
                 <DialogFooter className="gap-2 sm:gap-0"> {/* Add gap for mobile */}
                    <DialogClose asChild>
                       <Button type="button" variant="secondary" disabled={signatureStatus === 'signing' || signatureStatus === 'success'}>
                         Cancelar
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

