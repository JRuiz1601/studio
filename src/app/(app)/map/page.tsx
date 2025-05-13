
'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMap } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L for custom icon
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const UserLocationMarker = ({ position }: { position: LatLngExpression }) => {
  // const map = useMap(); // useMap hook is not needed if we don't call map.setView
  // useEffect(() => {
  //   // map.setView(position, map.getZoom()); // Removed: MapContainer's center prop handles this
  // }, [position, map]);

  // Custom blue marker icon
  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <Marker position={position} icon={blueIcon}>
      <Popup>You are here.</Popup>
    </Marker>
  );
};

export default function MapPage() {
  const [currentPosition, setCurrentPosition] = useState<LatLngExpression | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // Default center (Cali, Colombia - will be overridden by user location if available)
  const defaultCenter: LatLngExpression = [3.4516, -76.5320];
  const defaultZoom = 15;

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (isMounted) {
            const { latitude, longitude } = position.coords;
            setCurrentPosition([latitude, longitude]);
            setIsLoading(false);
            setError(null);
          }
        },
        (err) => {
          if (isMounted) {
            console.error("Error getting location:", err);
            setError(`Error getting location: ${err.message}. Displaying default location.`);
            setCurrentPosition(defaultCenter); // Fallback to default if error
            setIsLoading(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      return () => {
        isMounted = false;
        navigator.geolocation.clearWatch(watchId);
      };
    } else {
      if (isMounted) {
        setError("Geolocation is not supported by this browser. Displaying default location.");
        setCurrentPosition(defaultCenter); // Fallback to default if no geolocation
        setIsLoading(false);
      }
      return () => { isMounted = false; };
    }
  }, []);

  const handleRecenter = () => {
    if (currentPosition && mapRef.current) {
      mapRef.current.setView(currentPosition, defaultZoom);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading map and detecting your location...</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.16))] flex flex-col">
      {error && !currentPosition && ( // Show critical error if map can't load at all (e.g. API key issue for Google Maps)
        <Card className="m-4">
          <CardContent className="p-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Map Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

       {error && currentPosition && ( // Show non-critical error if defaulting due to location issue
         <Alert variant="destructive" className="absolute top-2 left-2 right-2 z-20 mx-auto max-w-md shadow-lg">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Location Error</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

      <MapContainer
        // Add a key that changes if essential parameters force a re-init (though not strictly needed here for Leaflet usually)
        // key={currentPosition ? `${currentPosition[0]}-${currentPosition[1]}`: 'default'} 
        center={currentPosition || defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', flexGrow: 1, zIndex: 0 }}
        whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {currentPosition && <UserLocationMarker position={currentPosition} />}
      </MapContainer>

      {currentPosition && (
        <Button
          onClick={handleRecenter}
          variant="default"
          size="icon"
          className="absolute bottom-24 right-4 z-10 md:bottom-10 md:right-10 h-12 w-12 rounded-full shadow-lg"
          aria-label="Recenter map"
        >
          <LocateFixed className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

