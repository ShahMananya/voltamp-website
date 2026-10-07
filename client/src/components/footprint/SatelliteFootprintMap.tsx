import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Compass,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  CinematicWaypoint,
  FootprintProject,
  FootprintState,
} from "./GlobeProjectsExperience";
import { OFFICIAL_STATE_COUNTS } from "./GlobeProjectsExperience";
import { KHADIA_HQ_PROJECT } from "@/data/footprintData";

declare const L: any;

export interface SatelliteMapHandle {
  flyToLocation: (lat: number, lng: number, zoom?: number, durationSec?: number) => void;
  resetToIndia: () => void;
  getMap: () => any;
}

interface SatelliteFootprintMapProps {
  activeWaypoint: CinematicWaypoint;
  states: FootprintState[];
  allProjects: FootprintProject[];
  isUserInteracting: boolean;
  onUserInteractionStart: () => void;
  onSelectProject: (proj: FootprintProject) => void;
  onSelectState: (code: string) => void;
  onMapReady?: () => void;
}

// Category visual icon mappings
const CATEGORY_ICONS: Record<string, string> = {
  "Industrial Substation & Power Grid": "⚡",
  "National Monuments & Iconic Tourism": "🏛️",
  "Smart Utility Tunnels & Financial Hubs": "🚇",
  "Iconic Architectural Bridges & Riverfronts": "🌉",
  "Atomic Research & Strategic Defence": "⚛️",
  "Automotive Mega-Factories & Robotics": "🏭",
  "Utility Solar PV Parks & Clean Energy": "☀️",
  "Aviation & Regional Airports": "✈️",
};

export const SatelliteFootprintMap = forwardRef<
  SatelliteMapHandle,
  SatelliteFootprintMapProps
