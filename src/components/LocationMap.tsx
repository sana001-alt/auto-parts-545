import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface LocationMapProps {
  lat?: number;
  lng?: number;
  addressName?: string;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  lat = 28.6139,
  lng = 77.2090,
  addressName = 'New Delhi',
  interactive = false,
  onLocationSelect,
  className = 'h-64 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Inject Leaflet CSS dynamically if not present
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: interactive,
      scrollWheelZoom: interactive,
      dragging: interactive,
    });

    mapInstanceRef.current = map;

    // Tile Layer from OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Map Pin Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div class="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-bounce">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    const marker = L.marker([lat, lng], {
      icon: customIcon,
      draggable: interactive
    }).addTo(map);

    markerRef.current = marker;

    if (addressName) {
      marker.bindPopup(`<b>${addressName}</b><br/><span class="text-xs text-slate-500">Approximate seller location</span>`).openPopup();
    }

    if (interactive) {
      // Handle drag end
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(position.lat, position.lng);
        }
      });

      // Handle map click
      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, addressName, interactive]);

  return (
    <div className="relative w-full">
      <div ref={mapContainerRef} className={className} />
      {interactive && (
        <div className="absolute top-2 left-2 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium shadow border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
          📍 Click map or drag pin to set exact location
        </div>
      )}
    </div>
  );
};
