'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression, Map as LeafletMapInstanceType } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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

// Optional: Component to handle map view changes if MapContainer props don't suffice
// function MapViewController({ center, zoom }: { center: LatLngExpression, zoom: number }) {
//   const map = useMap();
//   useEffect(() => {
//     // Check if center or zoom actually changed to avoid unnecessary setView calls
//     const currentCenter = map.getCenter();
//     const currentZoom = map.getZoom();
//     if (currentCenter.lat !== center[0] || currentCenter.lng !== center[1] || currentZoom !== zoom) {
//       map.setView(center, zoom);
//     }
//   }, [map, center, zoom]);
//   return null;
// }

interface LeafletMapProps {
  center: LatLngExpression;
  zoom: number;
  userPosition: LatLngExpression | null;
}

export default function LeafletMap({ center, zoom, userPosition }: LeafletMapProps) {
  const mapInstanceRef = useRef<LeafletMapInstanceType | null>(null);

  useEffect(() => {
    // Cleanup function for when the LeafletMap component unmounts
    return () => {
      if (mapInstanceRef.current) {
        // Ensure the map DOM element is still in the document before calling remove
        // This can help prevent errors if already removed by React HMR or other means
        if (mapInstanceRef.current.getContainer() && mapInstanceRef.current.getContainer().parentNode) {
            mapInstanceRef.current.remove();
        }
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

  return (
    <MapContainer
      center={center} // Let MapContainer handle initial center/zoom based on props
      zoom={zoom}
      style={{ height: '100%', width: '100%', flexGrow: 1, zIndex: 0 }}
      whenCreated={map => { mapInstanceRef.current = map; }} // Get the map instance
    >
      {/* <MapViewController center={center} zoom={zoom} /> */} {/* Can be re-enabled if MapContainer prop updates are not smooth */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <UserLocationMarker position={userPosition} />
    </MapContainer>
  );
}
