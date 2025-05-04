'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    ChevronLeft, ChevronRight, MapPin, Activity, ShieldQuestion, Smile, Database, Settings,
    HeartPulse, BatteryCharging, WifiOff, FileText, Fingerprint, Check, Loader
} from 'lucide-react';
import Image from 'next/image';
import type { WearableBattery, WearableConnectionStatus } from '@/services/wearable';
import { getWearableBatteryStatus, getWearableConnectionStatus } from '@/services/wearable';
import { recognizeFace } from '@/services/biometrics'; // Assuming biometric service exists
import { useToast } from '@/hooks/use-toast';

type DataPriority = 'wearable' | 'mobile_context';
type InsuranceKey = 'health' | 'accident' | 'pension' | 'renta' | 'education';

interface OnboardingState {
    safeDrivingDiscount: boolean;
    dataPriority: DataPriority;
    baseInsurances: Record<InsuranceKey, boolean>;
    autoActivateAll: boolean;
    simulatedPremium: number;
    wearableStatus: WearableConnectionStatus | null;
    wearableBattery: WearableBattery | null;
}

const TOTAL_STEPS = 8;

const insuranceOptions: { id: InsuranceKey; name: string; description: string }[] = [
    { id: 'health', name: 'Salud', description: 'Basic health coverage.' },
    { id: 'accident', name: 'Accidentes Personales', description: 'Coverage for accidents.' },
    { id: 'pension', name: 'Pensión Voluntaria', description: 'Supplemental retirement savings.' },
    { id: 'renta', name: 'Rentas Voluntarias', description: 'Income stream during retirement.' },
    { id: 'education', name: 'Seguro Educativo', description: 'Savings for future education costs.' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [onboardingState, setOnboardingState] = useState<OnboardingState>({
        safeDrivingDiscount: false,
        dataPriority: 'wearable',
        baseInsurances: { health: true, accident: true, pension: false, renta: false, education: false },
        autoActivateAll: true,
        simulatedPremium: 85, // Initial simulated premium
        wearableStatus: null,
        wearableBattery: null,
    });
    const [loadingWearable, setLoadingWearable] = useState(false);
    const [facialRecognitionStatus, setFacialRecognitionStatus] = useState<'idle' | 'signing' | 'success' | 'error'>('idle');
    const [isFinishing, setIsFinishing] = useState(false);

    // Fetch wearable status on step 5
    useEffect(() => {
        async function fetchWearable() {
            if (currentStep === 5 && onboardingState.wearableStatus === null) {
                setLoadingWearable(true);
                try {
                    const status = await getWearableConnectionStatus();
                    setOnboardingState(prev => ({ ...prev, wearableStatus: status }));
                    if (status === 'connected') {
                        const battery = await getWearableBatteryStatus();
                        setOnboardingState(prev => ({ ...prev, wearableBattery: battery }));
                    }
                } catch (error) {
                    console.error("Error fetching wearable status:", error);
                    setOnboardingState(prev => ({ ...prev, wearableStatus: 'disconnected' })); // Assume disconnected on error
                } finally {
                    setLoadingWearable(false);
                }
            }
        }
        fetchWearable();
    }, [currentStep, onboardingState.wearableStatus]);

    // Update simulated premium based on selections
    useEffect(() => {
        let base = 50; // Base premium
        if (onboardingState.safeDrivingDiscount) base -= 5;
        if (onboardingState.dataPriority === 'wearable') base += 10;
        const selectedCount = Object.values(onboardingState.baseInsurances).filter(Boolean).length;
        base += selectedCount * 8; // Add premium per selected insurance
        if (onboardingState.autoActivateAll) base += 5;

        setOnboardingState(prev => ({ ...prev, simulatedPremium: Math.max(20, base) })); // Ensure minimum premium
    }, [onboardingState.safeDrivingDiscount, onboardingState.dataPriority, onboardingState.baseInsurances, onboardingState.autoActivateAll]);


    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const handleCheckboxChange = (id: InsuranceKey, checked: boolean) => {
        setOnboardingState(prev => ({
            ...prev,
            baseInsurances: { ...prev.baseInsurances, [id]: checked },
        }));
    };

     const handleFinalSubmit = async () => {
         if (currentStep !== TOTAL_STEPS) return;
         setFacialRecognitionStatus('signing');
         setIsFinishing(true); // Disable navigation buttons

         try {
             // Simulate final facial recognition confirmation
             const result = await recognizeFace();
             if (result.success) {
                 setFacialRecognitionStatus('success');
                 console.log('Onboarding state to save:', onboardingState);
                 // TODO: Add API call to save onboarding state and complete profile setup
                 await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

                 toast({
                     title: 'Onboarding Complete!',
                     description: 'Welcome to Zyren. Redirecting to your dashboard.',
                 });
                 router.push('/dashboard'); // Redirect to the main dashboard page
             } else {
                 throw new Error(result.message || 'Facial confirmation failed.');
             }
         } catch (error) {
             console.error('Final submission error:', error);
             setFacialRecognitionStatus('error');
             toast({
                 title: 'Confirmation Failed',
                 description: error instanceof Error ? error.message : 'Could not confirm your identity.',
                 variant: 'destructive',
             });
             // Re-enable buttons on error
             setIsFinishing(false);
             setTimeout(() => setFacialRecognitionStatus('idle'), 3000); // Reset status after delay
         }
     };


    const renderStepContent = () => {
        switch (currentStep) {
            case 1: // Welcome
                return (
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-24 w-24 text-primary mx-auto mb-6">
                            <defs><linearGradient id="grad_onboarding" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} /><stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} /></linearGradient></defs>
                            <path fill="url(#grad_onboarding)" d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C25.15,95 5,74.85 5,50 C5,25.15 25.15,5 50,5 Z M50,15 C30.67,15 15,30.67 15,50 C15,69.33 30.67,85 50,85 C69.33,85 85,69.33 85,50 C85,30.67 69.33,15 50,15 Z M50,30 Q60,40 50,50 Q40,60 50,70 M50,30 Q70,50 50,70 M50,30 L50,70" stroke="hsl(var(--card))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <CardTitle className="text-2xl mb-2">Welcome to Zyren</CardTitle>
                        <CardDescription>Your personalized insurance companion. Let's get you set up in a few steps.</CardDescription>
                    </div>
                );
            case 2: // Permissions Explanation
                 return (
                     <div className="text-center space-y-6">
                         <CardTitle className="text-xl">Permissions We Need</CardTitle>
                         <CardDescription>To provide personalized recommendations and risk assessments, Zyren needs access to:</CardDescription>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                             <div className="flex items-start space-x-3 p-3 border rounded-md">
                                 <MapPin className="h-6 w-6 text-primary mt-1 shrink-0" />
                                 <div>
                                     <h4 className="font-medium">Location (GPS)</h4>
                                     <p className="text-xs text-muted-foreground">For location-based risk factors (weather, traffic) and context.</p>
                                 </div>
                             </div>
                             <div className="flex items-start space-x-3 p-3 border rounded-md">
                                 <Activity className="h-6 w-6 text-primary mt-1 shrink-0" />
                                 <div>
                                     <h4 className="font-medium">Wearables / Activity</h4>
                                     <p className="text-xs text-muted-foreground">For real-time health data (heart rate, stress) if available.</p>
                                 </div>
                             </div>
                             <div className="flex items-start space-x-3 p-3 border rounded-md">
                                <ShieldQuestion className="h-6 w-6 text-primary mt-1 shrink-0" />
                                 <div>
                                     <h4 className="font-medium">Automation (Optional)</h4>
                                     <p className="text-xs text-muted-foreground">To automatically activate/adjust policies based on detected risks.</p>
                                 </div>
                             </div>
                         </div>
                         <p className="text-xs text-muted-foreground">You can manage these permissions anytime in your device settings and within the app.</p>
                          {/* Placeholder for actual permission request buttons if needed on web */}
                          {/* <Button onClick={() => alert('Requesting Location...')}>Grant Location</Button> */}
                     </div>
                 );
            case 3: // Mini-tour
                 return (
                     <div className="text-center space-y-4">
                          <Smile className="h-16 w-16 text-primary mx-auto" />
                         <CardTitle className="text-xl">Zyren Learns With You</CardTitle>
                         <CardDescription>By analyzing data (securely and privately), Zyren adapts:</CardDescription>
                         <ul className="list-disc list-inside text-left text-sm space-y-2 text-muted-foreground max-w-md mx-auto">
                            <li>Suggests relevant insurance only when needed.</li>
                            <li>Offers potential premium discounts for safe behavior.</li>
                            <li>Helps identify gaps in your financial protection.</li>
                            <li>Provides real-time risk alerts and advice.</li>
                         </ul>
                         <p className="text-xs text-muted-foreground">Your data is always handled according to our strict Privacy Policy.</p>
                     </div>
                 );
            case 4: // Initial Preferences
                 return (
                     <div className="space-y-6">
                         <CardTitle className="text-xl text-center">Initial Preferences</CardTitle>
                         <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                             <Label htmlFor="safe-driving" className="flex-1">
                                 Enable potential premium discount for safe driving?
                                 <p className="text-xs text-muted-foreground">(Requires location/activity data)</p>
                             </Label>
                             <Switch
                                 id="safe-driving"
                                 checked={onboardingState.safeDrivingDiscount}
                                 onCheckedChange={(checked) => setOnboardingState(prev => ({ ...prev, safeDrivingDiscount: checked }))}
                             />
                         </div>
                         <div className="space-y-3 border p-4 rounded-md">
                             <Label className="font-medium">Data Priority for Risk Assessment</Label>
                             <RadioGroup
                                value={onboardingState.dataPriority}
                                onValueChange={(value: DataPriority) => setOnboardingState(prev => ({ ...prev, dataPriority: value }))}
                                className="flex flex-col sm:flex-row gap-4"
                             >
                                <Label htmlFor="priority-wearable-onboard" className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer flex-1 ${onboardingState.dataPriority === 'wearable' ? 'border-primary bg-primary/5' : ''}`}>
                                     <RadioGroupItem value="wearable" id="priority-wearable-onboard" />
                                     <span>Option A: Wearable (Recommended)</span>
                                </Label>
                                <Label htmlFor="priority-mobile-onboard" className={`flex items-center space-x-2 border p-3 rounded-md cursor-pointer flex-1 ${onboardingState.dataPriority === 'mobile_context' ? 'border-primary bg-primary/5' : ''}`}>
                                     <RadioGroupItem value="mobile_context" id="priority-mobile-onboard" />
                                     <span>Option B: Mobile + Context</span>
                                </Label>
                             </RadioGroup>
                              <p className="text-xs text-muted-foreground">Choose the primary data source for analysis. Wearable provides more personalized insights.</p>
                         </div>
                     </div>
                 );
             case 5: // Wearable Config
                 return (
                     <div className="space-y-6">
                         <CardTitle className="text-xl text-center">Wearable Configuration</CardTitle>
                         <Card className="p-4">
                            <CardHeader className="p-0 pb-4">
                                <CardTitle className="text-base flex items-center gap-2"><HeartPulse className="h-5 w-5" /> Wearable Status</CardTitle>
                            </CardHeader>
                             <CardContent className="p-0 space-y-3">
                                 {loadingWearable ? (
                                      <div className="flex items-center justify-center text-muted-foreground py-4">
                                          <Loader className="animate-spin h-5 w-5 mr-2" /> Checking status...
                                      </div>
                                 ) : onboardingState.wearableStatus === 'connected' ? (
                                     <>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Status:</span>
                                             <Badge variant="default" className="bg-green-500 hover:bg-green-600">Connected</Badge>
                                        </div>
                                         {onboardingState.wearableBattery && (
                                             <div className="flex justify-between items-center text-sm">
                                                 <span className="text-muted-foreground">Battery:</span>
                                                 <span className="flex items-center gap-1">
                                                     {onboardingState.wearableBattery.isCharging && <BatteryCharging className="h-4 w-4 text-yellow-500" />}
                                                     {onboardingState.wearableBattery.percentage}%
                                                 </span>
                                             </div>
                                         )}
                                     </>
                                 ) : (
                                      <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                                            <WifiOff className="h-8 w-8 mb-2" />
                                            <p>Wearable not detected or disconnected.</p>
                                            <Button variant="link" size="sm" onClick={() => alert('Navigate to wearable setup/purchase page')}>Connect or Request Wearable</Button>
                                      </div>
                                 )}
                             </CardContent>
                         </Card>
                         <p className="text-xs text-muted-foreground text-center">
                           Connect your wearable for the most accurate risk assessment and potential premium benefits. You can also request a Zyren wearable (if applicable).
                         </p>
                     </div>
                 );
             case 6: // Select Base Insurances
                 return (
                     <div className="space-y-6">
                         <CardTitle className="text-xl text-center">Select Your Base Insurances</CardTitle>
                         <CardDescription className="text-center">Choose the core coverages you'd like enabled by default.</CardDescription>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {insuranceOptions.map((opt) => (
                                <div key={opt.id} className="flex items-start space-x-3 rounded-md border p-4">
                                     <Checkbox
                                        id={`ins-${opt.id}`}
                                        checked={onboardingState.baseInsurances[opt.id]}
                                        onCheckedChange={(checked) => handleCheckboxChange(opt.id, !!checked)}
                                        className="mt-1"
                                    />
                                     <div className="grid gap-1.5 leading-none">
                                         <Label htmlFor={`ins-${opt.id}`} className="font-medium cursor-pointer">
                                             {opt.name}
                                         </Label>
                                         <p className="text-xs text-muted-foreground">{opt.description}</p>
                                     </div>
                                </div>
                             ))}
                         </div>
                         <div className="flex items-center space-x-3 border p-4 rounded-md bg-muted/30">
                             <Checkbox
                                id="auto-activate-all"
                                checked={onboardingState.autoActivateAll}
                                onCheckedChange={(checked) => setOnboardingState(prev => ({ ...prev, autoActivateAll: !!checked }))}
                            />
                            <Label htmlFor="auto-activate-all" className="cursor-pointer">
                                Enable automatic activation based on risk for selected policies?
                            </Label>
                         </div>
                     </div>
                 );
             case 7: // Dynamic Contract Summary & Premium Sim
                 return (
                     <div className="space-y-6">
                         <CardTitle className="text-xl text-center">Summary & Estimated Premium</CardTitle>
                         <Card className="p-4">
                             <CardHeader className="p-0 pb-4">
                                 <CardTitle className="text-base flex items-center gap-2"><FileText className="h-5 w-5" /> Initial Setup</CardTitle>
                             </CardHeader>
                             <CardContent className="p-0 space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">Safe Driving Discount:</span> <span>{onboardingState.safeDrivingDiscount ? 'Enabled' : 'Disabled'}</span></div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Data Priority:</span> <span className="capitalize">{onboardingState.dataPriority === 'wearable' ? 'Wearable' : 'Mobile + Context'}</span></div>
                                 <div className="flex justify-between items-start">
                                     <span className="text-muted-foreground">Base Insurances:</span>
                                     <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                                         {insuranceOptions
                                             .filter(opt => onboardingState.baseInsurances[opt.id])
                                             .map(opt => <Badge key={opt.id} variant="secondary" className="text-xs">{opt.name}</Badge>)
                                         }
                                         {Object.values(onboardingState.baseInsurances).filter(Boolean).length === 0 && <span className="text-xs">None Selected</span>}
                                     </div>
                                 </div>
                                 <div className="flex justify-between"><span className="text-muted-foreground">Auto-Activation:</span> <span>{onboardingState.autoActivateAll ? 'Enabled' : 'Disabled'}</span></div>
                             </CardContent>
                             <CardFooter className="p-0 pt-4 mt-4 border-t">
                                 <div className="flex justify-between w-full items-center">
                                     <span className="font-medium">Estimated Monthly Premium:</span>
                                     <span className="text-xl font-bold text-primary">${onboardingState.simulatedPremium}</span>
                                 </div>
                             </CardFooter>
                         </Card>
                         <p className="text-xs text-muted-foreground text-center">This is an initial estimate based on your selections. Premiums may adjust based on real-time data and risk factors. Final terms apply.</p>
                     </div>
                 );
             case 8: // Final Facial Capture & Submit
                 return (
                     <div className="text-center space-y-6">
                         <CardTitle className="text-xl">Final Confirmation</CardTitle>
                         <CardDescription>Please confirm your identity with a quick facial scan to complete the setup.</CardDescription>
                         <div className="flex justify-center my-6">
                             {facialRecognitionStatus === 'idle' && <Fingerprint className="h-20 w-20 text-primary" />}
                             {facialRecognitionStatus === 'signing' && <Loader className="h-20 w-20 text-primary animate-spin" />}
                             {facialRecognitionStatus === 'success' && <Check className="h-20 w-20 text-green-500" />}
                             {facialRecognitionStatus === 'error' && <Fingerprint className="h-20 w-20 text-destructive" />}
                         </div>
                         {facialRecognitionStatus === 'error' && (
                             <Alert variant="destructive">
                                 <AlertTitle>Confirmation Failed</AlertTitle>
                                 <AlertDescription>Could not verify identity. Please try again.</AlertDescription>
                             </Alert>
                         )}
                         <Button
                            onClick={handleFinalSubmit}
                            disabled={facialRecognitionStatus === 'signing' || facialRecognitionStatus === 'success' || isFinishing}
                            className="w-full max-w-xs mx-auto"
                         >
                            {facialRecognitionStatus === 'signing' ? 'Confirming...' : facialRecognitionStatus === 'success' ? 'Confirmed!' : facialRecognitionStatus === 'error' ? 'Retry Confirmation' : 'Confirm with Facial Scan'}
                         </Button>
                         <p className="text-xs text-muted-foreground">This secures your account and confirms your agreement to the initial setup.</p>
                     </div>
                 );
            default:
                return <div>Step {currentStep}</div>;
        }
    };

    return (
        <Card className="w-full max-w-xl lg:max-w-2xl relative overflow-hidden">
            {/* Progress Bar */}
            <Progress value={(currentStep / TOTAL_STEPS) * 100} className="absolute top-0 left-0 right-0 h-1 rounded-none" />

            {/* Header placeholder if needed */}
             <CardHeader className="pt-8 pb-4">
                 {/* Optionally add a title that persists across steps */}
                  {/* <CardTitle className="text-center text-lg font-medium">Onboarding</CardTitle> */}
             </CardHeader>

            <CardContent className="min-h-[400px] flex items-center justify-center px-6 md:px-10 py-8">
                 {/* Animated Content Area - using simple key prop for transition */}
                 <div key={currentStep} className="animate-in fade-in duration-500 w-full">
                    {renderStepContent()}
                 </div>
            </CardContent>

            <CardFooter className="flex justify-between items-center px-6 pb-6 border-t pt-4">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1 || isFinishing}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <span className="text-sm text-muted-foreground">Step {currentStep} of {TOTAL_STEPS}</span>
                 {currentStep < TOTAL_STEPS ? (
                    <Button onClick={nextStep} disabled={isFinishing}>
                         Next <ChevronRight className="h-4 w-4 ml-1" />
                     </Button>
                 ) : (
                    // The button inside step 8 handles the final action
                     <Button disabled={true} className="opacity-0 pointer-events-none">
                         Finish
                     </Button>
                 )}
            </CardFooter>
        </Card>
    );
}
