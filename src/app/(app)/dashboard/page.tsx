
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
  CardFooter,
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
   Sparkles, CheckCircle, Check, Brain // Added Brain for AI/Intelligent ideas
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

type RiskStatus = 'low' | 'medium' | 'high';

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
    message: string;
    ctaLabel: string;
    ctaHref: string;
}

const carouselSlides: CarouselSlide[] = [
    {
        id: 'slide-health',
        imageUrl: 'https://picsum.photos/800/400',
        imageHint: 'healthy lifestyle', // Added hint
        message: 'Protege tu bienestar. Cobertura completa para imprevistos de salud.',
        ctaLabel: 'Ver Seguros de Salud',
        ctaHref: '/insurances#health',
    },
    {
        id: 'slide-home',
        imageUrl: 'https://picsum.photos/800/400',
        imageHint: 'cozy home', // Added hint
        message: 'Tu hogar, tu refugio. Asegúralo contra todo riesgo.',
        ctaLabel: 'Explorar Seguros de Hogar',
        ctaHref: '/insurances#home', // Adjust href if needed
    },
    {
        id: 'slide-life',
        imageUrl: 'https://picsum.photos/800/400',
        imageHint: 'happy family', // Added hint
        message: 'El futuro de tu familia asegurado. Tranquilidad para los que más quieres.',
        ctaLabel: 'Conocer Seguro de Vida',
        ctaHref: '/insurances#life', // Adjust href if needed
    },
    {
        id: 'slide-travel',
        imageUrl: 'https://picsum.photos/800/400',
        imageHint: 'travel adventure', // Added hint
        message: 'Viaja sin preocupaciones. Asistencia completa donde quiera que vayas.',
        ctaLabel: 'Ver Seguros de Viaje',
        ctaHref: '/insurances#travel', // Adjust href if needed
    }
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
    label: t.inflationLabel,
    color: "hsl(var(--destructive))", // Use destructive color for inflation
  },
  market: {
    label: t.marketLabel,
    color: "hsl(var(--primary))", // Use primary color for market trend
  },
});


