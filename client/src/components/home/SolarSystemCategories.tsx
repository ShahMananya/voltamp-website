import React, { useState, useEffect, useRef } from "react";
import {
  Sun,
  Globe,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Layers,
  Radio,
  Eye,
  Smartphone,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/categories";
import { Category3DHologram } from "./Category3DHologram";

interface SolarSystemCategoriesProps {
  onNavigate: (slug: string) => void;
  onOpenARModal: (cat: any) => void;
  onOpenShowroomLab?: (catId: string) => void;
}

interface PlanetConfig {
  id: string;
  planetName: string;
  categoryName: string;
  slug: string;
  categoryRef: any;
  color: string;
  gradient: string;
  glowColor: string;
  ring?: boolean; // Saturn ring
  orbitalRadius: number; // relative placement on orbit arc
  size: number; // planet px diameter on desktop
  angleOffset: number; // position on arc
  voltageSpec: string;
  role: string;
  fact: string;
}

export function SolarSystemCategories({
  onNavigate,
  onOpenARModal,
  onOpenShowroomLab,
}: SolarSystemCategoriesProps) {
  // Find category definitions from data
  const cablesCat = CATEGORIES.find((c) => c.slug === "wire-cables") || CATEGORIES[0];
  const switchgearCat = CATEGORIES.find((c) => c.slug === "switch-gears") || CATEGORIES[1];
  const lugsCat = CATEGORIES.find((c) => c.slug === "lugs") || CATEGORIES[2];
  const conduitCat = CATEGORIES.find((c) => c.slug === "conduit") || CATEGORIES[3];
  const glandsCat = CATEGORIES.find((c) => c.slug === "glands") || CATEGORIES[4];
  const wiringCat = CATEGORIES.find((c) => c.slug === "wiring-device") || CATEGORIES[5];
  const earthingCat = CATEGORIES.find((c) => c.slug === "earthing-material") || CATEGORIES[6];
  const solarCat = CATEGORIES.find((c) => c.slug === "solar") || CATEGORIES[7];

  // Map to the Solar System Planetary Orrery
  const planets: PlanetConfig[] = [
    {
      id: "conduit",
      planetName: "Mercury",
      categoryName: conduitCat.name,
      slug: conduitCat.slug,
      categoryRef: conduitCat,
      color: "#94a3b8",
      gradient: "from-slate-400 via-zinc-400 to-slate-600",
      glowColor: "rgba(148, 163, 184, 0.4)",
      orbitalRadius: 18,
      size: 32,
      angleOffset: -40,
      voltageSpec: "Mechanical Barrier / IP68",
      role: "Innermost Shield: Rigid & Corrugated Electrical Conduits",
      fact: "Withstands extreme thermal fluctuation and corrosive soil conditions.",
    },
    {
      id: "glands",
      planetName: "Venus",
      categoryName: glandsCat.name,
      slug: glandsCat.slug,
      categoryRef: glandsCat,
      color: "#ca8a04",
      gradient: "from-amber-300 via-yellow-500 to-amber-700",
      glowColor: "rgba(202, 138, 4, 0.45)",
      orbitalRadius: 28,
      size: 40,
      angleOffset: -24,
      voltageSpec: "Zone 1 Ex-d Flameproof",
      role: "High-Pressure Seal: Brass Double Compression Cable Glands",
      fact: "Certified hermetic gas and vapor containment for hazardous locations.",
    },
    {
      id: "cables",
      planetName: "Earth",
      categoryName: cablesCat.name,
      slug: cablesCat.slug,
      categoryRef: cablesCat,
      color: "#0284c7",
      gradient: "from-sky-400 via-blue-500 to-emerald-600",
      glowColor: "rgba(2, 132, 199, 0.55)",
      orbitalRadius: 40,
      size: 54, // The hero planet!
      angleOffset: -8,
      voltageSpec: "1.1kV - 33kV HT XLPE",
      role: "Core Lifeblood: LT/HT Armoured, Flexible FRLS & Submersible Cables",
      fact: "Carries 99.97% pure OFHC electrolytic copper power transmission grid.",
    },
    {
      id: "switchgear",
      planetName: "Mars",
      categoryName: switchgearCat.name,
      slug: switchgearCat.slug,
      categoryRef: switchgearCat,
      color: "#dc2626",
      gradient: "from-red-400 via-rose-600 to-amber-700",
      glowColor: "rgba(220, 38, 38, 0.5)",
      orbitalRadius: 52,
      size: 42,
      angleOffset: 6,
      voltageSpec: "415V AC / 10kA Breaking",
      role: "Power Guardian: MCBs, MCCBs, Contactors & Distribution Panels",
      fact: "Instantaneous 3ms magnetic arc-quench protection for industrial motors.",
    },
    {
      id: "lugs",
      planetName: "Jupiter",
      categoryName: lugsCat.name,
      slug: lugsCat.slug,
      categoryRef: lugsCat,
      color: "#ea580c",
      gradient: "from-amber-200 via-orange-500 to-yellow-700",
      glowColor: "rgba(234, 88, 12, 0.5)",
      orbitalRadius: 66,
      size: 64, // Largest planet!
      angleOffset: 18,
      voltageSpec: "High-Ampere Crimp",
      role: "Giant Connections: Pure ETP Copper Heavy-Duty Lugs & Terminals",
      fact: "Mirror-smooth electro-tin plating eliminates galvanic busbar corrosion.",
    },
    {
      id: "wiring",
      planetName: "Saturn",
      categoryName: wiringCat.name,
      slug: wiringCat.slug,
      categoryRef: wiringCat,
      color: "#6366f1",
      gradient: "from-indigo-300 via-purple-500 to-indigo-800",
      glowColor: "rgba(99, 102, 241, 0.5)",
      ring: true,
      orbitalRadius: 78,
      size: 50,
      angleOffset: 30,
      voltageSpec: "250V AC / 16A Modular",
      role: "Ringed Aesthetics: Luxury Architectural Modular Switches & Sockets",
      fact: "Child-proof safety shutters with glowing neon rocker indicators.",
    },
    {
      id: "earthing",
      planetName: "Uranus",
      categoryName: earthingCat.name,
      slug: earthingCat.slug,
      categoryRef: earthingCat,
      color: "#059669",
      gradient: "from-emerald-300 via-teal-500 to-cyan-700",
      glowColor: "rgba(5, 150, 105, 0.45)",
      orbitalRadius: 89,
      size: 42,
      angleOffset: 42,
      voltageSpec: "Fault Current >25kA",
      role: "Sub-Terranean Grounding: Pure Copper Bonded Earth Electrodes",
      fact: "Molecular 254-micron copper bond delivers 30+ year maintenance-free life.",
    },
    {
      id: "solar",
      planetName: "Neptune",
      categoryName: solarCat.name,
      slug: solarCat.slug,
      categoryRef: solarCat,
      color: "#2563eb",
      gradient: "from-blue-300 via-sky-500 to-indigo-800",
      glowColor: "rgba(37, 99, 235, 0.45)",
      orbitalRadius: 98,
      size: 44,
      angleOffset: 54,
      voltageSpec: "1500V DC Photovoltaic",
      role: "Clean Energy Haven: TOPCon Bifacial Solar Panels & Inverters",
      fact: "Captures bi-directional photon radiation with 22.8% cell efficiency.",
    },
  ];

  // Active selected planet state (default to Earth - Wire Cables!)
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>("cables");
  const [isLiveCurrentActive, setIsLiveCurrentActive] = useState(true);
  const [is3DPreviewActive, setIs3DPreviewActive] = useState(true);

  const activePlanet =
    planets.find((p) => p.id === selectedPlanetId) || planets[2]; // Earth by default

  const nextPlanet = () => {
    const idx = planets.findIndex((p) => p.id === selectedPlanetId);
    const nextIdx = (idx + 1) % planets.length;
    setSelectedPlanetId(planets[nextIdx].id);
  };

  const prevPlanet = () => {
    const idx = planets.findIndex((p) => p.id === selectedPlanetId);
    const prevIdx = (idx - 1 + planets.length) % planets.length;
    setSelectedPlanetId(planets[prevIdx].id);
  };

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-white via-slate-50/70 to-white dark:from-[#091524] dark:via-[#071421] dark:to-[#091524] border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden p-4 sm:p-7 select-none">
      {/* Light Astrodynamics Blueprint Background Grid */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Subtle Cosmic Nebula Soft Ambient Glow (Light mode friendly) */}
      <div className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-sky-400/10 dark:bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Top Section Header & Controller */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[11px] font-extrabold uppercase tracking-wider border border-amber-500/25">
              <Sun className="size-3.5 text-amber-500 animate-spin" />
              VOLAMP ELECTRICAL SOLAR SYSTEM · ORBITAL ARCHITECTURE
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              Sun (Volamp) → 8 Planetary Categories
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Explore the Volamp Power Planetary System</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            The central <strong>Volamp Sun</strong> powers the entire industrial network.
            Each category revolves as a distinct planet connected by live electrical current beams.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Current Toggle */}
          <button
            type="button"
            onClick={() => setIsLiveCurrentActive(!isLiveCurrentActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              isLiveCurrentActive
                ? "bg-amber-500/15 border-amber-400 text-amber-600 dark:text-amber-400 shadow-sm"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            <Zap className={`size-3.5 ${isLiveCurrentActive ? "animate-pulse" : ""}`} />
            <span>{isLiveCurrentActive ? "Electric Current: LIVE" : "Current: PAUSED"}</span>
          </button>

          {/* 3D Holo Toggle */}
          <button
            type="button"
            onClick={() => setIs3DPreviewActive(!is3DPreviewActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              is3DPreviewActive
                ? "bg-sky-500/15 border-sky-400 text-sky-600 dark:text-sky-400 shadow-sm"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            }`}
          >
            <Sparkles className="size-3.5 text-sky-500" />
            <span>{is3DPreviewActive ? "3D Holo: ACTIVE" : "Photo View"}</span>
          </button>

          {/* Prev / Next Planet Nav */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevPlanet}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400 cursor-pointer transition-colors"
              title="Previous Planet"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={nextPlanet}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400 cursor-pointer transition-colors"
              title="Next Planet"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Solar System Interactive Stage */}
      <div className="relative z-10 w-full min-h-[380px] sm:min-h-[460px] rounded-2xl bg-gradient-to-r from-amber-500/5 via-slate-100/60 to-sky-500/5 dark:from-amber-950/20 dark:via-slate-900/60 dark:to-sky-950/20 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between p-4 sm:p-6 mb-6">
        {/* Orbital Arc Canvas Overlay (Draws elliptical tracks like Image 3) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Electrical Current Glowing Laser Gradient */}
            <linearGradient id="currentGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
              <stop offset="100%" stopColor={activePlanet.color} stopOpacity="0.9" />
            </linearGradient>

            {/* Pulsing Dash Filter */}
            <filter id="neonPulse">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Elliptical Orbital Path Curves radiating from the Sun on the left */}
          {planets.map((p, idx) => {
            const isSelected = p.id === activePlanet.id;
            const cy = 200 + idx * 8;
            const rx = 140 + idx * 75;
            const ry = 80 + idx * 30;

            return (
              <ellipse
                key={p.id}
                cx="0"
                cy="50%"
                rx={`${20 + idx * 11}%`}
                ry={`${35 + idx * 8}%`}
                fill="none"
                stroke={isSelected ? p.color : "currentColor"}
                strokeWidth={isSelected ? "2" : "1"}
                strokeDasharray={isSelected ? "none" : "3,6"}
                className={`transition-colors duration-300 ${
                  isSelected
                    ? "opacity-80"
                    : "opacity-15 text-slate-400 dark:text-slate-600"
                }`}
              />
            );
          })}

          {/* Live Electrical Current Beam from Volamp Sun directly into Active Planet */}
          {isLiveCurrentActive && (
            <line
              x1="60"
              y1="50%"
              x2="72%"
              y2="42%"
              stroke="url(#currentGlow)"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              className="animate-pulse"
              filter="url(#neonPulse)"
            />
          )}
        </svg>

        {/* The Solar System Body: Sun on Left + Planets in Orbit */}
        <div className="relative w-full h-full flex items-center justify-between py-6 overflow-x-auto no-scrollbar">
          {/* 1. THE CENTRAL SUN: VOLAMP CORE (Positioned on the Left, like Image 2 & 3) */}
          <div className="relative shrink-0 flex flex-col items-center justify-center mr-4 sm:mr-8 group cursor-pointer">
            {/* Massive Sun Outer Solar Flare Glow */}
            <div className="absolute size-44 sm:size-56 rounded-full bg-gradient-to-r from-amber-400/30 via-orange-500/20 to-transparent blur-2xl animate-pulse pointer-events-none" />

            {/* Sun Corona Plasma Ball */}
            <div className="relative size-28 sm:size-36 rounded-full bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 shadow-2xl shadow-amber-500/50 flex flex-col items-center justify-center text-center p-2 border-2 border-amber-300/80 transition-transform duration-500 group-hover:scale-105">
              {/* Solar Core Rings */}
              <div className="absolute inset-1 rounded-full border border-white/40 animate-spin [animation-duration:18s]" />
              <div className="absolute inset-3 rounded-full border border-amber-200/50 animate-spin [animation-duration:12s] [animation-direction:reverse]" />

              <Sparkles className="size-5 text-amber-950 animate-bounce mb-0.5" />
              <span className="font-black text-xs sm:text-sm tracking-tight text-slate-950 font-mono leading-none">
                VOLAMP
              </span>
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-amber-900 mt-0.5">
                SUN CORE
              </span>

              {/* Pulsing Energy Badge */}
              <span className="mt-1 px-1.5 py-0.2 rounded-full bg-slate-950/20 text-[8px] font-mono font-bold text-amber-950">
                100% POWER
              </span>
            </div>

            <div className="text-center mt-2">
              <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 tracking-wider font-mono">
                CENTRAL POWER STAR
              </span>
            </div>
          </div>

          {/* 2. THE 8 CATEGORY PLANETS IN ORBITAL ORDER */}
          <div className="flex-1 flex items-center justify-around gap-3 sm:gap-6 min-w-[700px] px-2">
            {planets.map((planet, index) => {
              const isSelected = planet.id === activePlanet.id;

              return (
                <div
                  key={planet.id}
                  onClick={() => setSelectedPlanetId(planet.id)}
                  className={`relative flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${
                    isSelected ? "scale-115 z-30" : "hover:scale-110 opacity-80 hover:opacity-100 z-10"
                  }`}
                >
                  {/* Planetary Orbit Ring (For Saturn) */}
                  {planet.ring && (
                    <div
                      style={{
                        width: planet.size * 2.2,
                        height: planet.size * 0.7,
                        borderColor: planet.color,
                      }}
                      className="absolute rounded-full border-2 border-indigo-400/70 -rotate-25 pointer-events-none animate-pulse"
                    />
                  )}

                  {/* Active Planet Electric Corona */}
                  {isSelected && (
                    <div
                      style={{
                        boxShadow: `0 0 25px ${planet.glowColor}`,
                        borderColor: planet.color,
                      }}
                      className="absolute -inset-2 rounded-full border-2 animate-ping opacity-60 pointer-events-none"
                    />
                  )}

                  {/* Planet Spherical Body */}
                  <div
                    style={{
                      width: planet.size,
                      height: planet.size,
                      boxShadow: isSelected
                        ? `0 0 20px ${planet.glowColor}`
                        : "0 4px 10px rgba(0,0,0,0.15)",
                    }}
                    className={`rounded-full bg-gradient-to-tr ${planet.gradient} relative flex items-center justify-center transition-transform duration-300 overflow-hidden border border-white/30`}
                  >
                    {/* Planet Surface Texture & Shadow Shader Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/50" />

                    {/* Earth Special Glow Badge */}
                    {planet.id === "cables" && (
                      <span className="relative text-[9px] font-black text-white drop-shadow-md">
                        🌍
                      </span>
                    )}
                  </div>

                  {/* Planet & Category Labels */}
                  <div className="text-center mt-2">
                    <div className="flex items-center justify-center gap-1">
                      <span
                        className={`text-[10px] sm:text-xs font-black uppercase tracking-tight transition-colors ${
                          isSelected
                            ? "text-sky-600 dark:text-sky-400 font-extrabold"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {planet.planetName}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] block font-bold truncate max-w-[85px] transition-colors ${
                        isSelected
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {planet.categoryName}
                    </span>
                  </div>

                  {/* Active Indicator Pin */}
                  {isSelected && (
                    <span
                      style={{ backgroundColor: planet.color }}
                      className="mt-1 size-1.5 rounded-full animate-bounce"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. ACTIVE PLANET TELEMETRY & PRODUCT INSPECTOR HUD (Bottom Card Overlay) */}
        <div className="relative z-20 w-full rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-all">
          {/* Left: 3D Hologram Miniature or Product Photo */}
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative size-24 sm:size-28 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {is3DPreviewActive ? (
                <div className="absolute inset-0">
                  <Category3DHologram
                    categoryName={activePlanet.categoryName}
                    isHovered={true}
                    accentColor={activePlanet.color}
                  />
                </div>
              ) : (
                <img
                  src={activePlanet.categoryRef.image || "/products/cables.jpg"}
                  alt={activePlanet.categoryName}
                  className="max-h-20 max-w-[85%] object-contain filter drop-shadow-md"
                />
              )}

              {/* Hologram Badge */}
              <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded-md bg-black/70 text-white font-mono text-[9px] font-bold">
                {is3DPreviewActive ? "3D TWIN" : "PHOTO"}
              </div>
            </div>

            {/* Planet Info & Technical Role */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  style={{
                    backgroundColor: `${activePlanet.color}15`,
                    borderColor: `${activePlanet.color}40`,
                    color: activePlanet.color,
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border font-mono"
                >
                  PLANET: {activePlanet.planetName.toUpperCase()}
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {activePlanet.categoryRef.productCount}+ Certified Items
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {activePlanet.categoryName}
              </h3>
              <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold mb-1">
                {activePlanet.role}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                {activePlanet.fact}
              </p>
            </div>
          </div>

          {/* Right: Subcategory Pills & Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-3 w-full lg:w-auto">
            {/* Featured Subcategories Tags */}
            <div className="flex flex-wrap items-center gap-1.5">
              {activePlanet.categoryRef.featuredPills.slice(0, 3).map((pill: string) => (
                <span
                  key={pill}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Launch 3D Showroom / AR */}
              <button
                type="button"
                onClick={() => onOpenARModal(activePlanet.categoryRef)}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
                title="Launch 3D WebAR Twin"
              >
                <Smartphone className="size-3.5" />
                <span>Launch AR</span>
              </button>

              {/* Browse Catalog */}
              <Button
                onClick={() => onNavigate(activePlanet.slug)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-extrabold text-xs h-9 rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <span>Browse {activePlanet.planetName} Catalog</span>
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Planetary Orbit Bar: Quick Pill Navigator */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Planets:
        </span>
        {planets.map((planet) => {
          const isSelected = planet.id === activePlanet.id;
          return (
            <button
              key={planet.id}
              type="button"
              onClick={() => setSelectedPlanetId(planet.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm font-bold"
                  : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-400"
              }`}
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: planet.color }}
              />
              <span>
                {planet.planetName} · {planet.categoryName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
