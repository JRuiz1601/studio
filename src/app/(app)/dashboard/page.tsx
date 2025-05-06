
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link'; // Import Link for navigation
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay" // Import Autoplay plugin
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter, // Import CardFooter
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
   Cloud, MapPin, HeartPulse, Zap, BatteryCharging, WifiOff, CreditCard, FileWarning, ShieldCheck,
   TrendingUp, AlertTriangle, Lightbulb, GraduationCap, Users, PhoneCall,
   Sparkles, CheckCircle, Check, Brain, Activity, Settings
} from 'lucide-react';
import type { Location } from '@/services/gps';
import type { Weather } from '@/services/weather';
import type { WearableBattery, WearableConnectionStatus, WearableData } from '@/services/wearable';
import { getCurrentLocation } from '@/services/gps';
import { getWeather } from '@/services/weather';
import { getWearableBatteryStatus, getWearableConnectionStatus, getWearableData } from '@/services/wearable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Import Button
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; // Import Alert components
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"; // Import chart components
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'; // Import Recharts components
import { cn } from '@/lib/utils'; // Import cn for conditional classes
import { Progress } from '@/components/ui/progress'; // Import Progress
import { translations } from '@/lib/translations'; // Import shared translations
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel" // Import Carousel components
import { Label } from '@/components/ui/label'; // Import Label

type RiskStatus = 'low' | 'medium' | 'high' | 'unknown';

// Updated recommendation structure with better XAI focus
interface Recommendation {
  id: string;
  title: string; // More actionable title
  reason: string; // The "Why now?" part of XAI
  benefit: string; // The clear benefit to the user
  ctaLabel: string; // Specific Call to Action text
  icon: React.ComponentType<{ className?: string }>;
  priority?: 'high' | 'medium' | 'low'; // Optional priority for styling/sorting
}

// Carousel slide data
interface CarouselSlide {
    id: string;
    imageUrl: string;
    imageHint: string; // For AI image generation hint
    message: string; // Now uses translations
    ctaLabel: string; // Now uses translations
    ctaHref: string;
}

// Updated function to get carousel slides with translations focusing on specific insurances
const getCarouselSlides = (t: any): CarouselSlide[] => [
    {
        id: 'slide-health',
        imageUrl: 'https://picsum.photos/800/400?random=1', // Placeholder
        imageHint: 'healthy lifestyle', // Keep hint generic or make it 'health care'
        message: t.carouselHealthMessage || 'Protect your well-being. Full coverage for health contingencies.',
        ctaLabel: t.carouselHealthCta || 'View Health Insurance',
        ctaHref: '/insurances#health', // Link to health insurance section/details
    },
    {
        id: 'slide-accident',
        imageUrl: 'https://picsum.photos/800/400?random=4', // Placeholder
        imageHint: 'active person', // Hint related to accidents or activity
        message: t.carouselAccidentMessage || 'Accidents happen. Be prepared with personal accident coverage.',
        ctaLabel: t.carouselAccidentCta || 'Explore Accident Insurance',
        ctaHref: '/insurances#accident', // Link to accident insurance
    },
    {
        id: 'slide-pension',
        imageUrl: 'https://picsum.photos/800/400?random=3', // Placeholder
        imageHint: 'retirement planning', // Hint related to pension/retirement
        message: t.carouselPensionMessage || 'Plan your future with Voluntary Pension savings.',
        ctaLabel: t.carouselPensionCta || 'Learn about Voluntary Pension',
        ctaHref: '/insurances#pension', // Link to pension insurance
    },
    {
        id: 'slide-education',
        imageUrl: 'https://picsum.photos/800/400?random=2', // Placeholder
        imageHint: 'student graduation', // Hint related to education
        message: t.carouselEducationMessage || 'Secure their future. Ensure education continuity with our plan.',
        ctaLabel: t.carouselEducationCta || 'Explore Education Insurance',
        ctaHref: '/insurances#education', // Link to education insurance
    },
];


