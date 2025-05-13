
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamic import for LeafletMap component without SSR
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
  const [mapCenter, setMapCenter] = useState<LatLngExpression | undefined>(undefined);
  const defaultZoom = 15;
  const defaultInitialCenter: LatLngExpression = [3.4516, -76.5320]; // Cali, Colombia

  // Effect for geolocation handling
  useEffect(() => {
    let isMounted = true;

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;

          const { latitude, longitude } = position.coords;
          const newPos: LatLngExpression = [latitude, longitude];
          setCurrentPosition(newPos);
          setMapCenter(newPos);
          setIsLoadingInitialLocation(false);
          setError(null);
        },
        (err) => {
          if (!isMounted) return;

          console.error("Error getting location:", err);
          setError(`Error getting location: ${err.message}. Displaying default location.`);
          setCurrentPosition(defaultInitialCenter);
          setMapCenter(defaultInitialCenter);
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
      setCurrentPosition(defaultInitialCenter);
      setMapCenter(defaultInitialCenter);
      setIsLoadingInitialLocation(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRecenterMapToUserLocation = () => {
    if (currentPosition) {
      setMapCenter(currentPosition);
    }
  };

  const mapComponent = useMemo(() => {
    if (isLoadingInitialLocation || !mapCenter) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16)-var(--header-height,0px))]">
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


  if (isLoadingInitialLocation && !mapCenter) { // Ensure mapCenter is also checked
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.16)-var(--header-height,0px))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Detecting your location...</p>
      </div>
    );
  }


  return (
    <div className="relative h-[calc(100vh-theme(spacing.16)-var(--header-height,0px))] flex flex-col"> {/* Adjust height considering header */}
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

      {/* Recenter button - now it should be the only FAB on this page */}
      {currentPosition && (
        <Button
          onClick={handleRecenterMapToUserLocation}
          variant="default"
          size="icon"
          className="absolute bottom-6 right-6 z-[1000] h-14 w-14 rounded-full shadow-lg" // Adjusted bottom to standard FAB position
          aria-label="Recenter map"
        >
          <LocateFixed className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
