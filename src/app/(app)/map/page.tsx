
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Importación dinámica del componente mapa sin SSR
const LeafletMap = dynamic(
  () => import('@/components/map/leaflet-map'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    ),
  }
);

export default function MapPage() {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isLoadingInitialLocation, setIsLoadingInitialLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression | undefined>(undefined); // Initialize as undefined
  const defaultZoom = 15;
  const defaultInitialCenter: LatLngExpression = [3.4516, -76.5320]; // Cali, Colombia

  // Efecto para manejar geolocalización
  useEffect(() => {
    let isMounted = true;
    
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          
          const { latitude, longitude } = position.coords;
          const newPos: LatLngExpression = [latitude, longitude];
          setCurrentPosition(newPos);
          setMapCenter(newPos); // Center map on user's location
          setIsLoadingInitialLocation(false);
          setError(null);
        },
        (err) => {
          if (!isMounted) return;
          
          console.error("Error getting location:", err);
          setError(`Error getting location: ${err.message}. Displaying default location.`);
          setCurrentPosition(defaultInitialCenter); // Fallback to default
          setMapCenter(defaultInitialCenter); // Center map on default
          setIsLoadingInitialLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      if (!isMounted) return;
      
      setError("Geolocation is not supported by this browser. Displaying default location.");
      setCurrentPosition(defaultInitialCenter); // Fallback to default
      setMapCenter(defaultInitialCenter); // Center map on default
      setIsLoadingInitialLocation(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array: run once on mount

  const handleRecenterMapToUserLocation = () => {
    if (currentPosition) {
      setMapCenter(currentPosition);
    }
  };

  const mapComponent = useMemo(() => {
    if (isLoadingInitialLocation || !mapCenter) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Detecting your location...</p>
        </div>
      );
    }
    return (
      <LeafletMap
        center={mapCenter}
        zoom={defaultZoom}
        userPosition={currentPosition}
      />
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingInitialLocation, mapCenter, currentPosition, defaultZoom]);


  if (isLoadingInitialLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Detecting your location...</p>
      </div>
    );
  }


  return (
    <div className="relative h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))] flex flex-col">
      {error && (
        <Alert variant="destructive" className="absolute top-2 left-2 right-2 z-20 mx-auto max-w-md shadow-lg">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1" id="leaflet-map-wrapper">
        {mapComponent}
      </div>

      {/* Recenter button removed as per request to leave only one circular button (Chat FAB)
      {currentPosition && (
        <Button
          onClick={handleRecenterMapToUserLocation}
          variant="default"
          size="icon"
          className="absolute bottom-24 right-4 z-[1000] md:bottom-10 md:right-10 h-12 w-12 rounded-full shadow-lg"
          aria-label="Recenter map"
        >
          <LocateFixed className="h-6 w-6" />
        </Button>
      )}
      */}
    </div>
  );
}
