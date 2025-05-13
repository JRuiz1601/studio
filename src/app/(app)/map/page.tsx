
'use client';

import { useState, useEffect } from 'react';
import type { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

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
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression | null>(null);

  // Default center (Cali, Colombia - will be overridden by user location if available)
  const defaultCenter: LatLngExpression = [3.4516, -76.5320];
  const defaultZoom = 15;

  useEffect(() => {
    let isMounted = true;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition( // Changed to getCurrentPosition for initial load
        (position) => {
          if (isMounted) {
            const { latitude, longitude } = position.coords;
            const newPos: LatLngExpression = [latitude, longitude];
            setCurrentPosition(newPos);
            setMapCenter(newPos); // Set map center once location is fetched
            setIsLoadingLocation(false);
            setError(null);
          }
        },
        (err) => {
          if (isMounted) {
            console.error("Error getting location:", err);
            setError(`Error getting location: ${err.message}. Displaying default location.`);
            setCurrentPosition(defaultCenter); // Fallback to default if error
            setMapCenter(defaultCenter);
            setIsLoadingLocation(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Allow using a cached position up to 1 minute old
        }
      );
      return () => {
        isMounted = false;
      };
    } else {
      if (isMounted) {
        setError("Geolocation is not supported by this browser. Displaying default location.");
        setCurrentPosition(defaultCenter); // Fallback to default if no geolocation
        setMapCenter(defaultCenter);
        setIsLoadingLocation(false);
      }
      return () => { isMounted = false; };
    }
  }, []);

  const handleRecenter = () => {
    if (currentPosition) {
      setMapCenter(currentPosition); // Trigger re-center in LeafletMap component
    }
  };

  if (isLoadingLocation && !mapCenter) { // Show loader only if mapCenter is not yet set (initial load)
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
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

      <LeafletMap
        center={mapCenter || defaultCenter}
        zoom={defaultZoom}
        userPosition={currentPosition} // Pass user position separately for the marker
        onRecenter={() => mapCenter && currentPosition && mapCenter[0] === currentPosition[0] && mapCenter[1] === currentPosition[1] ? null : handleRecenter()}
      />

      {currentPosition && (
        <Button
          onClick={handleRecenter}
          variant="default"
          size="icon"
          className="absolute bottom-24 right-4 z-[1000] md:bottom-10 md:right-10 h-12 w-12 rounded-full shadow-lg" // Increased z-index
          aria-label="Recenter map"
        >
          <LocateFixed className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