// Mock data for the financial chart
const chartData = [
  { month: "Jan", inflation: 2.1, market: 100 },
  { month: "Feb", inflation: 2.3, market: 102 },
  { month: "Mar", inflation: 2.5, market: 101 },
  { month: "Apr", inflation: 2.8, market: 105 },
  { month: "May", inflation: 3.1, market: 103 },
  { month: "Jun", inflation: 3.5, market: 108 },
];

// Chart configuration - Adjusted labels based on translations structure
const getChartConfig = (t: any): ChartConfig => ({
  inflation: {
    label: t.inflationLabel || "Inflation (%)", // Added fallback
    color: "hsl(var(--destructive))", // Use destructive color for inflation
  },
  market: {
    label: t.marketLabel || "Market (Index)", // Added fallback
    color: "hsl(var(--primary))", // Use primary color for market trend
  },
});


// Mock function to get contextual risk data (replace with actual logic)
const getContextualRisk = (t: any) => ({
  zoneRisk: t.riskZoneMedium, // 'No risks detected', 'Moderate risk zone', 'High-risk zone'
  recentEvents: t.riskEventsSample, // 'No recent incidents nearby.', '3 thefts reported this week within 500m.',
  externalConditions: t.riskConditionsWeather, // 'Weather conditions normal.', 'Heavy rain forecast, increased accident risk.'
  recommendedCoverage: t.riskCoverageMedium, // 'Low', 'Medium', 'Complete'
  overallStatus: t.riskStatusOverallMonitoring, // 'All under control', 'Environment under monitoring'
});

// Helper component for Progress Bar indicator class - needed because Tailwind cannot dynamically generate classes based on props/state directly
const ProgressIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number | null, status: RiskStatus }
>(({ className, value, status, ...props }, ref) => {
  const getColorClass = (status: RiskStatus): string => {
    switch (status) {
        case 'low': return 'bg-green-500';
        case 'medium': return 'bg-yellow-500';
        case 'high': return 'bg-destructive';
        default: return 'bg-muted'; // Unknown or loading state
    }
  };

  return (
      <div
          ref={ref}
          className={cn(
              "h-full w-full flex-1 transition-all",
              getColorClass(status),
              className
          )}
          style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }} // Use value from props
          {...props}
      />
  );
});
ProgressIndicator.displayName = 'ProgressIndicator';