export default function DashboardPage() {
  // Removed riskStatus and riskProgress states as the widget is replaced
  // const [riskStatus, setRiskStatus] = useState<RiskStatus>('low');
  // const [riskProgress, setRiskProgress] = useState(85); // Example protection progress percentage
  const [location, setLocation] = useState<Location | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [wearableStatus, setWearableStatus] = useState<WearableConnectionStatus | null>(null);
  const [wearableBattery, setWearableBattery] = useState<WearableBattery | null>(null);
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [loadingWearable, setLoadingWearable] = useState(true);
  const [userName, setUserName] = useState('Usuario Zyren'); // Placeholder user name
  const [greeting, setGreeting] = useState<string | null>(null); // State for greeting
  const [adaptivePremiumsActive, setAdaptivePremiumsActive] = useState(true); // Mock state for adaptive premiums feature
  const [language, setLanguage] = useState<string>('es'); // Default to Spanish

   // Effect to get language from localStorage on mount
   useEffect(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang && (storedLang === 'en' || storedLang === 'es')) {
      setLanguage(storedLang);
    }
    // Set greeting based on fetched/default language
    const hour = new Date().getHours();
    const currentTranslations = translations[storedLang as keyof typeof translations || 'es'];
    if (hour < 12) setGreeting(currentTranslations.greetingMorning);
    else if (hour < 18) setGreeting(currentTranslations.greetingAfternoon);
    else setGreeting(currentTranslations.greetingEvening);
  }, []); // Run only once on mount


  // Fetch data on component mount
  useEffect(() => {
     async function fetchData() {
        setLoadingLocation(true);
        setLoadingWeather(true);
        setLoadingWearable(true);
        // TODO: Fetch user name from auth context/API
        // setUserName(fetchedUserName);

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

         // Removed risk status calculation as widget is replaced
         // const calculatedRisk: RiskStatus = 'medium'; // Example calculation for demonstration
         // setRiskStatus(calculatedRisk);
         // setRiskProgress(65); // Example progress

     }
     fetchData();

  }, []);

  // Get current translations based on language state
  const t = translations[language as keyof typeof translations] || translations.es;
  const chartConfig = getChartConfig(t);

  // Removed functions related to the old risk widget
  // const getRiskStatusColor = (status: RiskStatus): string => { ... };
  // const getProgressColorClass = (status: RiskStatus): string => { ... };
  // const getRiskStatusText = (status: RiskStatus): string => { ... };
  // const getRiskStatusDescription = (status: RiskStatus): string => { ... };
  // const getRiskStatusIcon = (status: RiskStatus): React.ReactElement => { ... };

  // Function to get qualitative stress level
  const getStressLevelLabel = (level: number): string => {
      if (level < 30) return t.stressLevelLow;
      if (level < 60) return t.stressLevelMedium;
      return t.stressLevelHigh;
  };

   // Updated recommendations using translations
   const getRecommendations = (t: any): Recommendation[] => [
       {
         id: 'rec_profile_update',
         title: t.recProfileUpdateTitle,
         reason: t.recProfileUpdateReason,
         benefit: t.recProfileUpdateBenefit,
         ctaLabel: t.recProfileUpdateCta,
         icon: Users, // Icon related to user profile
         priority: 'medium',
       },
       {
         id: 'rec_education_explore',
         title: t.recEducationExploreTitle,
         reason: t.recEducationExploreReason,
         benefit: t.recEducationExploreBenefit,
         ctaLabel: t.recEducationExploreCta,
         icon: GraduationCap, // Specific icon for education
         priority: 'medium',
       },
        // Example of a weather-related recommendation (conditionally added if data supports it)
        ...(weather && weather.temperatureFarenheit > 85 ? [{
            id: 'rec_heat_alert',
            title: t.recHeatAlertTitle, // Needs translation key
            reason: t.recHeatAlertReason(weather.temperatureFarenheit), // Needs translation key (with interpolation)
            benefit: t.recHeatAlertBenefit, // Needs translation key
            ctaLabel: t.recHeatAlertCta, // Needs translation key
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


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* 1. Saludo Personalizado */}
       <div className="mb-4">
         <h1 className="text-2xl font-semibold">{t.helloUser(userName)}</h1>
         {/* Display greeting or skeleton */}
         <div className="text-muted-foreground">
             {greeting ? greeting : <Skeleton className="h-5 w-24 inline-block" />}
         </div>
       </div>

       {/* 2. NEW Slider Widget: "Inspiring Protection" */}
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
                  layout="fill"
                  objectFit="cover"
                  className="brightness-75" // Slightly darken image for text contrast
                  data-ai-hint={slide.imageHint} // Keep the AI hint
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
        {/* Optional: Add Previous/Next buttons if needed, but autoplay reduces their necessity */}
        {/*
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
        */}
      </Carousel>

      {/* 3. Widgets Contextuales: Entorno Actual y Mercado Financiero */}
       <div className="grid gap-4 md:grid-cols-2">
           {/* Entorno Actual Card */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <Cloud className="h-5 w-5 text-muted-foreground" /> {t.currentEnvironmentTitle}
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-1">
                {loadingWeather || loadingLocation ? (
                  <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-5 w-3/4" />
                   </div>
                ) : weather ? (
                 <>
                  <p className="text-lg font-bold flex items-center gap-1">
                      {/* TODO: Add Weather Icon component based on weather.conditions */}
                      {weather.temperatureFarenheit}°F <span className="text-sm font-normal text-muted-foreground">{t.weatherLocationText(location ? t.yourLocation : t.unknownLocation)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{weather.conditions}</p> {/* TODO: Translate conditions */}
                  {/* TODO: Add Traffic insight */}
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground">{t.weatherUnavailableText}</p>
               )}
             </CardContent>
           </Card>

           {/* Mercado Financiero Card */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-muted-foreground" /> {t.financialMarketTitle}
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
                   <AlertTitle className="text-sm font-semibold">{t.inflationAlertTitle}</AlertTitle>
                   <AlertDescription className="text-xs">
                      {t.inflationAlertDesc}
                   </AlertDescription>
                 </Alert>
                 <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">{t.keyTipLabel}:</span> {t.keyTipContent}
                    </p>
                 </div>
             </CardContent>
           </Card>
        </div>

       {/* 4. Sección: Recomendaciones Clave - REDESIGNED */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold flex items-center gap-2">
             <Brain className="h-6 w-6 text-primary" /> {/* New Title Icon */}
             {t.smartIdeasTitle}
         </h2>
         {recommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {recommendations.map((rec) => (
                   // Using Opción A (Tarjeta Enriquecida) structure
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
                            <p><span className="font-semibold text-foreground">{t.whyNowLabel}:</span> {rec.reason}</p>
                            <p><span className="font-semibold text-green-600">{t.benefitLabel}:</span> {rec.benefit}</p>
                        </div>
                    </CardContent>
                     <CardFooter className="pt-2 pb-4 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
                         {/* Main CTA */}
                        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
                           <Link href={`/recommendations#${rec.id}`}>{rec.ctaLabel}</Link>
                        </Button>
                         {/* Optional Secondary Action */}
                         <Button variant="ghost" size="sm" className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground w-full sm:w-auto justify-center sm:justify-end">
                             {t.maybeLaterButton}
                         </Button>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center border-dashed">
                 <CardDescription>{t.noRecommendationsText}</CardDescription>
              </Card>
            )}
       </div>

      {/* 5. Sección: Tu Bienestar y Seguros - REDESIGNED */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <Card>
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> {t.wellbeingTitle}
                </CardTitle>
             </AccordionTrigger>
             <AccordionContent className="px-6 pb-4">
                 {loadingWearable ? (
                     <div className="flex items-center justify-center text-muted-foreground py-4">
                         <Skeleton className="h-5 w-5 mr-2 rounded-full" /> {t.loadingWellbeingData}
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
                             <span className="font-medium">{t.smartwatchLabel}:</span>
                             <Badge variant="default" className="bg-green-500 hover:bg-green-600">{t.connectedStatus}</Badge>
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

                        {/* Insights Clave */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {/* Heart Rate */}
                             <Card className="p-3">
                                <CardContent className="p-0 flex items-center gap-3">
                                  <HeartPulse className="h-6 w-6 text-red-500" />
                                  <div>
                                     <p className="text-sm text-muted-foreground">{t.heartRateLabel}</p>
                                     <p className="text-lg font-bold">{wearableData.heartRate} <span className="text-xs font-normal">{t.heartRateUnit}</span></p>
                                     <p className="text-xs text-muted-foreground">{t.averageTodayLabel}</p>
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
                                     <p className="text-sm text-muted-foreground">{t.stressLevelLabel}</p>
                                      <p className="text-lg font-bold">{getStressLevelLabel(wearableData.stressLevel)} <span className="text-xs font-normal">({wearableData.stressLevel}%)</span></p>
                                      {/* Updated Alert for high stress */}
                                     {wearableData.stressLevel > 60 && (
                                       <Alert variant="destructive" className="p-1 px-2 mt-1 text-xs flex items-center gap-1 border-orange-500 text-orange-700 dark:text-orange-400">
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>{t.stressIncreasedAlert}</span> {/* Simplified and translated */}
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
                                        <span className="font-semibold">{t.adaptivePremiumActiveTitle}</span> {t.adaptivePremiumActiveDesc('Vida')} {/* Replace 'Vida' with dynamic policy name */}
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <p className="text-muted-foreground">
                                        {t.adaptivePremiumInactiveDesc('Vida')} {/* Replace 'Vida' */}
                                        <Button variant="link" size="sm" className="p-0 h-auto ml-1" asChild>
                                            <Link href="/profile/settings">{t.activateAdaptivePremiumsButton}</Link>
                                        </Button>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                        <WifiOff className="h-10 w-10 mb-2" />
                        <p className="text-sm mb-2">{t.wearableDisconnectedText}</p>
                        <Button variant="outline" size="sm">{t.connectNowButton}</Button> {/* Changed label */}
                    </div>
                 )}
             </AccordionContent>
           </Card>
        </AccordionItem>
      </Accordion>

       {/* 6. Acceso Rápido */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold">{t.quickAccessTitle}</h2>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {/* Using default button style for more visibility */}
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
             <CreditCard className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                 <span className="font-medium">{t.payNextInstallmentButton}</span>
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
             <FileWarning className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                <span className="font-medium">{t.reportIncidentButton}</span>
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link href="/insurances">
                 <ShieldCheck className="mr-3 h-5 w-5 shrink-0" />
                 <div className="flex flex-col">
                     <span className="font-medium">{t.viewMyInsurancesButton}</span>
                 </div>
               </Link>
           </Button>
         </div>
       </div>

        {/* Add shadow style for text over image */}
       <style jsx>{`
           .shadow-text {
             text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
           }
       `}</style>
    </div>
  );
}

// Removed ProgressIndicator helper as Progress component is now handled directly
// const ProgressIndicator = ...;

// Removed Progress component augmentation
// declare module "@/components/ui/progress" { ... }

