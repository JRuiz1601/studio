
'use client';

import { useEffect, useRef, useState } from 'react';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icon for user's current location - Changed to a more vibrant red marker
const createUserIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], // Standard size
  iconAnchor: [12, 41], // Point of the icon that corresponds to marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41], // Size of the shadow
});


interface LeafletMapProps {
  center: LatLngExpression;
  zoom: number;
  userPosition: LatLngExpression | null;
}

export default function LeafletMap({ center, zoom, userPosition }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Initialize map once component is mounted client-side
  useEffect(() => {
    // If map is already initialized, or container ref is not set, do nothing
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    // Create map instance
    const mapInstance = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      ]
    });

    // Store reference
    mapInstanceRef.current = mapInstance;
    setIsMapInitialized(true);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null; // Clear ref
        userMarkerRef.current = null; // Clear marker ref
        setIsMapInitialized(false);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Update map view when center or zoom props change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;
    
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom, isMapInitialized]);

  // Manage user location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;

    // Remove existing marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Create new marker if position is available
    if (userPosition) {
      userMarkerRef.current = L.marker(userPosition, {
        icon: createUserIcon() // Use the custom user icon
      })
        .bindPopup('You are here.')
        .addTo(mapInstanceRef.current);
    }
  }, [userPosition, isMapInitialized]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        height: '100%', 
        width: '100%', 
        zIndex: 0 
      }}
    />
  );
}
