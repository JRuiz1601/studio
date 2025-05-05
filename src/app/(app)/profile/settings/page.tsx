'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Save, Info, Moon, Sun } from 'lucide-react'; // Added Moon and Sun
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

// Mock settings - fetch these from user preferences API
type DataPriority = 'wearable' | 'mobile_context';

const mockSettings = {
  dataPriority: 'mobile_context' as DataPriority, // Default changed to mobile_context
  expertMode: false,
  facialRecognitionEnabled: true, // Assume it's enabled after setup
  // Add darkMode setting - default to system preference initially
};


export default function SettingsPage() {
  const [dataPriority, setDataPriority] = useState<DataPriority>(mockSettings.dataPriority); // Initialize with mockSettings default
  const [expertMode, setExpertMode] = useState<boolean>(mockSettings.expertMode);
   // Dark Mode State - initialize from localStorage or system preference
   const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
       if (typeof window !== 'undefined') {
           const storedTheme = localStorage.getItem('theme');
           if (storedTheme === 'dark') return true;
           if (storedTheme === 'light') return false;
           // If no preference stored, check system preference
           return window.matchMedia('(prefers-color-scheme: dark)').matches;
       }
       return false; // Default for server rendering
   });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


   // Effect to apply dark mode class and store preference
   useEffect(() => {
       const root = window.document.documentElement;
       if (isDarkMode) {
           root.classList.add('dark');
           localStorage.setItem('theme', 'dark');
       } else {
           root.classList.remove('dark');
           localStorage.setItem('theme', 'light');
       }
   }, [isDarkMode]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    // Include darkMode in saved settings if API supports it
    const newSettings = { dataPriority, expertMode, darkMode: isDarkMode };
    console.log('Saving settings:', newSettings);

    // TODO: Replace with actual API call to save user settings
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

    setIsLoading(false);
    toast({
      title: 'Settings Saved',
      description: 'Your preferences have been updated.',
    });
    // Update mock settings after successful save
    Object.assign(mockSettings, newSettings);
     // Reset hasChanges calculation based on saved state
  };

   const handleManageFacialRecognition = () => {
       // Navigate to the facial recognition management/setup page
       router.push('/facial-recognition');
   };

   const handleRemoveFacialRecognition = async () => {
       setIsLoading(true);
       console.log('Removing facial recognition...');
       // TODO: Add API call to remove facial recognition data and disable it
       await new Promise((resolve) => setTimeout(resolve, 1000));
       setIsLoading(false);
       mockSettings.facialRecognitionEnabled = false; // Update mock state
       toast({
           title: 'Facial Recognition Removed',
           description: 'You can set it up again later if needed.',
       });
       // Optionally force re-render or state update if needed
   };

   // Check if settings have changed from the initial mock/fetched state
   // Note: Dark mode changes are applied immediately via useEffect,
   // but we might still want to track if it differs from the *saved* state if saving to backend.
   // For now, we check against the component's initial load state.
   const hasChanges = dataPriority !== mockSettings.dataPriority || expertMode !== mockSettings.expertMode;


  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application preferences and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <TooltipProvider>
             {/* Dark Mode Toggle */}
             <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                    {isDarkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                   <Label htmlFor="dark-mode" className="text-base font-medium">Dark Mode</Label>
                </div>
                <Switch
                   id="dark-mode"
                   checked={isDarkMode}
                   onCheckedChange={setIsDarkMode}
                   disabled={isLoading}
                 />
             </div>

             {/* Data Priority Setting */}
             <div className="space-y-4 border p-4 rounded-md">
               <div className="flex items-center justify-between">
                 <Label className="text-base font-medium">Data Priority</Label>
                   <Tooltip delayDuration={100}>
                       <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                             <Info className="h-4 w-4" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent side="left" className="max-w-xs">
                         <p>Choose the primary data source Zyren should prioritize for risk assessment and premium adjustments (if applicable).</p>
                         <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                            <li><strong>Mobile + Context (Default):</strong> Relies on phone sensors (activity, location) and contextual data (weather, traffic).</li>
                            <li><strong>Wearable (Optional Upgrade):</strong> Prioritizes real-time heart rate, stress levels, etc. Provides the most accurate, personalized insights. Requires setup/delivery.</li>
                         </ul>
                       </TooltipContent>
                   </Tooltip>
               </div>
               <RadioGroup
                 value={dataPriority}
                 onValueChange={(value: DataPriority) => setDataPriority(value)}
                 className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                 disabled={isLoading}
               >
                 <Label htmlFor="priority-mobile" className={`flex flex-col items-start space-y-2 rounded-md border p-4 cursor-pointer hover:border-primary ${dataPriority === 'mobile_context' ? 'border-primary bg-primary/5' : ''}`}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile_context" id="priority-mobile" />
                      <span>Mobile + Context (Default)</span>
                    </div>
                   <span className="text-sm text-muted-foreground">Use phone sensors and contextual information.</span>
                 </Label>
                 <Label htmlFor="priority-wearable" className={`flex flex-col items-start space-y-2 rounded-md border p-4 cursor-pointer hover:border-primary ${dataPriority === 'wearable' ? 'border-primary bg-primary/5' : ''}`}>
                   <div className="flex items-center space-x-2">
                      <RadioGroupItem value="wearable" id="priority-wearable" />
                      <span>Wearable Data (Optional)</span>
                   </div>
                   <span className="text-sm text-muted-foreground">Prioritize data from connected wearables. Activation may require setup/delivery process.</span>
                 </Label>
               </RadioGroup>
             </div>

             {/* Expert Mode Setting */}
             <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                <div className="space-y-1">
                   <Label htmlFor="expert-mode" className="text-base font-medium">Expert Mode</Label>
                    <div className="flex items-center space-x-1">
                      <p className="text-sm text-muted-foreground">Enable detailed views and advanced controls.</p>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                                  <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>Shows more technical data and simulation parameters.</p>
                            </TooltipContent>
                        </Tooltip>
                     </div>
                </div>
               <Switch
                 id="expert-mode"
                 checked={expertMode}
                 onCheckedChange={setExpertMode}
                 disabled={isLoading}
               />
             </div>

             {/* Facial Recognition Management */}
             <div className="space-y-4 border p-4 rounded-md">
                 <Label className="text-base font-medium">Facial Recognition</Label>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <p className="text-sm text-muted-foreground flex-1">
                         Manage the facial biometric data used for secure login.
                     </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handleManageFacialRecognition} disabled={isLoading}>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          {mockSettings.facialRecognitionEnabled ? 'Update Scan' : 'Set Up'}
                        </Button>
                         {mockSettings.facialRecognitionEnabled && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" disabled={isLoading}>
                                     Remove Scan
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Facial Recognition?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action will permanently delete your stored facial biometric data. You will need to use your password to log in. Are you sure you want to continue?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRemoveFacialRecognition} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                       {isLoading ? 'Removing...' : 'Yes, Remove'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                     </div>
                 </div>
             </div>
           </TooltipProvider>

        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading || !hasChanges} className="w-full md:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
