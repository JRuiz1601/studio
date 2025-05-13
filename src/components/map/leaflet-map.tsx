'use client';

import { useEffect, useRef, useState } from 'react';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Arreglar problema de íconos en Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ícono personalizado para la ubicación del usuario
const createUserIcon = () => new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

  // Inicializar el mapa una vez que el componente está montado en el cliente
  useEffect(() => {
    // Si ya hay un mapa, no lo inicialicemos de nuevo
    if (mapInstanceRef.current || !mapContainerRef.current) return;

    // Crear instancia de mapa
    const mapInstance = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      ]
    });

    // Guardar referencia
    mapInstanceRef.current = mapInstance;
    setIsMapInitialized(true);

    // Limpiar al desmontar
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, [center, zoom]);

  // Actualizar centro del mapa cuando cambian las props
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;
    
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom, isMapInitialized]);

  // Gestionar marcador de ubicación del usuario
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapInitialized) return;

    // Eliminar marcador existente
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Crear nuevo marcador si hay posición
    if (userPosition && mapInstanceRef.current) {
      userMarkerRef.current = L.marker(userPosition, {
        icon: createUserIcon()
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