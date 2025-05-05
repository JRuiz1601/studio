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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertCircle, CheckCircle, Clock, History, SlidersHorizontal, Info } from 'lucide-react';
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

type PolicyStatus = 'active' | 'manual' | 'auto-pending'; // Example statuses

interface Policy {
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
    }
  };

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

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Mis Seguros</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => (
          <Dialog
            key={policy.id}
            // Control open state based on selectedPolicy
            open={selectedPolicy?.id === policy.id}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedPolicy(null); // Clear selection on close
                setSimulatedPremium(null);
              }
              // Setting selectedPolicy happens via the Card's onClick
            }}
          >
            {/* Use DialogTrigger if the trigger should be visually distinct */}
            {/* <DialogTrigger asChild> */}
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPolicy(policy)} // Set selection on click
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
                  {/* Short details or summary */}
                  <p className="text-sm text-muted-foreground">Coverage: ${policy.coverageAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            {/* </DialogTrigger> */}

            {/* Dialog Content INSIDE the Dialog component */}
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
              {/* Render content only if this specific policy is selected */}
              {selectedPolicy?.id === policy.id && (
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
                          <Label htmlFor={`coverage-slider-${selectedPolicy.id}`}>Adjust Coverage Amount</Label>
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
                            <span>${(selectedPolicy.coverageAmount / 2 || 1000).toLocaleString()}</span>
                            <span>${(selectedPolicy.coverageAmount * 2 || 50000).toLocaleString()}</span>
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
                                <span className="text-muted-foreground text-xs">{new Date(item.date).toLocaleDateString()}</span>
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
        ))}
      </div>
    </div>
  );
}

// Helper Label component if not already globally available or imported
const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" {...props}>
    {children}
  </label>
);