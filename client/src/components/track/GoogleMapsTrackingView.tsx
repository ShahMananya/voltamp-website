import React, { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Truck,
  Satellite,
  Navigation,
  Compass,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface GoogleMapsTrackingViewProps {
  origin?: string;
  destination?: string;
  currentLocation?: string;
  lastCheckpoint?: string;
  truckSpeed?: string;
  orderNumber?: string;
  vehicleNumber?: string;
  className?: string;
}

type MapMode = "route" | "truck" | "satellite";

export default function GoogleMapsTrackingView({
  origin = "Sanand GIDC, Ahmedabad, Gujarat, India",
  destination = "Mumbai, Maharashtra, India",
  currentLocation = "Bharuch Narmada Bridge, NH 48, Gujarat, India",
  lastCheckpoint = "Ankleshwar Toll Plaza",
  truckSpeed = "62 kmph",
  orderNumber = "ORD-IND-5412",
  vehicleNumber = "GJ-01-BX-4921",
  className = "",
}: GoogleMapsTrackingViewProps) {
  const [mode, setMode] = useState<MapMode>("route");
  const [isLoading, setIsLoading] = useState(true);

  // Encode parameters for Google Maps
  const encodedOrigin = encodeURIComponent(origin);
  const encodedDest = encodeURIComponent(destination);
  const encodedCurrent = encodeURIComponent(currentLocation);

  // Construct Google Maps URLs for each mode
  // 1. Route: directions from origin depot to customer destination
  // 2. Truck: zoomed into the live truck position/checkpoint
  // 3. Satellite: satellite imagery of the highway route
  const getMapUrl = () => {
    switch (mode) {
      case "truck":
        return `https://maps.google.com/maps?q=${encodedCurrent}&t=m&z=13&output=embed`;
      case "satellite":
        return `https://maps.google.com/maps?saddr=${encodedOrigin}&daddr=${encodedDest}&t=k&z=8&output=embed`;
      case "route":
      default:
        return `https://maps.google.com/maps?saddr=${encodedOrigin}&daddr=${encodedDest}&t=m&z=8&output=embed`;
    }
  };

  // Direct link to open Google Maps app / web for real turn-by-turn navigation
  const externalGoogleMapsUrl =
    mode === "truck"
      ? `https://www.google.com/maps/search/?api=1&query=${encodedCurrent}`
      : `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDest}&travelmode=driving`;

  return (
    <div
      className={`relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner flex flex-col ${className}`}
    >
      {/* 1. TOP FLOATING CONTROL BAR (Mode Selector & Actions) */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-700/80 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setMode("route");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "route"
                ? "bg-[#1d73b7] text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Navigation className="size-3.5" />
            <span>Highway Route</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setMode("truck");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "truck"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Truck className="size-3.5" />
            <span>Live Truck GPS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setMode("satellite");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === "satellite"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Satellite className="size-3.5" />
            <span>Satellite</span>
          </button>
        </div>

        {/* Right: Open in Google Maps */}
        <a
          href={externalGoogleMapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1d73b7] dark:hover:text-blue-400 pointer-events-auto transition-colors"
          title="Open directly in Google Maps"
        >
          <ExternalLink className="size-3.5" />
          <span className="hidden sm:inline">Open in Google Maps</span>
        </a>
      </div>

      {/* 2. LOADING STATE */}
      {isLoading && (
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="size-8 rounded-full border-2 border-[#1d73b7] border-t-transparent animate-spin mb-2" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
            Loading Google Maps route...
          </span>
        </div>
      )}

      {/* 3. GOOGLE MAPS IFRAME */}
      <iframe
        key={mode}
        title="Google Maps Consignment Transit"
        src={getMapUrl()}
        width="100%"
        height="100%"
        className="flex-1 w-full h-full border-0 min-h-[420px]"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setIsLoading(false)}
      />

      {/* 4. BOTTOM FLOATING TELEMETRY STRIP */}
      <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-700/80 pointer-events-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {mode === "truck"
                ? `Truck Position: ${currentLocation}`
                : `Active Transit Corridor: ${origin.split(",")[0]} ➔ ${destination.split(",")[0]}`}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>Vehicle: <strong className="text-slate-800 dark:text-slate-200">{vehicleNumber}</strong></span>
            <span>Speed: <strong className="text-slate-800 dark:text-slate-200">{truckSpeed}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