export default function DashboardPage() {
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [wearableStatus, setWearableStatus] = useState<WearableConnectionStatus | null>(null);
  const [wearableBattery, setWearableBattery] = useState<WearableBattery | null>(null);
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingWearable, setLoadingWearable] = useState(true);
  const [userName, setUserName] = useState('Zyren User'); // Placeholder user name
  const [greeting, setGreeting] = useState<string | null>(null); // State for greeting
  const [adaptivePremiumsActive, setAdaptivePremiumsActive] = useState(true); // Mock state for adaptive premiums feature
  const [language, setLanguage] = useState<string>('en'); // Default to English
  const [coverageLevel, setCoverageLevel] = useState<number>(65); // Mock coverage level (0-100)
  const [contextualRisk, setContextualRisk] = useState<ReturnType<typeof getContextualRisk> | null>(null); // State for contextual risk
  const [riskStatus, setRiskStatus] = useState<RiskStatus>('medium'); // Example state: 'low', 'medium', 'high', 'unknown'


   // Effect to get language from localStorage on mount
   useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
      setLanguage(storedLang);
    } else {
      setLanguage('en'); // Default to English if nothing stored or invalid
    }
  }, []); // Run only once on mount

  // Set greeting based on fetched/default language and avoid hydration issues
  useEffect(() => {
    const hour = new Date().getHours();
    const currentTranslations = translations[language as keyof typeof translations] || translations.en;
    let calculatedGreeting = '';
    if (hour < 12) calculatedGreeting = currentTranslations.greetingMorning;
    else if (hour < 18) calculatedGreeting = currentTranslations.greetingAfternoon;
    else calculatedGreeting = currentTranslations.greetingEvening;
    setGreeting(calculatedGreeting); // Set greeting in effect

    // Set contextual risk based on current translations
    setContextualRisk(getContextualRisk(currentTranslations));
  }, [language]); // Update greeting and risk when language changes


  // Fetch data on component mount
  useEffect(() => {
     async function fetchData() {
        setLoadingLocation(true);
        setLoadingWeather(true);
        setLoadingWearable(true);
        // TODO: Fetch user name from auth context/API
        // setUserName(fetchedUserName);
        // TODO: Fetch actual coverage level from policy analysis
        // setCoverageLevel(calculatedCoverage);
         // TODO: Calculate actual riskStatus based on data
         // setRiskStatus(calculatedRisk);

        try {
            const loc = await getCurrentLocation();
            setLocation(loc);
            setLoadingLocation(false);

            const weatherData = await getWeather({ lat: loc.latitude, lng: loc.longitude });
            setWeather(weatherData);
            setLoadingWeather(false);
        } catch (error) {
            console.error("Error fetching location or weather:", error);
            setLoadingLocation(false);
            setLoadingWeather(false);
        }

        try {
             const status = await getWearableConnectionStatus();
             setWearableStatus(status);
             if (status === 'connected') {
                 const [battery, data] = await Promise.all([
                     getWearableBatteryStatus(),
                     getWearableData()
                 ]);
                 setWearableBattery(battery);
                 setWearableData(data);
             }
        } catch (error) {
             console.error("Error fetching wearable data:", error);
        } finally {
             setLoadingWearable(false);
        }

     }
     fetchData();

  }, []);

  // Get current translations based on language state
  const t = translations[language as keyof typeof translations] || translations.en;
  const chartConfig = getChartConfig(t);
  const carouselSlides = getCarouselSlides(t); // Get slides with current translations

  // Function to get qualitative stress level
  const getStressLevelLabel = (level: number): string => {
      if (level < 30) return t.stressLevelLow || "Low";
      if (level < 60) return t.stressLevelMedium || "Medium";
      return t.stressLevelHigh || "High";
  };

   // Updated recommendations using translations
   const getRecommendations = (t: any): Recommendation[] => [
       {
         id: 'rec_profile_update',
         title: t.recProfileUpdateTitle || "Optimize Your Recommendations!",
         reason: t.recProfileUpdateReason || "A complete profile helps us give you more accurate suggestions.",
         benefit: t.recProfileUpdateBenefit || "Ensure your protection and advice perfectly match you.",
         ctaLabel: t.recProfileUpdateCta || "Review my Profile",
         icon: Users, // Icon related to user profile
         priority: 'medium',
       },
       {
         id: 'rec_education_explore',
         title: t.recEducationExploreTitle || "Secure Your Children's University",
         reason: t.recEducationExploreReason || "We detected that your dependents (simulated) are school-aged.",
         benefit: t.recEducationExploreBenefit || "Guarantee their future studies regardless of unforeseen events and start saving in a planned way.",
         ctaLabel: t.recEducationExploreCta || "Explore Education Insurance",
         icon: GraduationCap, // Specific icon for education
         priority: 'medium',
       },
        // Example of a weather-related recommendation (conditionally added if data supports it)
        ...(weather && weather.temperatureFarenheit > 85 ? [{
            id: 'rec_heat_alert',
            title: t.recHeatAlertTitle || "Protect Yourself from the Heat",
            reason: t.recHeatAlertReason ? t.recHeatAlertReason(weather.temperatureFarenheit) : `Current temperature is ${weather.temperatureFarenheit}°F.`,
            benefit: t.recHeatAlertBenefit || "Remember to stay hydrated and avoid strenuous activities.",
            ctaLabel: t.recHeatAlertCta || "See Health Tips",
            icon: Cloud, // Or a specific Sun icon
            priority: 'low',
        } as Recommendation] : []),
   ].sort((a, b) => { // Simple sort: high > medium > low
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority || 'low'] || 4) - (priorityOrder[b.priority || 'low'] || 4);
   }).slice(0, 3); // Limit to 3 recommendations

   const recommendations = getRecommendations(t);

    // Autoplay plugin ref for the carousel
    const autoplayPlugin = useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true }) // 4 second delay, stops on interaction
    );

     // --- Helper Functions for Protection Status Bar ---
     const getProtectionBarColor = (level: number): string => {
         if (level < 40) return 'bg-destructive'; // Red for low protection
         if (level < 75) return 'bg-yellow-500'; // Yellow for medium
         return 'bg-green-500'; // Green for high
     };
     // --- End Helper Functions ---

     // Get status icon based on riskStatus
     const getStatusIcon = (status: RiskStatus): React.ReactNode => {
         switch (status) {
             case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
             case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
             case 'high': return <AlertTriangle className="h-5 w-5 text-destructive" />;
             default: return <Info className="h-5 w-5 text-muted-foreground" />;
         }
     };


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* 1. Personalized Greeting */}
       <div className="mb-4">
         <h1 className="text-2xl font-semibold">{t.helloUser ? t.helloUser(userName) : `Hello ${userName},`}</h1>
         {/* Display greeting or skeleton, ensure no hydration mismatch */}
         <div className="text-muted-foreground">
             {greeting ? greeting : <Skeleton className="h-5 w-24 inline-block" />}
         </div>
       </div>

       {/* 2. Central Slider Widget: "Inspiring Protection" */}
        <Carousel
            plugins={[autoplayPlugin.current]} // Add autoplay plugin
            className="w-full shadow-lg rounded-lg overflow-hidden border border-border"
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.reset}
        >
            <CarouselContent>
            {carouselSlides.map((slide) => (
                <CarouselItem key={slide.id}>
                <div className="relative aspect-video"> {/* Use aspect ratio for consistent image sizing */}
                    <Image
                    src={slide.imageUrl}
                    alt={slide.message}
                    fill // Use fill instead of layout="fill"
                    style={{objectFit:"cover"}} // Use style instead of objectFit prop
                    className="brightness-75" // Slightly darken image for text contrast
                    data-ai-hint={slide.imageHint} // AI hint for image selection
                    priority={slide.id === 'slide-health'} // Prioritize loading the first slide image
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-8 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="text-lg md:text-2xl font-semibold text-white mb-4 shadow-text">{slide.message}</p>
                    <Button variant="default" size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                        <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                    </Button>
                    </div>
                </div>
                </CarouselItem>
            ))}
            </CarouselContent>
            {/* Optional: Add Previous/Next buttons for manual control */}
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
      </Carousel>

       {/* 3. Widget Fusionado: My Protection Status */}
        <Card className={cn("border-l-4", riskStatus === 'low' ? 'border-l-green-500' : riskStatus === 'medium' ? 'border-l-yellow-500' : riskStatus === 'high' ? 'border-l-destructive' : 'border-l-border')} data-testid="protection-status-widget">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Status Icon based on riskStatus */}
                        {getStatusIcon(riskStatus)}
                        <span>{t.protectionStatusTitle || "My Protection Status"}</span>
                    </div>
                    {/* Optional: Overall status badge */}
                    {contextualRisk && (
                        <Badge variant={contextualRisk.overallStatus === t.riskStatusOverallMonitoring ? "destructive" : "secondary"}>
                            {contextualRisk.overallStatus}
                        </Badge>
                    )}
                </CardTitle>
                {/* Short message based on status */}
                <CardDescription className={cn(riskStatus === 'low' ? 'text-green-600' : riskStatus === 'medium' ? 'text-yellow-600' : riskStatus === 'high' ? 'text-destructive' : 'text-muted-foreground')}>
                    {riskStatus === 'low' ? 'Your protection seems well-aligned.' :
                     riskStatus === 'medium' ? t.riskStatusOverallMonitoring || 'Environment under monitoring. Review suggestions.' :
                     riskStatus === 'high' ? 'Action recommended to improve protection.' :
                     'Loading protection status...'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0"> {/* Removed padding-top */}
                {/* Contextual Risk Info */}
                {contextualRisk ? (
                    <div className="space-y-2 text-sm text-muted-foreground border-b pb-3 mb-3">
                        <div className="flex justify-between"><span className="font-medium">{t.riskZoneLabel || "Current Zone:"}</span> <span>{contextualRisk.zoneRisk}</span></div>
                        <div className="flex justify-between"><span className="font-medium">{t.riskEventsLabel || "Recent Events:"}</span> <span>{contextualRisk.recentEvents}</span></div>
                        <div className="flex justify-between"><span className="font-medium">{t.riskConditionsLabel || "External Factors:"}</span> <span>{contextualRisk.externalConditions}</span></div>
                        <div className="flex justify-between"><span className="font-medium">{t.riskCoverageLabel || "Recommended Coverage:"}</span> <span>{contextualRisk.recommendedCoverage}</span></div>
                    </div>
                ) : (
                    <Skeleton className="h-16 w-full mb-3" /> // Placeholder if risk data is loading
                )}

                {/* Protection Level Bar */}
                 <div className="space-y-1">
                    <Label htmlFor="protection-level-bar" className="text-xs text-muted-foreground">{t.protectionLevelLabel || "Estimated Protection Level"}</Label>
                    <Progress
                        id="protection-level-bar"
                        value={coverageLevel}
                        className="h-2"
                        // Use custom indicator component
                        indicator={<ProgressIndicator value={coverageLevel} status={riskStatus} />}
                    />
                     <p className="text-right text-sm font-medium mt-1">{coverageLevel}%</p> {/* Optional percentage display */}
                 </div>

            </CardContent>
             {/* Action Buttons */}
             <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end border-t pt-4">
                 {/* Conditional CTAs based on risk status */}
                 {(riskStatus === 'medium' || riskStatus === 'high') && (
                     <Button variant="default" size="sm" asChild>
                         <Link href="/recommendations">
                             <Settings className="mr-2 h-4 w-4" /> {/* Changed icon */}
                             {t.improveProtectionButton || "Improve My Protection"}
                         </Link>
                     </Button>
                 )}
                 <Button variant="outline" size="sm" asChild>
                     <Link href="/recommendations">
                        <Brain className="mr-2 h-4 w-4" /> {/* Changed icon */}
                         {t.viewRecommendationsButton || "View Recommendations"}
                     </Link>
                 </Button>
                 {/* Optional: Simulate Profile Button */}
                 {/* <Button variant="ghost" size="sm" onClick={() => alert('Simulate profile feature clicked')}>
                    <Users className="mr-2 h-4 w-4" />
                    Simulate Other Profile
                 </Button> */}
             </CardFooter>
        </Card>


       {/* 4. Widget: Financial Market */}
        <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-muted-foreground" /> {t.financialMarketTitle || "Financial Market"}
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                  {/* Interactive Chart */}
                   <ChartContainer config={chartConfig} className="h-[100px] w-full">
                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                           left: -20, // Adjust left margin to fit labels
                           right: 10,
                           top: 5,
                           bottom: 0,
                        }}
                      >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/30"/>
                        <XAxis
                           dataKey="month"
                           tickLine={false}
                           axisLine={false}
                           tickMargin={8}
                           tickFormatter={(value) => value.slice(0, 3)} // Shorten month names
                            style={{ fontSize: '0.7rem', fill: 'hsl(var(--muted-foreground))' }} // Style XAxis ticks
                        />
                         <YAxis
                           tickLine={false}
                           axisLine={false}
                           tickMargin={8}
                           domain={['dataMin - 1', 'dataMax + 1']} // Adjust domain slightly
                           style={{ fontSize: '0.7rem', fill: 'hsl(var(--muted-foreground))' }} // Style YAxis ticks
                           />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                          dataKey="inflation"
                          type="monotone"
                          stroke="var(--color-inflation)"
                          strokeWidth={2}
                          dot={false}
                        />
                         <Line // Added market line for context
                            dataKey="market"
                            type="monotone"
                            stroke="var(--color-market)"
                            strokeWidth={2}
                            dot={false}
                         />
                      </LineChart>
                   </ChartContainer>

                 <Alert variant="destructive" className="p-3">
                   <AlertTriangle className="h-4 w-4" />
                   <AlertTitle className="text-sm font-semibold">{t.inflationAlertTitle || "Inflation Alert"}</AlertTitle>
                   <AlertDescription className="text-xs">
                      {t.inflationAlertDesc || "Inflation continues to rise. Protect your savings."}
                   </AlertDescription>
                 </Alert>
                 <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{t.keyTipLabel || "Key Tip:"}</span> {t.keyTipContent || "Consider diversifying your investments and review savings options with inflation protection."}
                    </p>
                 </div>
             </CardContent>
           </Card>

       {/* 5. Section: Smart Ideas - REDESIGNED */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold flex items-center gap-2">
             <Brain className="h-6 w-6 text-primary" /> {/* New Title Icon */}
             {t.smartIdeasTitle || "Smart Ideas for Your Protection"}
         </h2>
         {recommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {recommendations.map((rec) => (
                   // Using Option A (Enriched Card) structure
                  <Card key={rec.id} className={`flex flex-col border-l-4 ${
                      rec.priority === 'high' ? 'border-destructive' :
                      rec.priority === 'medium' ? 'border-yellow-500' :
                      'border-primary/30' // Low or undefined priority
                  }`}>
                    {/* Visual Element Area - Placeholder for illustration/larger icon */}
                    <div className="p-4 flex justify-center items-center bg-muted/30 h-24 rounded-t-lg">
                        <rec.icon className="h-12 w-12 text-primary opacity-80" />
                        {/* Replace with <Image /> if using illustrations */}
                    </div>
                    <CardHeader className="pt-3 pb-1">
                       <CardTitle className="text-base font-medium">{rec.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pt-1 pb-3 space-y-2">
                        {/* XAI Explanation */}
                        <div className="text-xs text-muted-foreground">
                            <p><span className="font-semibold text-foreground">{t.whyNowLabel || "Why now?"}:</span> {rec.reason}</p>
                            <p><span className="font-semibold text-green-600">{t.benefitLabel || "Benefit:"}:</span> {rec.benefit}</p>
                        </div>
                    </CardContent>
                     <CardFooter className="pt-2 pb-4 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
                         {/* Main CTA */}
                        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
                           <Link href={`/recommendations#${rec.id}`}>{rec.ctaLabel}</Link>
                        </Button>
                         {/* Optional Secondary Action */}
                         <Button variant="ghost" size="sm" className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground w-full sm:w-auto justify-center sm:justify-end">
                             {t.maybeLaterButton || "Maybe later"}
                         </Button>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center border-dashed">
                 <CardDescription>{t.noRecommendationsText || "No smart ideas for you right now."}</CardDescription>
              </Card>
            )}
       </div>

      {/* 6. Section: Your Well-being & Insurance - REDESIGNED */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <Card>
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> {t.wellbeingTitle || "Your Well-being Rewards You!"}
                </CardTitle>
             </AccordionTrigger>
             <AccordionContent className="px-6 pb-4">
                 {loadingWearable ? (
                     <div className="flex items-center justify-center text-muted-foreground py-4">
                         <Skeleton className="h-5 w-5 mr-2 rounded-full" /> {t.loadingWellbeingData || "Loading well-being data..."}
                     </div>
                 ) : wearableStatus === 'connected' && wearableBattery && wearableData ? (
                    <div className="space-y-4">
                        {/* Wearable Status & Battery */}
                        <div className="flex items-center justify-between text-sm border p-3 rounded-md">
                          <div className="flex items-center gap-2">
                             {/* Placeholder Smartwatch Icon */}
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             <span className="font-medium">{t.smartwatchLabel || "Smartwatch:"}</span>
                             <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t.connectedStatus || "Connected"}</Badge>
                          </div>
                           <div className="flex items-center gap-1">
                             {wearableBattery.isCharging && <BatteryCharging className="h-4 w-4 text-yellow-500" />}
                            <span className="text-xs font-medium">{wearableBattery.percentage}%</span>
                            {/* Simple Battery Bar */}
                             <div className="w-8 h-2 bg-muted rounded-full overflow-hidden">
                                <div className={cn("h-full", wearableBattery.percentage < 20 ? "bg-destructive" : "bg-primary")} style={{ width: `${wearableBattery.percentage}%` }}></div>
                             </div>
                           </div>
                        </div>

                        {/* Key Insights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {/* Heart Rate */}
                             <Card className="p-3">
                                <CardContent className="p-0 flex items-center gap-3">
                                  <HeartPulse className="h-6 w-6 text-red-500" />
                                  <div>
                                     <p className="text-sm text-muted-foreground">{t.heartRateLabel || "Heart Rate"}</p>
                                     <p className="text-lg font-bold">{wearableData.heartRate} <span className="text-xs font-normal">{t.heartRateUnit || "bpm"}</span></p>
                                     <p className="text-xs text-muted-foreground">{t.averageTodayLabel || "(Average today)"}</p>
                                  </div>
                                </CardContent>
                             </Card>
                              {/* Stress Level */}
                             <Card className="p-3">
                                <CardContent className="p-0 flex items-center gap-3">
                                   <Zap className={cn("h-6 w-6",
                                       wearableData.stressLevel < 30 ? "text-green-500" :
                                       wearableData.stressLevel < 60 ? "text-yellow-500" :
                                       "text-orange-500" // Changed to orange for high stress
                                    )} />
                                  <div>
                                     <p className="text-sm text-muted-foreground">{t.stressLevelLabel || "Stress Level"}</p>
                                      <p className="text-lg font-bold">{getStressLevelLabel(wearableData.stressLevel)} <span className="text-xs font-normal">({wearableData.stressLevel}%)</span></p>
                                      {/* Updated Alert for high stress */}
                                     {wearableData.stressLevel > 60 && (
                                       <Alert variant="destructive" className="p-1 px-2 mt-1 text-xs flex items-center gap-1 border-orange-500 text-orange-700 dark:text-orange-400">
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>{t.stressIncreasedAlert || "Stress Increased"} ({wearableData.stressLevel}%)</span> {/* Show percentage */}
                                       </Alert>
                                      )}
                                  </div>
                                </CardContent>
                             </Card>
                        </div>

                        {/* XAI Connection */}
                        <div className="border p-3 rounded-md bg-accent/30">
                            {adaptivePremiumsActive ? (
                                <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                    <p className="text-accent-foreground">
                                        <span className="font-semibold">{t.adaptivePremiumActiveTitle || "Excellent!"}</span> {t.adaptivePremiumActiveDesc ? t.adaptivePremiumActiveDesc('Life') : `Your consistent activity levels are helping optimize the premium for your Life Insurance. Keep it up! 💪`} {/* Replace 'Life' with dynamic policy name */}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <p className="text-muted-foreground">
                                        {t.adaptivePremiumInactiveDesc ? t.adaptivePremiumInactiveDesc('Life') : `Did you know your well-being data could help you pay less for your Life insurance?`} {/* Replace 'Life' */}
                                        <Button variant="link" size="sm" className="p-0 h-auto ml-1" asChild>
                                            <Link href="/profile/settings">{t.activateAdaptivePremiumsButton || "Activate Adaptive Premiums"}</Link>
                                        </Button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                        <WifiOff className="h-10 w-10 mb-2" />
                        <p className="text-sm mb-2">{t.wearableDisconnectedText || "Wearable disconnected or not set up."}</p>
                        <Button variant="outline" size="sm">{t.connectNowButton || "Connect now"}</Button> {/* Changed label */}
                    </div>
                 )}
             </AccordionContent>
           </Card>
        </AccordionItem>
      </Accordion>

       {/* Add shadow style for text over image */}
       <style jsx>{`
           .shadow-text {
             text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
           }
       `}</style>
    </div>
  );
}


