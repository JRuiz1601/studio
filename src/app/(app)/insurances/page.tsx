
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Clock, History, SlidersHorizontal, Info, Skeleton } from 'lucide-react'; // Added Skeleton
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Keep trigger if needed, but onClick on Card is used here
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { PolicyCard } from '@/components/policy-card'; // Import the new component

type PolicyStatus = 'active' | 'manual' | 'auto-pending'; // Example statuses

export interface Policy { // Export Policy interface
  id: string;
  name: string;
  status: PolicyStatus;
  isAutoActive: boolean;
  isAdaptivePremium: boolean;
  premium: number;
  coverageAmount: number; // Example detail
  activationHistory: { reason: string; date: string }[];
}

// Mock data
const mockPolicies: Policy[] = [
  { id: 'health1', name: 'Salud Esencial', status: 'active', isAutoActive: true, isAdaptivePremium: true, premium: 50, coverageAmount: 10000, activationHistory: [{ reason: 'Initial activation', date: '2023-10-01' }] },
  { id: 'accident1', name: 'Accidentes Personales Plus', status: 'auto-pending', isAutoActive: true, isAdaptivePremium: false, premium: 25, coverageAmount: 5000, activationHistory: [] },
  { id: 'pension1', name: 'Pensión Voluntaria Futuro', status: 'manual', isAutoActive: false, isAdaptivePremium: true, premium: 100, coverageAmount: 0, activationHistory: [{ reason: 'Manual contribution', date: '2023-11-15' }] },
  { id: 'renta1', name: 'Rentas Voluntarias Tranquilidad', status: 'active', isAutoActive: true, isAdaptivePremium: true, premium: 75, coverageAmount: 0, activationHistory: [{ reason: 'Risk threshold met', date: '2024-01-20' }] },
  { id: 'edu1', name: 'Seguro Educativo Crecer', status: 'manual', isAutoActive: false, isAdaptivePremium: false, premium: 60, coverageAmount: 20000, activationHistory: [] },
];

export default function InsurancesPage() {
  const [policies, setPolicies] = useState<Policy[]>(mockPolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [simulatedPremium, setSimulatedPremium] = useState<number | null>(null);
  const [formattedSliderAmounts, setFormattedSliderAmounts] = useState<{ min: string, max: string, current: string } | null>(null);

  // Format numbers inside useEffect to avoid hydration issues
  useEffect(() => {
      if (selectedPolicy) {
          setFormattedSliderAmounts({
              min: (selectedPolicy.coverageAmount / 2 || 1000).toLocaleString(),
              max: (selectedPolicy.coverageAmount * 2 || 50000).toLocaleString(),
              current: selectedPolicy.coverageAmount.toLocaleString()
          });
      } else {
          setFormattedSliderAmounts(null);
      }
  }, [selectedPolicy]);


  const handleToggleAutoActivate = (id: string, checked: boolean) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, isAutoActive: checked } : p))
    );
    // Update selectedPolicy state if it's the one being modified
    if (selectedPolicy && selectedPolicy.id === id) {
      setSelectedPolicy(prev => prev ? { ...prev, isAutoActive: checked } : null);
    }
    // TODO: Add API call to update setting
  };

  const handleToggleAdaptivePremium = (id: string, checked: boolean) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, isAdaptivePremium: checked } : p))
    );
    // Update selectedPolicy state if it's the one being modified
    if (selectedPolicy && selectedPolicy.id === id) {
      setSelectedPolicy(prev => prev ? { ...prev, isAdaptivePremium: checked } : null);
    }
    // TODO: Add API call to update setting
  };

  const handleSliderChange = (value: number[]) => {
    if (selectedPolicy) {
      // Simulate premium change based on slider (e.g., coverage amount)
      const basePremium = selectedPolicy.premium;
      // Example simulation: Premium increases with coverage amount
      const simulated = basePremium + (value[0] - selectedPolicy.coverageAmount) * 0.001;
      setSimulatedPremium(Math.max(10, Math.round(simulated))); // Ensure minimum premium

      // Update formatted current value for slider label
      setFormattedSliderAmounts(prev => prev ? { ...prev, current: value[0].toLocaleString() } : null);
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Mis Seguros</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            onClick={() => setSelectedPolicy(policy)}
          />
        ))}
      </div>

      {/* Dialog remains here, controlled by selectedPolicy state */}
      <Dialog
          open={!!selectedPolicy}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedPolicy(null);
              setSimulatedPremium(null);
              setFormattedSliderAmounts(null); // Clear formatted amounts on close
            }
          }}
      >
        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
          {/* Render content only if a policy is selected */}
          {selectedPolicy && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedPolicy.name}</DialogTitle>
                <DialogDescription>Manage your policy settings and view details.</DialogDescription>
              </DialogHeader>
              <TooltipProvider>
                <div className="grid gap-6 py-4">
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
                          <p>Allow premium adjustments based on risk factors (e.g., driving habits).</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id={`adaptive-premium-${selectedPolicy.id}`}
                      checked={selectedPolicy.isAdaptivePremium}
                      onCheckedChange={(checked) => handleToggleAdaptivePremium(selectedPolicy.id, checked)}
                    />
                  </div>

                  {/* Premium Simulator */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h4 className="font-medium flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /> Premium Simulator</h4>
                    <div className="space-y-2">
                      <Label htmlFor={`coverage-slider-${selectedPolicy.id}`}>
                          Adjust Coverage Amount: {formattedSliderAmounts ? `$${formattedSliderAmounts.current}` : <Skeleton className="h-4 w-16 inline-block" />}
                      </Label>
                      <Slider
                        id={`coverage-slider-${selectedPolicy.id}`}
                        defaultValue={[selectedPolicy.coverageAmount]}
                        max={selectedPolicy.coverageAmount * 2 || 50000} // Example max
                        min={selectedPolicy.coverageAmount / 2 || 1000} // Example min
                        step={1000}
                        onValueChange={handleSliderChange}
                        className="py-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        {/* Show formatted min/max if available, else Skeleton */}
                        <span>{formattedSliderAmounts ? `$${formattedSliderAmounts.min}` : <Skeleton className="h-4 w-12 inline-block" />}</span>
                        <span>{formattedSliderAmounts ? `$${formattedSliderAmounts.max}` : <Skeleton className="h-4 w-16 inline-block" />}</span>
                      </div>
                    </div>
                    <p className="text-sm">
                      Current Premium: <span className="font-semibold">${selectedPolicy.premium}/mo</span>
                      {simulatedPremium !== null && (
                        <span className="ml-4">Simulated Premium: <span className="font-semibold">${simulatedPremium}/mo</span></span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Note: This is an estimate. Actual premium may vary.</p>
                  </div>

                  {/* Activation History */}
                  <div className="space-y-4 border p-4 rounded-md">
                    <h4 className="font-medium flex items-center gap-2"><History className="h-4 w-4" /> Activation History</h4>
                    {selectedPolicy.activationHistory.length > 0 ? (
                      <ul className="space-y-2 text-sm max-h-32 overflow-y-auto">
                        {selectedPolicy.activationHistory.map((item, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.reason}</span>
                             {/* Format date without relying on locale-sensitive methods */}
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                {/* Optional Save Button */}
                {/* <Button type="button">Save Changes</Button> */}
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

