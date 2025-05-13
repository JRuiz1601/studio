
'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMapInstance } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const UserLocationMarker = ({ position }: { position: LatLngExpression | null }) => {
  if (!position) return null;

  const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <Marker position={position} icon={blueIcon}>
      <Popup>You are here.</Popup>
    </Marker>
  );
};

interface LeafletMapProps {
  center: LatLngExpression;
  zoom: number;
  userPosition: LatLngExpression | null;
  onRecenter?: () => void; // Optional: If needed for more complex recenter logic
}

const RecenterAutomatically = ({ center, zoom }: { center: LatLngExpression, zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};


export default function LeafletMap({ center, zoom, userPosition, onRecenter }: LeafletMapProps) {
  const mapRef = useRef<LeafletMapInstance | null>(null);

  // Effect to handle recentering if the onRecenter prop is called or center prop changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);


  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', flexGrow: 1, zIndex: 0 }}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance;
      }}
      key={`${center.toString()}-${zoom}`} // Add a key to force re-render if center/zoom changes significantly
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UserLocationMarker position={userPosition} />
      {/* <RecenterAutomatically center={center} zoom={zoom} /> */}
    </MapContainer>
  );
}
