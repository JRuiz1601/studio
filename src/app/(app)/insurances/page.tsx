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
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Clock, History, SlidersHorizontal, Info, PlusCircle, TrendingUp, GraduationCap, ShieldCheck, HeartPulse, Home } from 'lucide-react'; // Added more icons
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { PolicyCard } from '@/components/policy-card'; // Use the enhanced card
import { Separator } from '@/components/ui/separator'; // Import Separator
import { cn } from '@/lib/utils'; // Import cn

// Define specific icons for policy types
export const policyIcons: { [key in PolicyType]: React.ComponentType<{ className?: string }> } = {
    health: HeartPulse,
    accident: ShieldCheck, // Changed from AlertCircle
    pension: TrendingUp,
    renta: Home, // Placeholder, maybe a building or money icon?
    education: GraduationCap,
};

export type PolicyType = 'health' | 'accident' | 'pension' | 'renta' | 'education';
export type PolicyStatus = 'active' | 'manual' | 'auto-pending' | 'inactive'; // Added 'inactive'

export interface Policy {
  id: string;
  name: string;
  type: PolicyType; // Added type for specific icon/styling
  status: PolicyStatus;
  isAutoActive: boolean;
  isAdaptivePremium: boolean;
  premium: number;
  coverageAmount: number;
  goalAmount?: number; // Optional for savings/education policies
  nextPaymentDate?: string; // Optional
  activationHistory: { reason: string; date: string }[];
}

// Mock data with types and more details
const mockPolicies: Policy[] = [
  { id: 'health1', name: 'Salud Esencial', type: 'health', status: 'active', isAutoActive: true, isAdaptivePremium: true, premium: 50, coverageAmount: 10000, nextPaymentDate: '2025-06-01', activationHistory: [{ reason: 'Initial activation', date: '2023-10-01' }] },
  { id: 'accident1', name: 'Accidentes Personales Plus', type: 'accident', status: 'auto-pending', isAutoActive: true, isAdaptivePremium: false, premium: 25, coverageAmount: 5000, nextPaymentDate: '2025-06-15', activationHistory: [] },
  { id: 'pension1', name: 'Pensión Voluntaria Futuro', type: 'pension', status: 'manual', isAutoActive: false, isAdaptivePremium: true, premium: 100, coverageAmount: 0, goalAmount: 50000, activationHistory: [{ reason: 'Manual contribution', date: '2023-11-15' }] },
  // Added inactive example
  { id: 'edu1', name: 'Seguro Educativo Crecer', type: 'education', status: 'inactive', isAutoActive: false, isAdaptivePremium: false, premium: 0, coverageAmount: 0, goalAmount: 20000, activationHistory: [] },
];

// Define potential policies the user doesn't have
const potentialPolicies: Pick<Policy, 'id' | 'name' | 'type' | 'description'>[] = [
    { id: 'potential-renta', name: 'Rentas Voluntarias Tranquilidad', type: 'renta', description: 'Flexible long-term savings for retirement or other goals.' },
    { id: 'potential-education', name: 'Seguro Educativo Crecer', type: 'education', description: 'Guarantee future education costs for your loved ones.' },
    // Add others if needed, ensure 'type' is correct for policyIcons
];


