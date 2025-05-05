
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
import { AlertCircle, Cloud, MapPin, HeartPulse, Zap, BatteryCharging, WifiOff, CreditCard, FileWarning, ShieldCheck } from 'lucide-react'; // Added new icons
import Image from 'next/image';
import type { Location } from '@/services/gps';
import type { Weather } from '@/services/weather';
import type { WearableBattery, WearableConnectionStatus, WearableData } from '@/services/wearable';
import { getCurrentLocation } from '@/services/gps';
import { getWeather } from '@/services/weather';
import { getWearableBatteryStatus, getWearableConnectionStatus, getWearableData } from '@/services/wearable';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button'; // Import Button

type RiskStatus = 'low' | 'medium' | 'high';

// Example recommendation structure
interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'weather' | 'location' | 'profile' | 'wearable';
  icon: React.ComponentType<{ className?: string }>;
}

export default function DashboardPage() {
  const [riskStatus, setRiskStatus] = useState<RiskStatus>('low');
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

         // TODO: Calculate risk status based on fetched data
         // Example: High risk if high stress and bad weather
         setRiskStatus('low'); // Default to low for now
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
      case 'low': return 'bg-green-500'; // Consider using theme colors: bg-success?
      case 'medium': return 'bg-yellow-500'; // Consider using theme colors: bg-warning?
      case 'high': return 'bg-red-500'; // Consider using theme colors: bg-destructive
      default: return 'bg-gray-500'; // Consider using theme colors: bg-muted
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
        case 'low': return 'Estás bien protegido según tu perfil actual.';
        case 'medium': return 'Tenemos algunas sugerencias para optimizar tu protección.';
        case 'high': return 'Se requiere atención inmediata para mitigar riesgos.';
        default: return 'No se puede determinar el estado de protección.';
      }
    };

   const recommendations: Recommendation[] = [
    // Dynamically generate recommendations based on data
    ...(weather && weather.temperatureFarenheit > 85 ? [{ id: 'rec1', title: 'Alerta por Calor', description: 'Mantente hidratado y evita actividades extenuantes.', type: 'weather', icon: Cloud } as Recommendation] : []),
    //...(location ? [{ id: 'rec2', title: 'Contexto de Ubicación', description: `Condiciones actuales cerca de ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}.`, type: 'location', icon: MapPin } as Recommendation] : []),
    ...(wearableData && wearableData.stressLevel > 60 ? [{ id: 'rec3', title: 'Estrés Elevado Detectado', description: 'Considera tomar un breve descanso o practicar mindfulness.', type: 'wearable', icon: Zap } as Recommendation] : []),
    { id: 'rec4', title: 'Revisa tu Perfil', description: 'Asegúrate que tus datos estén actualizados para recomendaciones precisas.', type: 'profile', icon: AlertCircle },
    { id: 'rec5', title: 'Considera Seguro Educativo', description: 'Basado en la edad de tus dependientes (simulado).', type: 'profile', icon: AlertCircle }, // Example
  ].slice(0, 3); // Limit to 3 recommendations for the carousel


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">

      {/* 1. Saludo Personalizado */}
       <div className="mb-4">
         <h1 className="text-2xl font-semibold">Hola {userName},</h1>
         <p className="text-muted-foreground">{greeting || <Skeleton className="h-5 w-24 inline-block" />}</p> {/* Display greeting or skeleton */}
       </div>

      {/* 2. Widget Principal: Nivel de Protección */}
      <Card className="border-primary shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Tu Nivel de Protección Hoy</CardTitle>
          <div className={`h-5 w-5 rounded-full ${getRiskStatusColor(riskStatus)} flex items-center justify-center text-white text-xs`}>
             {/* Optionally add an icon based on status */}
             {riskStatus === 'low' && '✓'}
             {riskStatus === 'medium' && '!'}
             {riskStatus === 'high' && 'X'}
          </div>
        </CardHeader>
        <CardContent>
          <p className={`text-xl font-bold capitalize text-${getRiskStatusColor(riskStatus).split('-')[1]}-600 mb-1`}>
             {getRiskStatusText(riskStatus)}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
             {getRiskStatusDescription(riskStatus)}
          </p>
           <Button variant="link" size="sm" className="p-0 h-auto" asChild>
              <Link href={riskStatus === 'medium' || riskStatus === 'high' ? '/recommendations' : '/insurances'}>
                 {riskStatus === 'medium' || riskStatus === 'high' ? 'Ver Recomendaciones' : 'Ver Mis Seguros'}
              </Link>
            </Button>
        </CardContent>
      </Card>

      {/* 3. Widget Contextual: Entorno Actual */}
       <div className="grid gap-4 md:grid-cols-2">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <Cloud className="h-5 w-5 text-muted-foreground" /> Entorno Actual
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-1">
                {loadingWeather ? (
                  <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-5 w-3/4" />
                   </div>
                ) : weather ? (
                 <>
                  <p className="text-lg font-bold flex items-center gap-1">
                      {/* TODO: Add Weather Icon component */}
                      {weather.temperatureFarenheit}°F <span className="text-sm font-normal text-muted-foreground">en {location ? `${location.latitude.toFixed(1)}, ${location.longitude.toFixed(1)}` : 'tu ubicación'}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{weather.conditions}</p>
                  {/* TODO: Add Traffic insight */}
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground">Datos de clima no disponibles.</p>
               )}
             </CardContent>
           </Card>

            {/* Placeholder for Location Card if needed separately */}
           {/* <Card> ... </Card> */}
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
                         <Skeleton className="h-5 w-5 mr-2" /> Cargando datos de bienestar...
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
                                  <span className="text-xs text-destructive">Alerta: Estrés aumentó un 20%</span>
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
                           <p className="text-xs text-muted-foreground pt-2">Mantén tus hábitos saludables para optimizar tus primas.</p>
                           {/* TODO: Link to a dedicated wellness section or settings */}
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
           <Button variant="outline" className="justify-start text-left h-auto py-3">
             <CreditCard className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                 <span className="font-medium">Pagar Próxima Cuota</span>
                 {/* <span className="text-xs text-muted-foreground">Vence el DD/MM</span> */}
             </div>
           </Button>
           <Button variant="outline" className="justify-start text-left h-auto py-3">
             <FileWarning className="mr-3 h-5 w-5 shrink-0" />
             <div className="flex flex-col">
                <span className="font-medium">Reportar Incidente</span>
                {/* <span className="text-xs text-muted-foreground">Iniciar reclamación</span> */}
             </div>
           </Button>
           <Button variant="outline" className="justify-start text-left h-auto py-3" asChild>
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

