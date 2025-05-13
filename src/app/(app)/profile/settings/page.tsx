
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Fingerprint, Save, Info, Moon, Sun, Smartphone, Watch, Languages, Coins, BarChart3 } from 'lucide-react'; // Added Coins, BarChart3
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { translations } from '@/lib/translations';
import { mockPolicies } from '@/data/policies'; // Import to calculate initial credits

// Mock settings - fetch these from user preferences API
const mockSettings = {
  wearableDataEnabled: false,
  expertMode: false,
  facialRecognitionEnabled: true,
  darkMode: undefined,
  language: 'en',
};


export default function SettingsPage() {
  const [wearableDataEnabled, setWearableDataEnabled] = useState<boolean>(mockSettings.wearableDataEnabled);
  const [expertMode, setExpertMode] = useState<boolean>(mockSettings.expertMode);
  const [language, setLanguage] = useState<string>(mockSettings.language);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
      if (typeof window !== 'undefined') {
          const storedTheme = localStorage.getItem('theme');
          if (storedTheme === 'dark') return true;
          if (storedTheme === 'light') return false;
          // Only use window.matchMedia if localStorage theme is not set
          // This prevents hydration mismatch if server defaults to light but browser prefers dark
          if (typeof window.matchMedia === 'function') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
          }
      }
      return false; // Default to false if no preference or window is undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isWearableConfirmOpen, setIsWearableConfirmOpen] = useState(false);
  const [usedCredits, setUsedCredits] = useState(0); // State for used credits

  const { toast } = useToast();
  const router = useRouter();

  // Calculate initial used credits from active mock policies
  useEffect(() => {
    const initialCredits = mockPolicies
      .filter(policy => policy.status === 'active')
      .reduce((sum, policy) => sum + policy.creditCost, 0);
    setUsedCredits(initialCredits);
  }, []);

  const t = translations[language as keyof typeof translations] || translations.en;


   useEffect(() => {
       if (typeof window !== 'undefined') {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
      }
   }, [isDarkMode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLang = localStorage.getItem('language');
      if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
        setLanguage(storedLang);
      } else {
        // Set initial language from mockSettings and store it if not already set
        setLanguage(mockSettings.language);
        localStorage.setItem('language', mockSettings.language);
      }
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount


  const handleSaveChanges = async () => {
    setIsLoading(true);
    const newSettings = { wearableDataEnabled, expertMode, darkMode: isDarkMode, language };
    console.log('Saving settings:', newSettings);

    localStorage.setItem('language', language);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    toast({
      title: t.settingsSavedTitle,
      description: t.settingsSavedDesc,
    });
    // Update mock settings to reflect changes
    Object.assign(mockSettings, newSettings);
  };

   const handleManageFacialRecognition = () => {
       router.push('/facial-recognition');
   };

   const handleRemoveFacialRecognition = async () => {
       setIsLoading(true);
       console.log('Removing facial recognition...');
       await new Promise((resolve) => setTimeout(resolve, 1000));
       setIsLoading(false);
       mockSettings.facialRecognitionEnabled = false; // Update mock state
       toast({
           title: t.facialRemovedTitle,
           description: t.facialRemovedDesc,
       });
   };

   const handleWearableSwitchChange = (checked: boolean) => {
       if (checked) {
           // If user is enabling wearable data, show confirmation dialog
           setIsWearableConfirmOpen(true);
       } else {
           // If user is disabling, directly update state
           setWearableDataEnabled(false);
       }
   };

   const acceptWearableTerms = () => {
       setWearableDataEnabled(true);
       setIsWearableConfirmOpen(false);
       toast({
           title: t.wearableEnabledTitle,
           description: t.wearableEnabledDesc,
       });
   };

   const cancelWearableTerms = () => {
       // User cancelled, so wearable data should remain disabled (or revert to its previous state)
       setWearableDataEnabled(false); // Ensure it's off if they were trying to enable it
       setIsWearableConfirmOpen(false);
   };

   const hasChanges = wearableDataEnabled !== mockSettings.wearableDataEnabled ||
                     expertMode !== mockSettings.expertMode ||
                     language !== mockSettings.language ||
                     isDarkMode !== (mockSettings.darkMode === undefined ? (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) : mockSettings.darkMode);


  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t.settingsTitle}</CardTitle>
          <CardDescription>{t.settingsDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
           <TooltipProvider>
             <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                    {isDarkMode ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
                   <Label htmlFor="dark-mode" className="text-base font-medium">{t.darkModeLabel}</Label>
                </div>
                <Switch
                   id="dark-mode"
                   checked={isDarkMode}
                   onCheckedChange={setIsDarkMode}
                   disabled={isLoading}
                 />
             </div>

             <div className="space-y-4 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                   <Languages className="h-5 w-5 text-muted-foreground" />
                   <Label htmlFor="language-select" className="text-base font-medium">{t.languageLabel}</Label>
                </div>
                <p className="text-sm text-muted-foreground">{t.languageDesc}</p>
                 <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                   <SelectTrigger id="language-select" className="w-full sm:w-[180px]">
                     <SelectValue placeholder="Select language" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="es">{t.spanish}</SelectItem>
                     <SelectItem value="en">{t.english}</SelectItem>
                   </SelectContent>
                 </Select>
             </div>

            {/* Used Credits Section */}
            <div className="space-y-4 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <Label htmlFor="used-credits" className="text-base font-medium">{t.usedCreditsTitle || 'Used Credits'}</Label>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{t.usedCreditsDesc || 'Total credits used across all your active policies.'}</p>
                    <span className="text-lg font-semibold text-amber-600">{usedCredits}</span>
                </div>
                {/* Optional: Placeholder for a small graph or badges */}
                {/* <div className="mt-2">
                    <BarChart3 className="h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">Graph coming soon</p>
                </div> */}
            </div>


             <div className="space-y-4 border p-4 rounded-md">
               <div className="flex items-center justify-between">
                 <Label className="text-base font-medium">{t.dataSourcesTitle}</Label>
                   <Tooltip delayDuration={100}>
                       <TooltipTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                             <Info className="h-4 w-4" />
                         </Button>
                       </TooltipTrigger>
                       <TooltipContent side="left" className="max-w-xs">
                         <p>{t.dataSourcesTooltip}</p>
                       </TooltipContent>
                   </Tooltip>
               </div>

               <div className="flex items-center justify-between space-x-4"> {/* Mobile + Context is always active */}
                   <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="mobile-context-info" className="flex-1">
                         {t.mobileContextLabel}
                         <p className="text-xs text-muted-foreground">{t.mobileContextDesc}</p>
                      </Label>
                   </div>
                    <Switch id="mobile-context-info" checked={true} disabled={true} aria-readonly={true} /> {/* Always checked and disabled */}
               </div>

                <div className="flex items-center justify-between space-x-4">
                     <div className="flex items-center space-x-3">
                         <Watch className="h-5 w-5 text-muted-foreground" />
                        <Label htmlFor="wearable-data-switch" className="flex-1">
                           {t.wearableDataLabel}
                           <p className="text-xs text-muted-foreground">{t.wearableDataDesc}</p>
                        </Label>
                     </div>
                     <Switch
                       id="wearable-data-switch"
                       checked={wearableDataEnabled}
                       onCheckedChange={handleWearableSwitchChange} // Use new handler
                       disabled={isLoading}
                     />
                </div>
             </div>


             <div className="flex items-center justify-between space-x-4 border p-4 rounded-md">
                <div className="space-y-1">
                   <Label htmlFor="expert-mode" className="text-base font-medium">{t.expertModeLabel}</Label>
                    <div className="flex items-center space-x-1">
                      <p className="text-sm text-muted-foreground">{t.expertModeDesc}</p>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                                  <Info className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{t.expertModeTooltip}</p>
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

             <div className="space-y-4 border p-4 rounded-md">
                 <Label className="text-base font-medium">{t.facialRecognitionLabel}</Label>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                     <p className="text-sm text-muted-foreground flex-1">
                         {t.facialRecognitionDesc}
                     </p>
                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" onClick={handleManageFacialRecognition} disabled={isLoading}>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          {mockSettings.facialRecognitionEnabled ? t.updateScanButton : t.setUpButton}
                        </Button>
                         {mockSettings.facialRecognitionEnabled && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" disabled={isLoading}>
                                     {t.removeScanButton}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t.removeScanConfirmTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t.removeScanConfirmDesc}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading}>{t.cancelButton}</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRemoveFacialRecognition} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                       {isLoading ? t.removingButton : t.removeConfirmButton}
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
            {isLoading ? t.savingButton : t.saveButton}
          </Button>
        </CardFooter>
      </Card>

        <AlertDialog open={isWearableConfirmOpen} onOpenChange={setIsWearableConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>{t.wearableConfirmTitle}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                   <ScrollArea className="max-h-[40vh] pr-6">
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>{t.wearableConfirmDescP1}</p>
                      <p>{t.wearableConfirmDescP2}</p>
                      <ul className="list-disc list-inside pl-4">
                          <li>{t.wearableConfirmDescLi1}</li>
                          <li>{t.wearableConfirmDescLi2}</li>
                          <li>{t.wearableConfirmDescLi3}</li>
                      </ul>
                      <p><strong>{t.wearableConfirmDescP3}</strong></p>
                      <p>{t.wearableConfirmDescP4}</p>
                      <ul className="list-disc list-inside pl-4">
                          <li>{t.wearableConfirmDescLi4}</li>
                          <li>{t.wearableConfirmDescLi5}</li>
                      </ul>
                      <p>{t.wearableConfirmDescP5}</p>
                      <p><strong>{t.wearableConfirmDescP6}</strong></p>
                    </div>
                    </ScrollArea>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelWearableTerms} disabled={isLoading}>{t.cancelButton}</AlertDialogCancel>
                <AlertDialogAction onClick={acceptWearableTerms} disabled={isLoading}>{t.agreeEnableButton}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialog>
    </div>
  );
}

