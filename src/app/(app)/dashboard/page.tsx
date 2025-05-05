'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link'; // Import Link for navigation
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
   TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, ShieldX, Shield, GraduationCap, Users, PhoneCall,
   Sparkles, CheckCircle, Check, Brain // Added Brain for AI/Intelligent ideas
} from 'lucide-react'; // Added new icons
import Image from 'next/image';
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


// Mock data for the financial chart
const chartData = [
  { month: "Jan", inflation: 2.1, market: 100 },
  { month: "Feb", inflation: 2.3, market: 102 },
  { month: "Mar", inflation: 2.5, market: 101 },
  { month: "Apr", inflation: 2.8, market: 105 },
  { month: "May", inflation: 3.1, market: 103 },
  { month: "Jun", inflation: 3.5, market: 108 },
];

// Chart configuration
const chartConfig = {
  inflation: {
    label: "Inflación (%)",
    color: "hsl(var(--destructive))", // Use destructive color for inflation
  },
  market: {
    label: "Mercado (Índice)",
    color: "hsl(var(--primary))", // Use primary color for market trend
  },
} satisfies ChartConfig;


export default function DashboardPage() {
  const [riskStatus, setRiskStatus] = useState<RiskStatus>('low');
  const [riskProgress, setRiskProgress] = useState(85); // Example protection progress percentage
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

         // TODO: Calculate risk status and progress based on fetched data (policies, profile, context)
         // This calculation should replace the hardcoded values
         const calculatedRisk: RiskStatus = 'medium'; // Example calculation for demonstration
         setRiskStatus(calculatedRisk);
         setRiskProgress(65); // Example progress

     }
     fetchData();

     // Set greeting on client side after mount - Moved inside useEffect
     const hour = new Date().getHours();
     if (hour < 12) setGreeting('Buenos días.');
     else if (hour < 18) setGreeting('Buenas tardes.');
     else setGreeting('Buenas noches.');

  }, []);


  const getRiskStatusColor = (status: RiskStatus): string => {
    switch (status) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  // Function to get color for progress bar based on status
   const getProgressColorClass = (status: RiskStatus): string => {
     switch (status) {
       case 'low': return 'bg-green-500';
       case 'medium': return 'bg-yellow-500';
       case 'high': return 'bg-red-500';
       default: return 'bg-primary';
     }
   };
   const getRiskStatusText = (status: RiskStatus): string => {
     switch (status) {
       case 'low': return 'Todo en orden';
       case 'medium': return 'Revisa recomendaciones';
       case 'high': return 'Acción requerida';
       default: return 'Desconocido';
     }
   };
   const getRiskStatusDescription = (status: RiskStatus): string => {
      switch (status) {
        case 'low': return 'Tu protección está optimizada según tu perfil actual.'; // Updated text
        case 'medium': return 'Revisa estas sugerencias para optimizar tu protección:'; // Updated text
        case 'high': return 'Se requiere atención inmediata para mitigar riesgos.';
        default: return 'No se puede determinar el estado de protección.';
      }
    };

  const getRiskStatusIcon = (status: RiskStatus): React.ReactElement => {
      // Using Shield icons for semantic meaning
      switch (status) {
          case 'low': return <ShieldCheck className="h-10 w-10 text-green-500" />; // More positive
          case 'medium': return <ShieldAlert className="h-10 w-10 text-yellow-500" />; // Alert state
          case 'high': return <ShieldX className="h-10 w-10 text-red-500" />; // Problem state
          default: return <Shield className="h-10 w-10 text-gray-500" />; // Default/Unknown
      }
  };

  // Function to get qualitative stress level
  const getStressLevelLabel = (level: number): string => {
      if (level < 30) return 'Bajo';
      if (level < 60) return 'Medio';
      return 'Alto';
  };

  // Updated recommendations with new structure
   const recommendations: Recommendation[] = [
       {
         id: 'rec_profile_update',
         title: '¡Optimiza tus Recomendaciones!',
         reason: 'Un perfil completo nos ayuda a darte sugerencias más precisas.',
         benefit: 'Asegúrate de que tu protección y consejos se ajustan perfectamente a ti.',
         ctaLabel: 'Revisar mi Perfil',
         icon: Users, // Icon related to user profile
         priority: 'medium',
       },
       {
         id: 'rec_education_explore',
         title: 'Asegura la U. de tus Hijos',
         reason: 'Detectamos que tus dependientes (simulado) están en edad escolar.',
         benefit: 'Garantiza sus estudios futuros sin importar imprevistos y empieza a ahorrar de forma planificada.',
         ctaLabel: 'Explorar Seguro Educativo',
         icon: GraduationCap, // Specific icon for education
         priority: 'medium',
       },
       // Example of a weather-related recommendation (conditionally added if data supports it)
       ...(weather && weather.temperatureFarenheit > 85 ? [{
           id: 'rec_heat_alert',
           title: 'Protégete del Calor',
           reason: `La temperatura actual es ${weather.temperatureFarenheit}°F.`,
           benefit: 'Recuerda mantenerte hidratado y evitar actividades extenuantes.',
           ctaLabel: 'Ver Consejos de Salud',
           icon: Cloud, // Or a specific Sun icon
           priority: 'low',
       } as Recommendation] : []),
   ].sort((a, b) => { // Simple sort: high > medium > low
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority || 'low'] || 4) - (priorityOrder[b.priority || 'low'] || 4);
   }).slice(0, 3); // Limit to 3 recommendations


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* 1. Saludo Personalizado */}
       <div className="mb-4">
         <h1 className="text-2xl font-semibold">Hola {userName},</h1>
         {/* Display greeting or skeleton */}
         <div className="text-muted-foreground">{greeting || <Skeleton className="h-5 w-24 inline-block" />}</div>
       </div>

      {/* 2. Widget Principal: Nivel de Protección - UPDATED */}
      <Card className="border-primary shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
             Tu Nivel de Protección Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Semaphore/Shield Icon */}
               <div className="flex-shrink-0">
                   {getRiskStatusIcon(riskStatus)}
               </div>
               {/* Status Text and Description */}
               <div className="flex-1 space-y-1 text-center sm:text-left">
                   <p className={`text-xl font-bold capitalize ${getRiskStatusColor(riskStatus)}`}>
                      {getRiskStatusText(riskStatus)}
                   </p>
                   <p className="text-sm text-muted-foreground">
                      {getRiskStatusDescription(riskStatus)}
                   </p>
               </div>
            </div>
             {/* Protection Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-sm font-medium">
                    <span>Nivel de Cobertura Estimado</span>
                    <span>{riskProgress}%</span>
                </div>
                <Progress value={riskProgress} className="h-2" indicatorClassName={getProgressColorClass(riskStatus)} />
            </div>
        </CardContent>
         <CardFooter className="flex flex-col sm:flex-row gap-2 justify-end border-t pt-4">
             {/* Conditional CTAs based on risk status */}
             {(riskStatus === 'medium' || riskStatus === 'high') && (
                 <Button variant="default" size="sm" asChild>
                     <Link href='/recommendations'>Ver Recomendaciones</Link>
                 </Button>
             )}
             <Button variant="outline" size="sm" asChild>
                 {/* Link to a potential simulation or profile page */}
                 <Link href='/profile/settings'>Simular Otro Perfil</Link>
             </Button>
             <Button variant="secondary" size="sm" asChild>
                 <Link href='/insurances'>Mejorar mi Protección</Link>
             </Button>
         </CardFooter>
      </Card>

      {/* 3. Widgets Contextuales: Entorno Actual y Mercado Financiero */}
       <div className="grid gap-4 md:grid-cols-2">
           {/* Entorno Actual Card */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <Cloud className="h-5 w-5 text-muted-foreground" /> Entorno Actual
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
                      {weather.temperatureFarenheit}°F <span className="text-sm font-normal text-muted-foreground">en {location ? `tu ubicación` : 'desconocida'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{weather.conditions}</p>
                  {/* TODO: Add Traffic insight */}
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground">Datos de clima no disponibles.</p>
               )}
             </CardContent>
           </Card>

           {/* Mercado Financiero Card */}
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <TrendingUp className="h-5 w-5 text-muted-foreground" /> Mercado Financiero
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
                   <AlertTitle className="text-sm font-semibold">Alerta de Inflación</AlertTitle>
                   <AlertDescription className="text-xs">
                      La inflación sigue en aumento. Protege tus ahorros.
                   </AlertDescription>
                 </Alert>
                 <div className="flex items-start gap-2 text-sm">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Tip Clave:</span> Considera diversificar tus inversiones y revisa opciones de ahorro con protección inflacionaria.
                    </p>
                 </div>
             </CardContent>
           </Card>
        </div>

       {/* 4. Sección: Recomendaciones Clave - REDESIGNED */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold flex items-center gap-2">
             <Brain className="h-6 w-6 text-primary" /> {/* New Title Icon */}
             Ideas Inteligentes para tu Protección
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
                            <p><span className="font-semibold text-foreground">¿Por qué ahora?</span> {rec.reason}</p>
                            <p><span className="font-semibold text-green-600">Beneficio:</span> {rec.benefit}</p>
                        </div>
                    </CardContent>
                     <CardFooter className="pt-2 pb-4 border-t flex flex-col sm:flex-row gap-2 justify-between items-center">
                         {/* Main CTA */}
                        <Button variant="default" size="sm" className="w-full sm:w-auto" asChild>
                           <Link href={`/recommendations#${rec.id}`}>{rec.ctaLabel}</Link>
                        </Button>
                         {/* Optional Secondary Action */}
                         <Button variant="ghost" size="sm" className="text-xs text-muted-foreground p-0 h-auto hover:text-foreground w-full sm:w-auto justify-center sm:justify-end">
                             Quizás más tarde
                         </Button>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center border-dashed">
                 <CardDescription>No hay ideas inteligentes para ti en este momento.</CardDescription>
              </Card>
            )}
       </div>

      {/* 5. Sección: Tu Bienestar y Seguros - REDESIGNED */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <Card>
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> ¡Tu Bienestar te Premia!
                </CardTitle>
             </AccordionTrigger>
             <AccordionContent className="px-6 pb-4">
                 {loadingWearable ? (
                     <div className="flex items-center justify-center text-muted-foreground py-4">
                         <Skeleton className="h-5 w-5 mr-2 rounded-full" /> Cargando datos de bienestar...
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
                             <span className="font-medium">Smartwatch:</span>
                             <Badge variant="default" className="bg-green-500 hover:bg-green-600">Conectado</Badge>
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
                                     <p className="text-sm text-muted-foreground">Ritmo Cardíaco</p>
                                     <p className="text-lg font-bold">{wearableData.heartRate} <span className="text-xs font-normal">lpm</span></p>
                                     <p className="text-xs text-muted-foreground">(Promedio hoy)</p>
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
                                     <p className="text-sm text-muted-foreground">Nivel Estrés</p>
                                      <p className="text-lg font-bold">{getStressLevelLabel(wearableData.stressLevel)} <span className="text-xs font-normal">({wearableData.stressLevel}%)</span></p>
                                      {/* Updated Alert for high stress */}
                                     {wearableData.stressLevel > 60 && (
                                       <Alert variant="destructive" className="p-1 px-2 mt-1 text-xs flex items-center gap-1 border-orange-500 text-orange-700 dark:text-orange-400">
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>Estrés aumentó</span> {/* Simplified */}
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
                                        <span className="font-semibold">¡Excelente!</span> Tus niveles de actividad constantes están ayudando a optimizar la prima de tu Seguro de Vida. ¡Sigue así! 💪
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2 text-sm">
                                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                                    <p className="text-muted-foreground">
                                        ¿Sabías que tus datos de bienestar podrían ayudarte a pagar menos en tu seguro de Vida?
                                        <Button variant="link" size="sm" className="p-0 h-auto ml-1" asChild>
                                            <Link href="/profile/settings">Activa las Primas Adaptativas</Link>
                                        </Button> para descubrirlo.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                        <WifiOff className="h-10 w-10 mb-2" />
                        <p className="text-sm mb-2">Wearable desconectado o no configurado.</p>
                        <Button variant="outline" size="sm">Conectar ahora</Button> {/* Changed label */}
                    </div>
                 )}
             </AccordionContent>
           </Card>
        </AccordionItem>
      </Accordion>

       {/* 6. Acceso Rápido */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold">Acceso Rápido</h2>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {/* Using default button style for more visibility */}
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
             <CreditCard className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                 <span className="font-medium">Pagar Próxima Cuota</span>
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
             <FileWarning className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                <span className="font-medium">Reportar Incidente</span>
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link href="/insurances">
                 <ShieldCheck className="mr-3 h-5 w-5 shrink-0" />
                 <div className="flex flex-col">
                     <span className="font-medium">Ver Mis Seguros</span>
                 </div>
               </Link>
           </Button>
         </div>
       </div>
    </div>
  );
}


// Helper component for Progress Bar indicator class - needed because Tailwind cannot dynamically generate classes based on props/state directly
const ProgressIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: number | null, status: RiskStatus }
>(({ className, value, status, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-full w-full flex-1 transition-all",
      getProgressColorClass(status), // Apply color class dynamically
      className
    )}
    style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    {...props}
  />
));
ProgressIndicator.displayName = "ProgressIndicator";

// Augment Progress component to accept indicatorClassName prop
declare module "@/components/ui/progress" {
  interface ProgressProps {
    indicatorClassName?: string;
  }
}
