
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle, Eye, EyeOff, Cloud, ListFilter, Sun, Wind, Droplets, X, Minus, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { riskZonesCali, weatherDataCali } from '@/data/map-data'; // Import sample data
import type { RiskZone, WeatherData } from '@/data/map-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

// Dynamic import for LeafletMap component
const LeafletMap = dynamic(
  () => import('@/components/map/leaflet-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full p-4 bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

const WeatherPanel = ({ weather, onClose }: { weather: WeatherData; onClose: () => void }) => {
  const chartConfig: ChartConfig = {
    temperature: {
      label: "Temp (°C)",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="absolute top-4 right-4 z-[1000] w-full max-w-xs md:max-w-sm shadow-lg bg-card text-card-foreground rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Cloud className="h-5 w-5 mr-2 text-primary" />
          Weather in Cali
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <ScrollArea className="h-[calc(100vh-200px)] md:h-auto md:max-h-[calc(100vh-200px)]">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div className="flex items-center">
              <weather.current.icon className="h-10 w-10 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{weather.current.temperature}°C</p>
                <p className="text-sm text-muted-foreground">{weather.current.condition}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p>Feels like: {weather.current.feelsLike}°C</p>
              <p className="flex items-center justify-end"><Droplets className="h-3 w-3 mr-1 text-blue-400" /> {weather.current.humidity}%</p>
              <p className="flex items-center justify-end"><Wind className="h-3 w-3 mr-1 text-gray-400" /> {weather.current.windSpeed} km/h</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm">Hourly Forecast (Next 6h)</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              {weather.hourlyForecast.slice(0, 6).map((hour) => (
                <div key={hour.time} className="p-2 bg-muted/30 rounded-md text-xs">
                  <p className="font-semibold">{hour.time}</p>
                  <hour.icon className="h-6 w-6 mx-auto my-1 text-primary" />
                  <p>{hour.temperature}°C</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-1 text-sm">24h Temperature Trend</h4>
            <div className="h-[100px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart
                  data={weather.dailyTrend}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/20" />
                  <XAxis
                    dataKey="hour"
                    tickFormatter={(value) => `${value}:00`}
                    tickLine={false}
                    axisLine={false}
                    interval={5} // Show every 6th hour
                    style={{ fontSize: '0.65rem', fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `${value}°`}
                    style={{ fontSize: '0.65rem', fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line
                    dataKey="temperature"
                    type="monotone"
                    stroke="var(--color-temperature)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};


export default function MapPage() {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isLoadingInitialLocation, setIsLoadingInitialLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression | undefined>(undefined);
  const defaultZoom = 13; // Adjusted for city view
  const caliCoords: LatLngExpression = [3.4516, -76.5320]; // Cali, Colombia

  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);

  // Effect for geolocation handling
  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.watchPosition( // Use watchPosition for real-time updates
        (position) => {
          if (!isMounted) return;
          const { latitude, longitude } = position.coords;
          const newPos: LatLngExpression = [latitude, longitude];
          setCurrentPosition(newPos);
          if (isLoadingInitialLocation) { // Only set mapCenter on initial load or if not set
            setMapCenter(newPos);
            setIsLoadingInitialLocation(false);
          }
          setError(null);
        },
        (err) => {
          if (!isMounted) return;
          console.error("Error getting location:", err);
          setError(`Error getting location: ${err.message}. Displaying default (Cali).`);
          if (isLoadingInitialLocation) { // If initial load fails, center on Cali
             setCurrentPosition(null); // User location couldn't be fetched
             setMapCenter(caliCoords);
             setIsLoadingInitialLocation(false);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // maximumAge 0 for fresh data
      );
    } else {
      if (!isMounted) return;
      setError("Geolocation is not supported. Displaying default (Cali).");
      setMapCenter(caliCoords);
      setIsLoadingInitialLocation(false);
    }
    return () => { isMounted = false; /* TODO: Clear watchPosition if navigator.geolocation.clearWatch exists */ };
  }, [isLoadingInitialLocation]); // Rerun only on initial load status change

  const handleRecenterMapToUserLocation = () => {
    if (currentPosition) {
      setMapCenter(currentPosition);
    } else if (mapCenter !== caliCoords) {
      setMapCenter(caliCoords); // If no user position, center on Cali
    }
  };
  
  const mapComponent = useMemo(() => {
    if (!mapCenter) { // Check if mapCenter is defined
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16)-var(--header-height,0px))] bg-muted">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Initializing map...</p>
        </div>
      );
    }
    return (
      <LeafletMap
        center={mapCenter}
        zoom={defaultZoom}
        userPosition={currentPosition}
        riskZones={riskZonesCali}
        showRiskZones={showRiskZones}
      />
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapCenter, currentPosition, defaultZoom, showRiskZones]);


  if (isLoadingInitialLocation && !mapCenter) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16)-var(--header-height,0px))] bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Detecting your location...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-theme(spacing.16)-var(--header-height,4rem))] flex flex-col">
      {error && (
        <Alert variant="destructive" className="absolute top-2 left-1/2 -translate-x-1/2 z-[1001] w-auto max-w-md shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1" id="leaflet-map-wrapper">
        {mapComponent}
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        <Button
          onClick={() => setShowRiskZones(!showRiskZones)}
          variant="secondary"
          size="sm"
          className="shadow-md bg-background hover:bg-muted"
        >
          {showRiskZones ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showRiskZones ? 'Hide Risks' : 'Show Risks'}
        </Button>
        <Button
          onClick={() => setShowWeatherPanel(!showWeatherPanel)}
          variant="secondary"
          size="sm"
          className="shadow-md bg-background hover:bg-muted"
        >
          <Cloud className="h-4 w-4 mr-2" />
          {showWeatherPanel ? 'Hide Weather' : 'Show Weather'}
        </Button>
      </div>
      
      {/* Risk Zone Legend */}
      {showRiskZones && (
        <Card className="absolute bottom-28 md:bottom-4 left-4 z-[1000] p-2 shadow-md bg-background/90 text-xs">
          <CardHeader className="p-1 pb-0.5">
            <CardTitle className="text-xs font-medium">Risk Legend</CardTitle>
          </CardHeader>
          <CardContent className="p-1 space-y-0.5">
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 opacity-70 mr-1.5"></div> High Risk</div>
            <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-yellow-500 opacity-70 mr-1.5"></div> Medium Risk</div>
          </CardContent>
        </Card>
      )}

      {/* Weather Panel */}
      {showWeatherPanel && <WeatherPanel weather={weatherDataCali} onClose={() => setShowWeatherPanel(false)} />}

      {/* Recenter button */}
       <Button
         onClick={handleRecenterMapToUserLocation}
         variant="default"
         size="icon"
         className="absolute bottom-20 right-4 z-[1000] h-12 w-12 rounded-full shadow-lg md:bottom-6 md:right-6"
         aria-label="Recenter map"
       >
         <LocateFixed className="h-5 w-5" />
       </Button>
    </div>
  );
}
