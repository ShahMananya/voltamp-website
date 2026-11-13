import React, { useEffect, useRef, useState } from "react";
import { ExternalLink, Layers, MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";

interface BranchLocationMapProps {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  directMapUrl: string;
  className?: string;
}

export default function BranchLocationMap({
  id,
  name,
  lat,
  lng,
  address,
  directMapUrl,
  className = "w-full h-56",
}: BranchLocationMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [isLoaded, setIsLoaded] = useState(false);
  const streetLayerRef = useRef<any>(null);
  const satelliteLayerRef = useRef<any>(null);

  useEffect(() => {
    let checkInterval: any = null;
    let isCancelled = false;

    const initMap = () => {
      if (isCancelled || !containerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      // Clean up existing map instance on this container
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }

      try {
        const map = L.map(containerRef.current, {
          center: [lat, lng],
          zoom: 15,
          minZoom: 11,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });

        // 1. Street layer - CartoDB Voyager (clean, highly legible, retina supported)
        const streetLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            subdomains: "abcd",
            maxZoom: 19,
          }
        );

        // 2. Satellite layer - Esri World Imagery (high-resolution real world satellite)
        const satelliteLayer = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            maxZoom: 19,
          }
        );

        streetLayerRef.current = streetLayer;
        satelliteLayerRef.current = satelliteLayer;

        streetLayer.addTo(map);

        // Custom pulsing marker pin
        const customIcon = L.divIcon({
          className: "custom-branch-marker",
          html: `
            <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
              <span style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(197,103,24,0.35);animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></span>
              <div style="position:relative;width:32px;height:32px;border-radius:50%;background:#4d1217;border:2px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#ffffff;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f6a93b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -36],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="font-family:system-ui,-apple-system,sans-serif;padding:6px 2px;max-width:220px;">
            <strong style="font-size:12px;color:#0f172a;display:block;margin-bottom:4px;">${name}</strong>
            <p style="font-size:11px;color:#475569;margin:0 0 8px 0;line-height:1.4;">${address}</p>
            <a href="${directMapUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:700;color:#c56718;text-decoration:none;">
              Open in Google Maps &rarr;
            </a>
          </div>
        `);

        mapRef.current = map;
        setIsLoaded(true);
      } catch (err) {
        console.warn("Leaflet init error:", err);
      }
    };

    if ((window as any).L) {
      initMap();
    } else {
      // Poll briefly for window.L from index.html defer script
      let attempts = 0;
      checkInterval = setInterval(() => {
        attempts++;
        if ((window as any).L) {
          clearInterval(checkInterval);
          initMap();
        } else if (attempts > 30) {
          clearInterval(checkInterval);
        }
      }, 150);
    }

    return () => {
      isCancelled = true;
      if (checkInterval) clearInterval(checkInterval);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapRef.current = null;
      }
    };
  }, [lat, lng, name, address, directMapUrl]);

  // Toggle layer
  const toggleMapType = () => {
    if (!mapRef.current) return;
    const nextType = mapType === "streets" ? "satellite" : "streets";
    if (nextType === "satellite") {
      if (streetLayerRef.current) mapRef.current.removeLayer(streetLayerRef.current);
      if (satelliteLayerRef.current) satelliteLayerRef.current.addTo(mapRef.current);
    } else {
      if (satelliteLayerRef.current) mapRef.current.removeLayer(satelliteLayerRef.current);
      if (streetLayerRef.current) streetLayerRef.current.addTo(mapRef.current);
    }
    setMapType(nextType);
  };

  const zoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const zoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900 ${className}`}>
      {/* Native Leaflet Map Container */}
      <div ref={containerRef} className="w-full h-full min-h-[220px]" />

      {/* Floating Controls Overlay */}
      <div className="absolute top-2.5 right-2.5 z-[400] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={toggleMapType}
          title={mapType === "streets" ? "Switch to Satellite" : "Switch to Streets"}
          className="p-1.5 rounded-lg bg-white/95 dark:bg-slate-800/95 hover:bg-white text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 transition-all"
        >
          <Layers className="size-3 text-[#c56718]" />
          <span className="capitalize">{mapType === "streets" ? "Sat" : "Map"}</span>
        </button>

        <div className="flex flex-col bg-white/95 dark:bg-slate-800/95 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            type="button"
            onClick={zoomIn}
            title="Zoom In"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 transition-colors"
          >
            <ZoomIn className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            title="Zoom Out"
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ZoomOut className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Direct Google Maps Quick Pill */}
      <a
        href={directMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2.5 left-2.5 z-[400] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/95 dark:bg-slate-800/95 hover:bg-white text-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-all hover:scale-[1.02]"
      >
        <Navigation className="size-3 text-[#c56718]" />
        <span>Navigate on Maps</span>
        <ExternalLink className="size-2.5 text-slate-400" />
      </a>
    </div>
  );
}

