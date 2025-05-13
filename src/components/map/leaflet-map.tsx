
'use client';

import { useEffect, useRef } from 'react';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Import L for custom icon and Circle
import type { RiskZone } from '@/data/map-data'; // Import RiskZone type

// Fix for default icon issue in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userLocationIcon = L.divIcon({
  html: `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
           <circle cx="12" cy="12" r="10" fill="#007BFF" stroke="#FFFFFF" stroke-width="2"/>
           <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
         </svg>`,
  className: 'user-location-marker', // Remove default Leaflet styles for divIcon
  iconSize: [32, 32],
  iconAnchor: [16, 16], // Center of the icon
});


interface LeafletMapProps {
  center: LatLngExpression;
  zoom: number;
  userPosition: LatLngExpression | null;
  riskZones: RiskZone[];
  showRiskZones: boolean;
}

export default function LeafletMap({
  center: initialCenter, // Rename to avoid conflict with map instance's center
  zoom: initialZoom,     // Rename to avoid conflict
  userPosition,
  riskZones,
  showRiskZones,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const riskZoneLayerRef = useRef<L.FeatureGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) {
      return; // Already initialized or container not ready
    }

    const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    mapInstanceRef.current = map;

    riskZoneLayerRef.current = L.featureGroup().addTo(map);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (riskZoneLayerRef.current) {
        riskZoneLayerRef.current = null;
      }
    };
  }, [initialCenter, initialZoom]); // Rerun if initial center/zoom changes (though typically they don't post-mount)


  // Update map view (center, zoom)
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(initialCenter, initialZoom);
    }
  }, [initialCenter, initialZoom]);

  // Update user marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (userPosition) {
      userMarkerRef.current = L.marker(userPosition, { icon: userLocationIcon })
        .bindPopup('You are here.')
        .addTo(mapInstanceRef.current);
    }
  }, [userPosition]);

  // Update risk zones
  useEffect(() => {
    if (!mapInstanceRef.current || !riskZoneLayerRef.current) return;

    riskZoneLayerRef.current.clearLayers(); // Clear previous zones

    if (showRiskZones) {
      riskZones.forEach(zone => {
        const color = zone.level === 'high' ? 'red' : 'yellow';
        const circle = L.circle(zone.center, {
          color: color,
          fillColor: color,
          fillOpacity: 0.3,
          radius: zone.radius
        }).bindPopup(`<b>${zone.type}</b><br>${zone.description}`);
        if (riskZoneLayerRef.current) {
            riskZoneLayerRef.current.addLayer(circle);
        }
      });
    }
  }, [riskZones, showRiskZones]);


  return (
    <div
      ref={mapContainerRef}
      style={{
        height: '100%',
        width: '100%',
        zIndex: 0
      }}
      // Add a key to ensure React re-renders this if necessary,
      // although the useEffect logic should handle map re-initialization if needed.
      key="leaflet-map-container-wrapper"
    />
  );
}
