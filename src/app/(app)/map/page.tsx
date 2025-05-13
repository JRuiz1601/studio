'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamically import the LeafletMap component with SSR turned off
const LeafletMap = dynamic(() => import('@/components/map/leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  ),
});

export default function MapPage() {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isLoadingInitialLocation, setIsLoadingInitialLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression | null>(null);

  // Default center (Cali, Colombia)
  const defaultInitialCenter: LatLngExpression = [3.4516, -76.5320];
  const defaultZoom = 15;

  // Use useEffect para configurar la geolocalización una sola vez
  useEffect(() => {
    let isMounted = true;
    
    // Intentar obtener la ubicación del usuario
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            const { latitude, longitude } = position.coords;
            const newPos: LatLngExpression = [latitude, longitude];
            setCurrentPosition(newPos);
            setMapCenter(newPos);
            setIsLoadingInitialLocation(false);
            setError(null);
          }
        },
        (err) => {
          if (isMounted) {
            console.error("Error getting location:", err);
            setError(`Error getting location: ${err.message}. Displaying default location.`);
            setCurrentPosition(defaultInitialCenter);
            setMapCenter(defaultInitialCenter);
            setIsLoadingInitialLocation(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      if (isMounted) {
        setError("Geolocation is not supported by this browser. Displaying default location.");
        setCurrentPosition(defaultInitialCenter);
        setMapCenter(defaultInitialCenter);
        setIsLoadingInitialLocation(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Memoizamos el mapa para evitar renderizados innecesarios
  const mapComponent = useMemo(() => {
    if (!mapCenter) return null;
    
    return (
      <LeafletMap
        center={mapCenter}
        zoom={defaultZoom}
        userPosition={currentPosition}
      />
    );
  }, [mapCenter, currentPosition, defaultZoom]);

  const handleRecenterMapToUserLocation = () => {
    if (currentPosition) {
      setMapCenter(currentPosition);
    }
  };

  // Show loader until initial map center is determined
  if (isLoadingInitialLocation || !mapCenter) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Detecting your location or loading map...</p>
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

      {mapComponent}

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
    </div>
  );
}