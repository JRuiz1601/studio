'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { AlertCircle, Cloud, MapPin, HeartPulse, Zap, BatteryCharging, WifiOff } from 'lucide-react';
import Image from 'next/image';
import type { Location } from '@/services/gps';
import type { Weather } from '@/services/weather';
import type { WearableBattery, WearableConnectionStatus, WearableData } from '@/services/wearable';
import { getCurrentLocation } from '@/services/gps';
import { getWeather } from '@/services/weather';
import { getWearableBatteryStatus, getWearableConnectionStatus, getWearableData } from '@/services/wearable';
import { Skeleton } from '@/components/ui/skeleton';

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


  // Fetch data on component mount
  useEffect(() => {
     async function fetchData() {
        setLoadingLocation(true);
        setLoadingWeather(true);
        setLoadingWearable(true);

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
         // setRiskStatus('medium');
     }
     fetchData();
  }, []);


  const getRiskStatusColor = (status: RiskStatus): string => {
    switch (status) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

   const recommendations: Recommendation[] = [
    // Dynamically generate recommendations based on data
    ...(weather && weather.temperatureFarenheit > 85 ? [{ id: 'rec1', title: 'Hot Weather Alert', description: 'Stay hydrated and avoid strenuous activity.', type: 'weather', icon: Cloud } as Recommendation] : []),
    ...(location ? [{ id: 'rec2', title: 'Location Context', description: `Current conditions near ${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}.`, type: 'location', icon: MapPin } as Recommendation] : []),
    ...(wearableData && wearableData.stressLevel > 60 ? [{ id: 'rec3', title: 'High Stress Detected', description: 'Consider taking a short break or practicing mindfulness.', type: 'wearable', icon: Zap } as Recommendation] : []),
    { id: 'rec4', title: 'Profile Review', description: 'Ensure your profile details are up-to-date for accurate recommendations.', type: 'profile', icon: AlertCircle },
  ];


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Risk Status Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">Risk Status</CardTitle>
          <div className={`h-4 w-4 rounded-full ${getRiskStatusColor(riskStatus)} animate-pulse`}></div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
             Current assessment based on available data.
             Status: <span className={`font-semibold capitalize text-${getRiskStatusColor(riskStatus).split('-')[1]}-600`}>{riskStatus}</span>
          </p>
           {/* Add more details or actions based on risk */}
        </CardContent>
      </Card>

      {/* Recommendations Carousel/Grid */}
       <div className="space-y-4">
         <h2 className="text-xl font-semibold">Recommendations</h2>
         {recommendations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                 {recommendations.map((rec) => (
                  <Card key={rec.id} className="flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                       <rec.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="text-base font-medium flex-1">{rec.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </CardContent>
                    {/* Optional CardFooter for actions */}
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>
            )}
       </div>


       {/* Contextual Info (Weather & Location) */}
       <div className="grid gap-4 md:grid-cols-2">
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <MapPin className="h-5 w-5 text-muted-foreground" /> Location
               </CardTitle>
             </CardHeader>
             <CardContent>
               {loadingLocation ? (
                   <Skeleton className="h-5 w-3/4" />
               ) : location ? (
                 <p className="text-sm text-muted-foreground">
                     Lat: {location.latitude.toFixed(4)}, Lng: {location.longitude.toFixed(4)}
                 </p>
               ) : (
                 <p className="text-sm text-muted-foreground">Location data unavailable.</p>
               )}
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2">
               <CardTitle className="text-base font-medium flex items-center gap-2">
                 <Cloud className="h-5 w-5 text-muted-foreground" /> Weather
               </CardTitle>
             </CardHeader>
             <CardContent>
                {loadingWeather ? (
                  <div className="space-y-2">
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="h-5 w-3/4" />
                   </div>
                ) : weather ? (
                 <>
                  <p className="text-2xl font-bold">{weather.temperatureFarenheit}°F</p>
                  <p className="text-sm text-muted-foreground">{weather.conditions}</p>
                 </>
               ) : (
                 <p className="text-sm text-muted-foreground">Weather data unavailable.</p>
               )}
             </CardContent>
           </Card>
        </div>


      {/* Wearable Section */}
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1" className="border-b-0">
           <Card>
             <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <HeartPulse className="h-5 w-5" /> Wearable Status
                </CardTitle>
             </AccordionTrigger>
             <AccordionContent className="px-6 pb-4">
                 {loadingWearable ? (
                     <div className="space-y-4">
                       <div className="flex justify-between"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-5 w-1/4" /></div>
                       <div className="flex justify-between"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div>
                       <div className="flex justify-between"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-5 w-1/4" /></div>
                     </div>
                 ) : wearableStatus === 'connected' && wearableBattery && wearableData ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Connection:</span>
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600">Connected</Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Battery:</span>
                          <div className="flex items-center gap-1">
                             {wearableBattery.isCharging && <BatteryCharging className="h-4 w-4 text-yellow-500" />}
                            <span>{wearableBattery.percentage}%</span>
                          </div>
                        </div>
                         <Separator />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Heart Rate:</span>
                          <span>{wearableData.heartRate} bpm</span>
                        </div>
                        <Separator />
                         <div className="flex items-center justify-between text-sm">
                           <span className="text-muted-foreground">Stress Level:</span>
                           <span>{wearableData.stressLevel}%</span>
                         </div>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center text-center text-muted-foreground py-4">
                        <WifiOff className="h-10 w-10 mb-2" />
                        <p className="text-sm">Wearable disconnected or unavailable.</p>
                        {/* TODO: Add link/button to configure or troubleshoot */}
                         <Button variant="link" size="sm" className="mt-2">Configure Wearable</Button>
                    </div>
                 )}
             </AccordionContent>
           </Card>
        </AccordionItem>
      </Accordion>

    </div>
  );
}
