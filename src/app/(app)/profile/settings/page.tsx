
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// Removed RadioGroup imports as they are no longer needed for Data Priority
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Save, Info, Moon, Sun, Smartphone, Watch } from 'lucide-react'; // Added Smartphone, Watch
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
  AlertDialogTrigger, // Keep if triggering directly from Switch is needed, but we'll manage state manually
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea

// Mock settings - fetch these from user preferences API
// Removed dataPriority as it's handled differently now
const mockSettings = {
  wearableDataEnabled: false, // Default wearable to false
  expertMode: false,
  facialRecognitionEnabled: true, // Assume it's enabled after setup
  darkMode: undefined, // Initialize based on system/local storage
};


export default function SettingsPage() {
  // State for individual settings
  const [wearableDataEnabled, setWearableDataEnabled] = useState<boolean>(mockSettings.wearableDataEnabled);
  const [expertMode, setExpertMode] = useState<boolean>(mockSettings.expertMode);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
      if (typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme === 'dark') return true;
          if (storedTheme === 'light') return false;
          return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isWearableConfirmOpen, setIsWearableConfirmOpen] = useState(false); // State for AlertDialog visibility
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

  // Fetch initial settings (if needed, replace mockSettings)
  // useEffect(() => {
  //   // Fetch settings logic here
  //   // setWearableDataEnabled(fetchedSettings.wearableEnabled);
  //   // setExpertMode(fetchedSettings.expertMode);
  // }, []);


  const handleSaveChanges = async () => {
    setIsLoading(true);
    // Include wearableDataEnabled in saved settings
    const newSettings = { wearableDataEnabled, expertMode, darkMode: isDarkMode };
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
  };

   const handleManageFacialRecognition = () => {
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
       // Force re-render or state update if needed
   };

   // --- Wearable Data Toggle Logic ---
   const handleWearableSwitchChange = (checked: boolean) => {
       if (checked) {
           // If turning ON, show the confirmation dialog
           setIsWearableConfirmOpen(true);
       } else {
           // If turning OFF, update state directly
           setWearableDataEnabled(false);
       }
   };

   const acceptWearableTerms = () => {
       setWearableDataEnabled(true); // Enable the feature
       setIsWearableConfirmOpen(false); // Close the dialog
       toast({
           title: 'Wearable Data Enabled',
           description: 'Processing request. Details about device delivery/setup will follow if applicable.',
       });
       // TODO: Potentially trigger backend logic for wearable provisioning/ordering
   };

   const cancelWearableTerms = () => {
       // User cancelled, ensure switch remains off
       setWearableDataEnabled(false); // Explicitly set to false just in case
       setIsWearableConfirmOpen(false);
   };


   // Check if settings have changed
   const hasChanges = wearableDataEnabled !== mockSettings.wearableDataEnabled || expertMode !== mockSettings.expertMode;


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

             {/* Data Sources Section */}
             <div className="space-y-4 border p-4 rounded-md">
               <div className="flex items-center justify-between">
                 <Label className="text-base font-medium">Data Sources for Analysis</Label>
                   <Tooltip delayDuration={100}>
                       <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                             <Info className="h-4 w-4" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent side="left" className="max-w-xs">
                         <p>Select the data sources Zyren uses for risk assessment and personalized features.</p>
                         <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                            <li><strong>Mobile + Context:</strong> Always active. Uses phone sensors (activity, location) and contextual data (weather, traffic).</li>
                            <li><strong>Wearable Data (Optional):</strong> Adds real-time heart rate, stress levels, etc., for enhanced accuracy. May involve additional costs and device setup/delivery.</li>
                         </ul>
                       </TooltipContent>
                   </Tooltip>
               </div>

               {/* Mobile + Context (Always On) */}
               <div className="flex items-center justify-between space-x-4 opacity-70 cursor-not-allowed"> {/* Indicate it's always on */}
                   <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="mobile-context-info" className="flex-1">
                         Mobile + Context
                         <p className="text-xs text-muted-foreground">Basic analysis using phone sensors & context. Always active.</p>
                      </Label>
                   </div>
                   {/* Visual indicator like a checkmark or disabled switch */}
                    <Switch id="mobile-context-info" checked={true} disabled={true} aria-readonly={true} />
               </div>

                {/* Wearable Data (Toggle with Confirmation) */}
                <div className="flex items-center justify-between space-x-4">
                     <div className="flex items-center space-x-3">
                         <Watch className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="wearable-data-switch" className="flex-1">
                           Wearable Data (Optional Upgrade)
                           <p className="text-xs text-muted-foreground">Enable enhanced analysis using wearable device data.</p>
                        </Label>
                     </div>
                     <Switch
                       id="wearable-data-switch"
                       checked={wearableDataEnabled}
                       onCheckedChange={handleWearableSwitchChange}
                       disabled={isLoading}
                     />
                </div>
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

        {/* Wearable Data Confirmation Dialog */}
        <AlertDialog open={isWearableConfirmOpen} onOpenChange={setIsWearableConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Enable Wearable Data Analysis?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                   {/* Use ScrollArea for potentially long terms */}
                   <ScrollArea className="max-h-[40vh] pr-6">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>By enabling this feature, you agree to allow Zyren to access and analyze data from your connected wearable device (e.g., heart rate, activity levels, stress indicators).</p>
                      <p>This data will be used solely for:</p>
                      <ul className="list-disc list-inside pl-4">
                          <li>Providing more accurate and personalized risk assessments.</li>
                          <li>Enabling features like Adaptive Premiums (if applicable to your policies).</li>
                          <li>Offering relevant well-being insights within the app.</li>
                      </ul>
                      <p><strong>Potential Additional Costs:</strong></p>
                      <p>Please be aware that activating Wearable Data analysis may involve:</p>
                      <ul className="list-disc list-inside pl-4">
                          <li>A separate charge for the wearable device itself, if provided by Global Seguros or a partner.</li>
                          <li>Potential costs associated with device setup, delivery, or subscription fees, as outlined during the device acquisition process.</li>
                      </ul>
                      <p>All data is handled securely according to our Privacy Policy. You can disable this feature at any time in the settings.</p>
                      <p><strong>Do you agree to these terms and potential associated costs to enable Wearable Data analysis?</strong></p>
                    </div>
                    </ScrollArea>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelWearableTerms} disabled={isLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={acceptWearableTerms} disabled={isLoading}>Agree & Enable</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
    </div>
  );
}
