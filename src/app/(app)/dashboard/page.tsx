
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
   TrendingUp, AlertTriangle, Lightbulb, ShieldAlert, ShieldX, Shield, GraduationCap, Users, PhoneCall // Added relevant icons
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
// Removed Progress import as it's replaced by semaphore icon
// import { Progress } from '@/components/ui/progress';

type RiskStatus = 'low' | 'medium' | 'high';

// Example recommendation structure
interface Recommendation {
  id: string;
  title: string;
  description: string; // Refined XAI text
  type: 'weather' | 'location' | 'profile' | 'wearable' | 'financial'; // Added financial type
  icon: React.ComponentType<{ className?: string }>; // Use more specific icons
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
  // Removed protectionPercentage state
  // const [protectionPercentage, setProtectionPercentage] = useState(0);
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

         // TODO: Calculate risk status based on fetched data (policies, profile, context)
         // This calculation should replace the hardcoded value
         const calculatedRisk: RiskStatus = 'medium'; // Example calculation for demonstration
         setRiskStatus(calculatedRisk);

         // Removed protection percentage calculation
     }
     fetchData();

     // Set greeting on client side after mount
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
      switch (status) {
          case 'low': return <ShieldCheck className="h-10 w-10 text-green-500" />; // Larger icon
          case 'medium': return <ShieldAlert className="h-10 w-10 text-yellow-500" />; // Larger icon
          case 'high': return <ShieldX className="h-10 w-10 text-red-500" />; // Larger icon
          default: return <Shield className="h-10 w-10 text-gray-500" />; // Larger icon
      }
  };

   // Updated recommendations with better icons and XAI text
   const recommendations: Recommendation[] = [
    // Dynamically generate recommendations based on data
    ...(weather && weather.temperatureFarenheit > 85 ? [{ id: 'rec1', title: 'Alerta por Calor', description: 'Con el calor actual, recuerda mantenerte hidratado y evitar actividades extenuantes.', type: 'weather', icon: Cloud } as Recommendation] : []),
    ...(wearableData && wearableData.stressLevel > 60 ? [{ id: 'rec3', title: 'Estrés Elevado Detectado', description: 'Tu nivel de estrés es más alto de lo usual. Considera un breve descanso o una pausa para relajarte.', type: 'wearable', icon: Zap } as Recommendation] : []),
    { id: 'rec4', title: 'Revisa tu Perfil', description: 'Para darte recomendaciones más precisas, ¿revisamos si los datos de tu perfil están al día?', type: 'profile', icon: Users }, // Changed icon and text
    { id: 'rec5', title: 'Explora Seguro Educativo', description: 'Como tus dependientes (simulado) están en edad escolar, te sugerimos explorar el Seguro Educativo.', type: 'profile', icon: GraduationCap }, // Changed icon and text
  ].slice(0, 3); // Limit to 3 recommendations for the carousel


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* 1. Saludo Personalizado */}
       <div className="mb-4">
         <h1 className="text-2xl font-semibold">Hola {userName},</h1>
         {/* Display greeting or skeleton */}
         <div className="text-muted-foreground">{greeting || <Skeleton className="h-5 w-24 inline-block" />}</div>
       </div>

      {/* 2. Widget Principal: Nivel de Protección */}
      <Card className="border-primary shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
             Tu Nivel de Protección Hoy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex flex-col sm:flex-row items-center gap-4"> {/* Adjusted layout */}
           {/* Semaphore Icon */}
           <div className="flex-shrink-0">
               {getRiskStatusIcon(riskStatus)}
           </div>

           {/* Status Text and CTA */}
           <div className="flex-1 space-y-2">
               <p className={`text-xl font-bold capitalize ${getRiskStatusColor(riskStatus)}`}>
                  {getRiskStatusText(riskStatus)}
               </p>
               <p className="text-sm text-muted-foreground">
                  {getRiskStatusDescription(riskStatus)}
               </p>
               {/* Conditional CTA Button */}
               <Button variant="link" size="sm" className="p-0 h-auto justify-start" asChild>
                  <Link href={riskStatus === 'medium' || riskStatus === 'high' ? '/recommendations' : '/insurances'}>
                     {riskStatus === 'medium' || riskStatus === 'high' ? 'Ver Recomendaciones' : 'Ver Mis Seguros'}
                  </Link>
               </Button>
           </div>

           {/* Removed Progress Bar */}
           {/* Removed "Mejorar mi protección" button */}
        </CardContent>
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
                      {/* TODO: Add Weather Icon component */}
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


       {/* 4. Sección: Recomendaciones Clave */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold">Recomendaciones Clave para Ti</h2>
         {recommendations.length > 0 ? (
             // TODO: Implement Carousel/Horizontal Scroll
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {recommendations.map((rec) => (
                  <Card key={rec.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start gap-3 pb-2">
                       <rec.icon className="h-6 w-6 text-primary mt-1 shrink-0" />
                       <div className="flex-1">
                           <CardTitle className="text-base font-medium mb-1">{rec.title}</CardTitle>
                           {/* Updated to use refined XAI text */}
                           <p className="text-xs text-muted-foreground leading-snug">{rec.description}</p>
                       </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-2 pb-4">
                       {/* Content if needed */}
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Button variant="secondary" size="sm" className="w-full" asChild>
                           <Link href={`/recommendations#${rec.id}`}>Ver Detalles</Link>
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-4 text-center border-dashed">
                 <CardDescription>No hay recomendaciones clave en este momento.</CardDescription>
              </Card>
            )}
       </div>

      {/* 5. Sección: Tu Bienestar y Seguros */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <Card>
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <HeartPulse className="h-5 w-5" /> Tu Bienestar y Seguros
                </CardTitle>
             </AccordionTrigger>
             <AccordionContent className="px-6 pb-4">
                 {loadingWearable ? (
                     <div className="flex items-center justify-center text-muted-foreground py-4">
                         <Skeleton className="h-5 w-5 mr-2 rounded-full" /> Cargando datos de bienestar...
                     </div>
                 ) : wearableStatus === 'connected' && wearableBattery && wearableData ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Wearable:</span>
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Conectado</Badge>
                        </div>
                        <Separator />
                         {/* Basic Insight Widget */}
                          <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground flex items-center gap-1"><HeartPulse className="h-4 w-4"/> Ritmo Cardíaco:</span>
                             <span>{wearableData.heartRate} lpm <span className="text-xs">(Promedio)</span></span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground flex items-center gap-1"><Zap className="h-4 w-4"/> Nivel Estrés:</span>
                             <div className="flex flex-col items-end">
                                <span>{wearableData.stressLevel}%</span>
                                {wearableData.stressLevel > 60 && ( // Example threshold for high stress
                                   <Alert variant="destructive" className="p-1 px-2 mt-1 text-xs">
                                      <AlertTriangle className="h-3 w-3" />
                                      <AlertDescription>Estrés aumentó 20%</AlertDescription> {/* Added message */}
                                   </Alert>
                                )}
                             </div>
                          </div>
                           <Separator />
                           <div className="flex items-center justify-between text-sm">
                             <span className="text-muted-foreground">Batería Wearable:</span>
                             <div className="flex items-center gap-1">
                                {wearableBattery.isCharging && <BatteryCharging className="h-4 w-4 text-yellow-500" />}
                               <span>{wearableBattery.percentage}%</span>
                             </div>
                           </div>
                           {/* Updated text for wellness-premium connection */}
                           {adaptivePremiumsActive ? (
                             <p className="text-xs text-muted-foreground pt-2">Tus hábitos saludables actuales están ayudando a [mantener/reducir] la prima de tu [Seguro X]. ¡Sigue así!</p>
                           ) : (
                              <p className="text-xs text-muted-foreground pt-2">
                                 ¿Sabías que podrías optimizar tus primas conectando tus datos de bienestar?
                                 <Button variant="link" size="sm" className="p-0 h-auto ml-1" asChild>
                                    <Link href="/profile/settings">Actívalo en Configuración.</Link>
                                 </Button>
                              </p>
                           )}
                           {/* Link to a dedicated wellness section or settings */}
                           {/* <Button variant="link" size="sm" className="p-0 h-auto mt-1">Ver más detalles</Button> */}
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                        <WifiOff className="h-10 w-10 mb-2" />
                        <p className="text-sm mb-2">Wearable desconectado o no configurado.</p>
                        <Button variant="outline" size="sm">Configurar Wearable</Button>
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
                 {/* <span className="text-xs text-muted-foreground">Vence el DD/MM</span> */}
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90">
             <FileWarning className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                <span className="font-medium">Reportar Incidente</span>
                {/* <span className="text-xs text-muted-foreground">Iniciar reclamación</span> */}
             </div>
           </Button>
           <Button variant="default" className="justify-start text-left h-auto py-3 bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <Link href="/insurances">
                 <ShieldCheck className="mr-3 h-5 w-5 shrink-0" />
                 <div className="flex flex-col">
                     <span className="font-medium">Ver Mis Seguros</span>
                     {/* <span className="text-xs text-muted-foreground">[N] pólizas activas</span> */}
                 </div>
               </Link>
           </Button>
         </div>
       </div>

    </div>
  );


}