export default function InsurancesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]); // Start empty, fetch or load from mock
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [simulatedPremium, setSimulatedPremium] = useState<number | null>(null);
  const [formattedSliderAmounts, setFormattedSliderAmounts] = useState<{ min: string, max: string, current: string } | null>(null);

  // Simulate fetching data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
        setPolicies(mockPolicies);
        setIsLoading(false);
    }, 1000); // Simulate network delay
  }, []);


  // Format numbers inside useEffect to avoid hydration issues
  useEffect(() => {
      if (selectedPolicy) {
          const coverageOrGoal = selectedPolicy.goalAmount ?? selectedPolicy.coverageAmount ?? 0;
          const minVal = coverageOrGoal / 2 || 1000;
          const maxVal = coverageOrGoal * 2 || 50000;

          setFormattedSliderAmounts({
              min: minVal.toLocaleString(),
              max: maxVal.toLocaleString(),
              current: coverageOrGoal.toLocaleString()
          });
          // Reset simulated premium when policy changes
          setSimulatedPremium(null);
      } else {
          setFormattedSliderAmounts(null);
      }
  }, [selectedPolicy]);


  const handleToggleAutoActivate = (id: string, checked: boolean) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, isAutoActive: checked } : p))
    );
    if (selectedPolicy && selectedPolicy.id === id) {
      setSelectedPolicy(prev => prev ? { ...prev, isAutoActive: checked } : null);
    }
    // TODO: Add API call
  };

  const handleToggleAdaptivePremium = (id: string, checked: boolean) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, isAdaptivePremium: checked } : p))
    );
    if (selectedPolicy && selectedPolicy.id === id) {
      setSelectedPolicy(prev => prev ? { ...prev, isAdaptivePremium: checked } : null);
    }
    // TODO: Add API call
  };

  const handleSliderChange = (value: number[]) => {
    if (selectedPolicy) {
      const basePremium = selectedPolicy.premium;
      const currentVal = selectedPolicy.goalAmount ?? selectedPolicy.coverageAmount ?? 0;
      const newVal = value[0];

      // Example simulation: Premium scales with coverage/goal
      const factor = currentVal > 0 ? newVal / currentVal : 1;
      let simulated = basePremium * factor;

      // Adjust simulation for premium-based policies vs savings
      if (selectedPolicy.type === 'pension' || selectedPolicy.type === 'renta' || selectedPolicy.type === 'education') {
        // For savings, maybe slider adjusts contribution, not final premium directly
        // This is a simplified example, real logic might differ
        simulated = basePremium + (newVal - currentVal) * 0.005; // Example: cost per 1000 increase
      } else {
         simulated = basePremium * factor;
      }


      setSimulatedPremium(Math.max(10, Math.round(simulated))); // Ensure minimum
      setFormattedSliderAmounts(prev => prev ? { ...prev, current: newVal.toLocaleString() } : null);
    }
  };

  // Filter active policies
  const activePolicies = policies.filter(p => p.status !== 'inactive');
  // Filter potential policies that the user doesn't already have active
  const availablePolicies = potentialPolicies.filter(pp =>
    !activePolicies.some(ap => ap.type === pp.type)
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8"> {/* Increased spacing */}
      <h1 className="text-3xl font-semibold tracking-tight">My Insurances</h1>

      {isLoading ? (
        // Enhanced Skeleton Loading State
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="opacity-50">
                        <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardContent>
                        <CardFooter><Skeleton className="h-8 w-full" /></CardFooter>
                    </Card>
                ))}
            </div>
            <Separator />
             <Skeleton className="h-8 w-1/3" />
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {[...Array(2)].map((_, i) => (
                    <Card key={`skel-pot-${i}`} className="opacity-50">
                       <CardHeader><Skeleton className="h-6 w-2/3" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                         <CardFooter><Skeleton className="h-8 w-full" /></CardFooter>
                    </Card>
                 ))}
             </div>
        </div>
      ) : (
        <>
          {/* Section for Active Policies */}
          <div>
            <h2 className="text-xl font-medium mb-4">Your Active Coverage</h2>
            {activePolicies.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {activePolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      policy={policy}
                      onClick={() => setSelectedPolicy(policy)}
                    />
                  ))}
                </div>
            ) : (
                 <Card className="text-center p-8 border-dashed bg-muted/50">
                    <CardHeader>
                        <CardTitle className="text-lg font-normal text-muted-foreground">No Active Insurances</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You don't have any active policies yet. Explore options below!</p>
                    </CardContent>
                 </Card>
            )}
          </div>

          <Separator className="my-8" />

          {/* Section to Explore New Insurances */}
          <div>
            <h2 className="text-xl font-medium mb-4">Explore Other Options</h2>
            {availablePolicies.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {availablePolicies.map((potential) => {
                     const Icon = policyIcons[potential.type] || Info; // Fallback icon
                     return (
                        <Card key={potential.id} className="border-dashed border-primary/50 hover:shadow-lg transition-shadow flex flex-col justify-between">
                           <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <Icon className="h-8 w-8 text-primary flex-shrink-0" />
                                <CardTitle className="text-lg">{potential.name}</CardTitle>
                           </CardHeader>
                           <CardContent>
                                <p className="text-sm text-muted-foreground">{potential.description}</p>
                           </CardContent>
                           <CardFooter>
                                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 hover:text-primary" asChild>
                                    {/* Link to recommendations or a specific product page */}
                                    <Link href="/recommendations">
                                       Learn More <PlusCircle className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                           </CardFooter>
                        </Card>
                     );
                    })}
                </div>
            ) : (
                <p className="text-muted-foreground text-center">You currently have all available insurance types active.</p>
            )}
          </div>
        </>
      )}


      {/* Dialog for Policy Details and Management */}
      <Dialog
          open={!!selectedPolicy}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPolicy(null);
              // Reset simulated premium and slider amounts when closing
              setSimulatedPremium(null);
              setFormattedSliderAmounts(null);
            }
          }}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
          {selectedPolicy && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                    {(policyIcons[selectedPolicy.type] || Info)({ className: "h-6 w-6 text-primary" })}
                    <DialogTitle className="text-xl">{selectedPolicy.name}</DialogTitle>
                </div>
                <DialogDescription>Manage settings and explore details for this policy.</DialogDescription>
              </DialogHeader>
              <TooltipProvider>
                <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto px-1"> {/* Make content scrollable */}
                  {/* Current Status & Key Info */}
                  <div className="border p-4 rounded-md bg-muted/30">
                     <h4 className="font-medium mb-2 flex items-center gap-2"><Info className="h-4 w-4" /> Current Status</h4>
                     <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Status:</span> <span className={cn("capitalize font-medium", selectedPolicy.status === 'active' ? 'text-green-600' : selectedPolicy.status === 'auto-pending' ? 'text-yellow-600' : 'text-muted-foreground')}>{selectedPolicy.status.replace('-', ' ')}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Current Premium:</span> <span className="font-semibold">${selectedPolicy.premium}/mo</span></div>
                        {selectedPolicy.coverageAmount > 0 && (
                            <div className="flex justify-between"><span className="text-muted-foreground">Coverage Amount:</span> <span>${selectedPolicy.coverageAmount.toLocaleString()}</span></div>
                        )}
                         {selectedPolicy.goalAmount !== undefined && (
                            <div className="flex justify-between"><span className="text-muted-foreground">Goal Amount:</span> <span>${selectedPolicy.goalAmount.toLocaleString()}</span></div>
                         )}
                        {selectedPolicy.nextPaymentDate && (
                             <div className="flex justify-between"><span className="text-muted-foreground">Next Payment:</span> <span>{selectedPolicy.nextPaymentDate}</span></div>
                         )}
                     </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`auto-activate-${selectedPolicy.id}`} className="flex-1">
                        Automatic Activation
                      </Label>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Automatically activate coverage based on detected risks.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id={`auto-activate-${selectedPolicy.id}`}
                      checked={selectedPolicy.isAutoActive}
                      onCheckedChange={(checked) => handleToggleAutoActivate(selectedPolicy.id, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`adaptive-premium-${selectedPolicy.id}`} className="flex-1">
                        Adaptive Premium
                      </Label>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Allow premium adjustments based on risk factors (e.g., driving habits, wellness data).</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id={`adaptive-premium-${selectedPolicy.id}`}
                      checked={selectedPolicy.isAdaptivePremium}
                      onCheckedChange={(checked) => handleToggleAdaptivePremium(selectedPolicy.id, checked)}
                    />
                  </div>

                  {/* Premium/Goal Simulator */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h4 className="font-medium flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Simulator</h4>
                     <div className="space-y-2">
                        <Label htmlFor={`value-slider-${selectedPolicy.id}`}>
                             Adjust {selectedPolicy.goalAmount !== undefined ? 'Goal' : 'Coverage'} Amount: {formattedSliderAmounts ? `$${formattedSliderAmounts.current}` : <Skeleton className="h-4 w-16 inline-block" />}
                        </Label>
                        <Slider
                            id={`value-slider-${selectedPolicy.id}`}
                            defaultValue={[selectedPolicy.goalAmount ?? selectedPolicy.coverageAmount ?? 0]}
                            max={Number((selectedPolicy.goalAmount ?? selectedPolicy.coverageAmount ?? 0) * 2) || 50000}
                            min={Number((selectedPolicy.goalAmount ?? selectedPolicy.coverageAmount ?? 0) / 2) || 1000}
                            step={1000}
                            onValueChange={handleSliderChange}
                            className="py-2"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formattedSliderAmounts ? `$${formattedSliderAmounts.min}` : <Skeleton className="h-4 w-12 inline-block" />}</span>
                            <span>{formattedSliderAmounts ? `$${formattedSliderAmounts.max}` : <Skeleton className="h-4 w-16 inline-block" />}</span>
                        </div>
                    </div>
                     <p className="text-sm font-medium">
                         {simulatedPremium !== null ? (
                            <span>Simulated Premium: <span className="text-primary">${simulatedPremium}/mo</span></span>
                         ) : (
                             <span>Current Premium: ${selectedPolicy.premium}/mo</span>
                         )}
                     </p>
                    <p className="text-xs text-muted-foreground">Note: This is an estimate. Actual premium may vary based on underwriting and other factors.</p>
                  </div>

                  {/* Activation History */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h4 className="font-medium flex items-center gap-2"><History className="h-4 w-4" /> Activation History</h4>
                    {selectedPolicy.activationHistory.length > 0 ? (
                      <ul className="space-y-2 text-sm max-h-24 overflow-y-auto"> {/* Limit height */}
                        {selectedPolicy.activationHistory.map((item, index) => (
                          <li key={index} className="flex justify-between items-center border-b border-border/50 pb-1 last:border-b-0">
                            <span>{item.reason}</span>
                             <span className="text-muted-foreground text-xs">{item.date}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No activation history yet.</p>
                    )}
                  </div>

                </div>
              </TooltipProvider>
              <DialogFooter className="pt-4 border-t">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Close
                  </Button>
                </DialogClose>
                 {/* Optional Save Button - Enable if changes are made */}
                 {/* <Button type="button" disabled={!isDirty}>Save Changes</Button> */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Label component if not already globally available or imported
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
    {children}
  </label>
);