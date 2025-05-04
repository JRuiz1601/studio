'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'; // Added CardFooter here
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Save, Info } from 'lucide-react';
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
import { useRouter } from 'next/navigation'; // Used for navigation after actions

// Mock settings - fetch these from user preferences API
type DataPriority = 'wearable' | 'mobile_context';

const mockSettings = {
  dataPriority: 'wearable' as DataPriority,
  expertMode: false,
  facialRecognitionEnabled: true, // Assume it's enabled after setup
};


export default function SettingsPage() {
  const [dataPriority, setDataPriority] = useState<DataPriority>(mockSettings.dataPriority);
  const [expertMode, setExpertMode] = useState<boolean>(mockSettings.expertMode);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();


  const handleSaveChanges = async () => {
    setIsLoading(true);
    const newSettings = { dataPriority, expertMode };
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
       // Navigate to the facial recognition management/setup page
       router.push('/auth/facial-recognition'); // Re-use setup page or create a dedicated management one
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
   const hasChanges = dataPriority !== mockSettings.dataPriority || expertMode !== mockSettings.expertMode;


  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your application preferences and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Data Priority Setting */}
           <TooltipProvider>
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
                         <li><strong>Wearable:</strong> Prioritizes real-time heart rate, stress levels, etc. Provides the most accurate, personalized insights.</li>
                         <li><strong>Mobile + Context:</strong> Relies on phone sensors (activity, location) and contextual data (weather, traffic). Less granular but still effective.</li>
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
              <Label htmlFor="priority-wearable" className={`flex flex-col items-start space-y-2 rounded-md border p-4 cursor-pointer hover:border-primary ${dataPriority === 'wearable' ? 'border-primary bg-primary/5' : ''}`}>
                <div className="flex items-center space-x-2">
                   <RadioGroupItem value="wearable" id="priority-wearable" />
                   <span>Wearable Data</span>
                </div>
                <span className="text-sm text-muted-foreground">Prioritize data from connected wearables (heart rate, stress).</span>
              </Label>
              <Label htmlFor="priority-mobile" className={`flex flex-col items-start space-y-2 rounded-md border p-4 cursor-pointer hover:border-primary ${dataPriority === 'mobile_context' ? 'border-primary bg-primary/5' : ''}`}>
                 <div className="flex items-center space-x-2">
                   <RadioGroupItem value="mobile_context" id="priority-mobile" />
                   <span>Mobile + Context</span>
                 </div>
                <span className="text-sm text-muted-foreground">Use phone sensors and contextual information.</span>
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