>(function SatelliteFootprintMap(
  {
    activeWaypoint,
    states,
    allProjects,
    isUserInteracting,
    onUserInteractionStart,
    onSelectProject,
    onSelectState,
    onMapReady,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const arcsLayerRef = useRef<any>(null);
  const esriTileLayerRef = useRef<any>(null);
  const cartoLabelsRef = useRef<any>(null);
  const darkMatterLayerRef = useRef<any>(null);

  const [mapStyle, setMapStyle] = useState<"satellite" | "dark">("satellite");
  const [currentZoom, setCurrentZoom] = useState<number>(5);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    flyToLocation: (lat: number, lng: number, zoom = 15, durationSec = 2.2) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], zoom, {
          duration: durationSec,
          easeLinearity: 0.25,
        });
      }
    },
    resetToIndia: () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([22.5, 79.0], 5, {
          duration: 2.0,
          easeLinearity: 0.25,
        });
      }
    },
    getMap: () => mapInstanceRef.current,
  }));

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof window === "undefined" || !(window as any).L) {
      console.warn("Leaflet library (window.L) is not yet loaded");
      return;
    }

    const L = (window as any).L;

    // Destroy any existing map on the element
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        // ignore
      }
      mapInstanceRef.current = null;
    }

    // Create Leaflet map centered on India
    const map = L.map(containerRef.current, {
      center: [22.8, 78.5],
      zoom: 5,
      minZoom: 3,
      maxZoom: 19,
      zoomControl: false, // Custom controls used
      attributionControl: false,
      touchZoom: true,
      dragging: true,
      tap: true,
      doubleClickZoom: true,
      bounceAtZoomLimits: true,
    });

    mapInstanceRef.current = map;

    // 1. High-Resolution Esri World Imagery (Real-world satellite photography down to facility level, 100% free, no API key)
    const esriSatellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Esri World Imagery",
      }
    );
    esriTileLayerRef.current = esriSatellite;

    // 2. Esri World Boundaries & Places Labels Overlay (Clean typography, NO watermark, NO API key required)
    const esriLabels = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        opacity: 0.95,
      }
    );
    cartoLabelsRef.current = esriLabels;

    // 3. Alternative Clean Dark Canvas (Esri Dark Gray Base, NO API key required)
    const esriDark = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
      }
    );
    darkMatterLayerRef.current = esriDark;

    // Default to Satellite + Labels
    esriSatellite.addTo(map);
    esriLabels.addTo(map);

    // Feature Layers
    markersLayerRef.current = L.layerGroup().addTo(map);
    arcsLayerRef.current = L.layerGroup().addTo(map);

    // Event listeners
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    map.on("mousedown touchstart dragstart", () => {
      onUserInteractionStart();
    });

    setIsReady(true);
    if (onMapReady) onMapReady();

    // Resize observer to ensure full bleed
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle basemap style
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapStyle === "satellite") {
      if (darkMatterLayerRef.current && map.hasLayer(darkMatterLayerRef.current)) {
        map.removeLayer(darkMatterLayerRef.current);
      }
      if (esriTileLayerRef.current && !map.hasLayer(esriTileLayerRef.current)) {
        esriTileLayerRef.current.addTo(map);
      }
      if (cartoLabelsRef.current && !map.hasLayer(cartoLabelsRef.current)) {
        cartoLabelsRef.current.addTo(map);
      }
    } else {
      if (esriTileLayerRef.current && map.hasLayer(esriTileLayerRef.current)) {
        map.removeLayer(esriTileLayerRef.current);
      }
      if (cartoLabelsRef.current && !map.hasLayer(cartoLabelsRef.current)) {
        cartoLabelsRef.current.addTo(map);
      }
      if (darkMatterLayerRef.current && !map.hasLayer(darkMatterLayerRef.current)) {
        darkMatterLayerRef.current.addTo(map);
      }
    }
  }, [mapStyle]);

  // Render Supply Corridor Arcs radiating from Ahmedabad HQ
  useEffect(() => {
    const map = mapInstanceRef.current;
    const arcsLayer = arcsLayerRef.current;
    if (!map || !arcsLayer || typeof window === "undefined" || !(window as any).L) return;

    const L = (window as any).L;
    arcsLayer.clearLayers();

    const hqLat = 23.0205;
    const hqLng = 72.5898;

    // Draw glowing pulsing Khadia Old City Corporate HQ beacon marker
    const hqIcon = L.divIcon({
      className: "hq-beacon-pin cursor-pointer",
      html: `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="absolute w-12 h-12 rounded-full bg-amber-500/30 animate-ping pointer-events-none"></div>
          <div class="absolute w-7 h-7 rounded-full bg-amber-500/50 animate-pulse pointer-events-none"></div>
          <div class="relative w-5 h-5 rounded-full bg-amber-400 border-2 border-white shadow-xl flex items-center justify-center text-[10px] font-black text-slate-950 transition-transform group-hover:scale-125">
            ★
          </div>
          <div class="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-amber-300 font-bold text-[10px] px-2.5 py-1 rounded-md border border-amber-400 shadow-2xl backdrop-blur-md flex items-center gap-1.5 transition-all group-hover:scale-105 pointer-events-none">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>VOLAMP Corporate HQ (Old City Khadia)</span>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    const hqMarker = L.marker([hqLat, hqLng], { icon: hqIcon, zIndexOffset: 3000 });
    hqMarker.on("click", () => {
      onUserInteractionStart();
      onSelectProject(KHADIA_HQ_PROJECT);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([hqLat, hqLng], 17, { duration: 1.8 });
      }
    });
    hqMarker.addTo(arcsLayer);

    // Draw supply lines to major states/hubs
    const keyTargets = [
      { lat: 19.076, lng: 72.8777, label: "Mumbai / BARC" },
      { lat: 28.6139, lng: 77.209, label: "Delhi NCR" },
      { lat: 12.9716, lng: 77.5946, label: "Bengaluru Tech Hub" },
      { lat: 26.9124, lng: 75.7873, label: "Rajasthan Solar Corridors" },
      { lat: 21.2514, lng: 81.6296, label: "Bhilai Steel Corridor" },
      { lat: 13.0827, lng: 80.2707, label: "Chennai Industrial Grid" },
      { lat: 26.1445, lng: 91.7362, label: "Guwahati Northeast Hub" },
      { lat: 22.5726, lng: 88.3639, label: "Kolkata Port Logistics" },
    ];

    keyTargets.forEach((target) => {
      // Create a gentle curved arc via mid-point offset
      const midLat = (hqLat + target.lat) / 2 + 0.8;
      const midLng = (hqLng + target.lng) / 2;

      const curvePoints = [
        [hqLat, hqLng],
        [midLat, midLng],
        [target.lat, target.lng],
      ];

      L.polyline(curvePoints, {
        color: "#f59e0b",
        weight: 1.5,
        opacity: 0.6,
        dashArray: "4, 8",
        lineCap: "round",
      }).addTo(arcsLayer);
    });
  }, [isReady]);

  // Render High-Resolution Project Landmark Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || typeof window === "undefined" || !(window as any).L) return;

    const L = (window as any).L;
    markersLayer.clearLayers();

    allProjects.forEach((proj) => {
      const pLat = Number(proj.lat);
      const pLng = Number(proj.lng);
      if (isNaN(pLat) || isNaN(pLng)) return;

      const isActive = activeWaypoint.project?.id === proj.id;
      const iconEmoji = CATEGORY_ICONS[proj.category] || "⚡";

      const htmlContent = `
        <div class="relative group cursor-pointer transition-transform duration-300 ${
          isActive ? "scale-125 z-50" : "hover:scale-115"
        }">
          <!-- Glowing Radar Ring -->
          <div class="absolute -inset-3 rounded-full ${
            isActive
              ? "bg-amber-400/30 animate-ping"
              : "bg-sky-400/20 group-hover:bg-amber-400/30 animate-pulse"
          }"></div>
          
          <!-- Concentric Outer Halo -->
          <div class="absolute -inset-1.5 rounded-full ${
            isActive
              ? "border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.9)]"
              : "border border-sky-400/50 group-hover:border-amber-400"
          }"></div>

          <!-- Central Core Pin -->
          <div class="relative size-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xl transition-all ${
            isActive
              ? "bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 text-slate-950 ring-2 ring-white ring-offset-2 ring-offset-slate-950"
              : "bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-300 border border-amber-400/60 group-hover:border-amber-400 group-hover:text-amber-200"
          }">
            <span class="text-[12px] leading-none">${iconEmoji}</span>
          </div>

          <!-- Bottom Anchor Pointer -->
          <div class="w-1.5 h-1.5 bg-amber-400 rotate-45 mx-auto -mt-1 shadow-sm ${
            isActive ? "bg-amber-300" : "bg-sky-400"
          }"></div>

          <!-- Active Label Banner (Always Visible on Active) -->
          ${
            isActive
              ? `
            <div class="absolute bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-white px-2.5 py-1 rounded-md border border-amber-400 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md z-50 pointer-events-none">
              <div class="flex items-center gap-1.5">
                <span class="size-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span class="text-[11px] font-black tracking-wide text-amber-300">${proj.name}</span>
              </div>
              <div class="text-[9px] text-slate-400 font-mono mt-0.5">
                ${proj.city} · ${proj.year} · Verified Site
              </div>
            </div>
          `
              : `
            <!-- Hover Tooltip -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-slate-200 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-700 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40">
              ${proj.name}
            </div>
          `
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-project-pin pin-${proj.id}`,
        html: htmlContent,
        iconSize: [28, 32],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([pLat, pLng], {
        icon: customIcon,
        zIndexOffset: isActive ? 1000 : 100,
      });

      marker.on("click", (e: any) => {
        L.DomEvent.stopPropagation(e);
        onSelectProject(proj);
      });

      marker.addTo(markersLayer);
    });
  }, [allProjects, activeWaypoint, isReady]);

  // Smooth Cinematic Flight Navigation whenever activeWaypoint changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeWaypoint) return;

    if (activeWaypoint.project) {
      const pLat = Number(activeWaypoint.project.lat);
      const pLng = Number(activeWaypoint.project.lng);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        // Deep facility close-up zoom (level 15 shows actual factories, roads, solar arrays, buildings)
        map.flyTo([pLat, pLng], 15, {
          duration: 2.2,
          easeLinearity: 0.25,
        });
      }
    } else if (activeWaypoint.type === "city" && activeWaypoint.coords) {
      map.flyTo([activeWaypoint.coords.lat, activeWaypoint.coords.lng], 11, {
        duration: 2.0,
        easeLinearity: 0.25,
      });
    } else if (activeWaypoint.type === "state" && activeWaypoint.coords) {
      map.flyTo([activeWaypoint.coords.lat, activeWaypoint.coords.lng], 7, {
        duration: 2.0,
        easeLinearity: 0.25,
      });
    } else if (
      activeWaypoint.type === "india" ||
      activeWaypoint.type === "asia" ||
      activeWaypoint.type === "world"
    ) {
      map.flyTo([22.5, 79.0], 5, {
        duration: 2.2,
        easeLinearity: 0.25,
      });
    }
  }, [activeWaypoint]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-950 overflow-hidden">
      {/* Real-world Leaflet Satellite Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Floating Map HUD & Quick GIS Controls (Top-Right of Map) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {/* Style Selector Pill */}
        <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-2xl">
          <button
            onClick={() => setMapStyle("satellite")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapStyle === "satellite"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
            title="High-Resolution Real-World Esri Satellite Photography"
          >
            <Sparkles className="size-3.5" />
            <span>Satellite HD</span>
          </button>

          <button
            onClick={() => setMapStyle("dark")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mapStyle === "dark"
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 shadow-md font-black"
                : "text-slate-300 hover:text-white hover:bg-slate-800/80"
            }`}
            title="Dark Cartographic Grid View"
          >
            <Layers className="size-3.5" />
            <span>Dark Grid</span>
          </button>
        </div>

        {/* Zoom & Quick Reset Buttons */}
        <div className="flex flex-col bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-xl overflow-hidden divide-y divide-slate-800">
          <button
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
            }}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Maximize2 className="size-4" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
            }}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minimize2 className="size-4" />
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([22.5, 79.0], 5, { duration: 1.8 });
              }
            }}
            className="p-2 text-slate-300 hover:text-amber-400 hover:bg-slate-800 transition-colors"
            title="Reset to Pan-India Sovereign View"
            aria-label="Pan-India View"
          >
            <RotateCcw className="size-4" />
          </button>
        </div>
      </div>

      {/* Live Geospatial Legend & Elevation Telemetry (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 shadow-xl text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
          <span className="size-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>ESRI WORLD IMAGERY</span>
        </div>
        <span className="text-slate-600">|</span>
        <div>ZOOM: {currentZoom}x</div>
        <span className="text-slate-600">|</span>
        <div className="text-sky-300">47 VERIFIED LANDMARKS</div>
      </div>
    </div>
  );
});

export default SatelliteFootprintMap;
