import React, { useState, useEffect, useRef } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Flame,
  Globe2,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { FootprintProject } from "@/data/footprintData";

export interface EngineeringHotspot {
  id: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  num: string;
  title: string;
  type: string;
  cable: string;
  spec: string;
  impact: string;
  certifications?: string[];
}

// Verified real-world engineering hotspots for national landmark projects
export const LANDMARK_HOTSPOTS: Record<number, EngineeringHotspot[]> = {
  // 1. Statue of Unity (ID 2)
  2: [
    {
      id: "sou_substation",
      x: 28,
      y: 76,
      num: "01",
      title: "66kV Monument Substation Intake",
      type: "High-Voltage Power Incomer",
      cable: "Volamp 3-Core 66kV XLPE Armoured Copper (630 sq.mm)",
      spec: "IS 7098 (Part 3) / IEC 60840 Certified",
      impact:
        "Primary intake substation stepping down grid power from Ekta Nagar to power the entire 182-meter monument complex without interruption.",
      certifications: ["IS 7098 Part 3", "CPRI Tested", "NABL Accredited"],
    },
    {
      id: "sou_elevator",
      x: 49,
      y: 45,
      num: "02",
      title: "Core Spine High-Speed Elevators",
      type: "Emergency Circuit Integrity Riser",
      cable: "Volamp Pyro-Shield Low Smoke Zero Halogen (LSZH) Armoured",
      spec: "BS 6387 Cat CWZ / IEC 60331 (950°C for 3 Hours Continuous)",
      impact:
        "Guarantees 100% emergency evacuation power to high-speed lifts carrying 30,000+ daily tourists to the 153m viewing gallery.",
      certifications: ["BS 6387 CWZ", "IEC 60332-3", "Zero Halogen"],
    },
    {
      id: "sou_crown",
      x: 50,
      y: 14,
      num: "03",
      title: "Head & Crown Architectural Lighting",
      type: "High-Altitude Facade Feeders",
      cable: "Volamp UV-Resistant High-Flex Copper Multi-Core",
      spec: "IEC 60502-1 / UV Resistant per ASTM G154 Standards",
      impact:
        "Powers high-intensity laser projection mapping, dynamic illumination, and aviation safety strobe beacons at 182m altitude.",
      certifications: ["ASTM G154 UV", "RoHS Compliant", "Weatherproof IP68"],
    },
    {
      id: "sou_ground",
      x: 68,
      y: 84,
      num: "04",
      title: "Narmada Riverbed Grounding Grid",
      type: "Lightning Dissipation & Deep Earth",
      cable: "High-Purity 99.97% Electrolytic Copper Tapes & Chemical Pits",
      spec: "IS 3043 / IEEE 80 Substation Grounding Standards",
      impact:
        "Safely dissipates lightning strikes on the statue directly into the riverbed, protecting sensitive electronic sensors and visitors.",
      certifications: ["IS 3043", "IEEE 80", "Corrosion Resistant"],
    },
  ],

  // 2. GIFT City Underground Utility Tunnel (ID 3)
  3: [
    {
      id: "gift_hv",
      x: 18,
      y: 54,
      num: "01",
      title: "High-Voltage Distribution Zone (Left Tray)",
      type: "Subterranean Smart Grid Ring",
      cable: "Volamp 33kV & 11kV Three-Core XLPE Armoured Power Cables",
      spec: "IS 7098 Part 2 / Heavy Galvanized Steel Wire Armouring",
      impact:
        "Delivers redundant ring power through India's premier multi-utility tunnel, ensuring zero downtime for international financial towers and stock exchanges.",
      certifications: ["IS 7098 Part 2", "ERDA Certified", "Ring Topology Ready"],
    },
    {
      id: "gift_scada",
      x: 18,
      y: 71,
      num: "02",
      title: "SCADA Automation & Gas Sensor Loop",
      type: "Shielded Instrumentation Line",
      cable: "Volamp Individually & Overall Screened Multi-Pair Signal Cables",
      spec: "BS EN 50288-7 / 100% Aluminium Mylar Shielding with Drain Wire",
      impact:
        "Continuously monitors tunnel oxygen levels, humidity, and electrical load, enabling automatic fault isolation within 15 milliseconds.",
      certifications: ["BS EN 50288-7", "EMC Shielded", "Low Noise"],
    },
    {
      id: "gift_walkway",
      x: 52,
      y: 62,
      num: "03",
      title: "Emergency Tunnel Walkway Feeder",
      type: "Zero Halogen Fire Safety Line",
      cable: "Volamp Low Smoke Zero Halogen (LSZH) Flame Retardant Cables",
      spec: "IEC 60332-3 Cat A / Acid Gas Emission <0.5% (IEC 60754-1)",
      impact:
        "Prevents toxic halogen gas emission in confined tunnel spaces, safeguarding maintenance personnel and automated inspection bots.",
      certifications: ["IEC 60754-1", "IEC 61034 Smoke", "Class A Fire Safe"],
    },
    {
      id: "gift_cooling",
      x: 84,
      y: 52,
      num: "04",
      title: "Automated District Cooling Pumping Grid",
      type: "Variable Frequency Inverter Duty",
      cable: "Volamp Dual-Sheathed VFD Inverter Duty Heavy Duty Cables",
      spec: "IEC 60502-1 with Symmetrical Earth Conductors",
      impact:
        "Powers the high-capacity chilled water circulation pumps maintaining automated thermal cooling across all financial towers.",
      certifications: ["Harmonic Safe", "IEC 60502", "Heavy Duty Submersible"],
    },
  ],

  // 3. BARC Nuclear Complex Trombay (ID 20)
  20: [
    {
      id: "barc_dome",
      x: 42,
      y: 46,
      num: "01",
      title: "Nuclear Reactor Containment Core",
      type: "Class 1E Nuclear Qualified Feeder",
      cable: "Volamp Radiation-Hardened Polyolefin Insulated Cables",
      spec: "IEEE 383 / IEEE 323 Nuclear Qualification (40-Year Life)",
      impact:
        "Provides fail-safe telemetry and control signals from inside the reactor containment dome under continuous high radiation exposure.",
      certifications: ["IEEE 383 Qualified", "Radiation Resistant", "LOCA Tested"],
    },
    {
      id: "barc_switchyard",
      x: 78,
      y: 64,
      num: "02",
      title: "Coastal 220kV/110kV Switchyard",
      type: "High-Tension Transmission Grid",
      cable: "Volamp Heavy Armoured Copper Transmission Cables with Anti-Corrosive Sheath",
      spec: "IEC 60502 / Salt-Mist Tested per ASTM B117 (1000 Hours)",
      impact:
        "Withstands aggressive maritime salt-fog from Mumbai harbor, preventing terminal flashovers and ensuring continuous research uptime.",
      certifications: ["ASTM B117 Salt-Mist", "IEC 60502", "Anti-Corrosion Poly"],
    },
    {
      id: "barc_coolant",
      x: 56,
      y: 52,
      num: "03",
      title: "Heavy Water Circulation & Coolant Loops",
      type: "Circuit Integrity Safety System",
      cable: "Volamp Fire-Survival Mineral-Barrier Power Cables",
      spec: "BS 6387 CWZ / 950°C Direct Flame & Mechanical Impact Tested",
      impact:
        "Guarantees that emergency reactor coolant pumps remain fully powered and operational even in extreme catastrophic fire conditions.",
      certifications: ["BS 6387 CWZ", "CPRI Nuclear Approved", "Circuit Integrity"],
    },
    {
      id: "barc_security",
      x: 24,
      y: 72,
      num: "04",
      title: "Seismic & Radiation Perimeter Telemetry",
      type: "High-Security Direct Burial",
      cable: "Volamp Direct-Burial Steel Wire Armoured Multi-Core Control Cables",
      spec: "IS 1554 / Termite & Rodent Resistant Outer Sheath",
      impact:
        "Connects automated perimeter sensors, radiation monitors, and seismic detection systems to the central BARC control hub.",
      certifications: ["IS 1554", "Anti-Rodent", "Armoured Protection"],
    },
  ],

  // 4. Hero MotoCorp Mega Manufacturing Facility (ID 23)
  23: [
    {
      id: "hero_solar",
      x: 39,
      y: 41,
      num: "01",
      title: "10MW+ Rooftop Solar Generation Array",
      type: "Clean Energy Evacuation",
      cable: "Volamp 1500V DC Cross-Linked Polyolefin (XLPO) Photovoltaic Cables",
      spec: "EN 50618 (H1Z2Z2-K) / TUV Certified / Halogen Free",
      impact:
        "Evacuates over 10 Megawatts of clean rooftop solar energy, making this automotive plant one of the greenest mobility factories in Asia.",
      certifications: ["EN 50618 TUV", "1500V DC Rated", "UV & Ozone Safe"],
    },
    {
      id: "hero_substation",
      x: 12,
      y: 62,
      num: "02",
      title: "33kV Industrial Substation Yard",
      type: "Heavy Industrial Incomer",
      cable: "Volamp 33kV Three-Core XLPE Armoured Copper Feeder Network",
      spec: "IS 7098 Part 2 / Heavy Galvanized Steel Flat Strip Armour",
      impact:
        "Steps down high-voltage grid supply to feed continuous, clean power to sensitive robotic electronics without voltage dips.",
      certifications: ["IS 7098 Part 2", "CPRI Certified", "Low Dielectric Loss"],
    },
    {
      id: "hero_robotics",
      x: 54,
      y: 48,
      num: "03",
      title: "Automated Robotic Assembly Cells",
      type: "High-Flex Automation Control",
      cable: "Volamp Ultra-Flexible Drag-Chain Multi-Core Robotic Cables",
      spec: "VDE 0281 / Tested for 5 Million Continuous Flexing Cycles",
      impact:
        "Keeps robotic welding and automated paint-shop machines operating 24 hours a day with zero copper fatigue fractures.",
      certifications: ["5M Flex Cycles", "Oil & Chemical Proof", "VDE Compliant"],
    },
    {
      id: "hero_logistics",
      x: 84,
      y: 48,
      num: "04",
      title: "Electric Mobility Logistics Hub",
      type: "Fast-Charging Power Feeder",
      cable: "Volamp Low-Loss Heavy Gauge Copper Busway Feeder Lines",
      spec: "IEC 61439-6 / IP68 Rated Direct Underground Distribution",
      impact:
        "Supplies high-amperage fast charging terminals for electric two-wheelers rolling off the automated factory assembly line.",
      certifications: ["IEC 61439-6", "IP68 Submersible", "High Ampacity"],
    },
  ],

  // 5. Charanka Solar Park (ID 6)
  6: [
    {
      id: "charanka_inverter",
      x: 50,
      y: 50,
      num: "01",
      title: "Central Solar Inverter Station",
      type: "DC-to-AC Power Conversion",
      cable: "Volamp 1500V DC Solar String Cables to Central Inverter Bus",
      spec: "TUV 2 Pfg 1169 / IEC 62930 / Double Insulated",
      impact:
        "Collects multi-megawatt DC power from solar arrays and feeds central inverters with minimal thermal dissipation.",
      certifications: ["IEC 62930", "TUV Rheinland", "120°C Thermal Peak"],
    },
    {
      id: "charanka_desert",
      x: 26,
      y: 42,
      num: "02",
      title: "High-Salinity Desert Solar Array",
      type: "Direct Burial Solar String Network",
      cable: "Volamp Direct-Burial Termite-Resistant XLPO Solar Cables",
      spec: "Salt-Mist per ASTM B117 / Termite Repellent per ASTM D3345",
      impact:
        "Withstands extreme saline desert soil in Patan's Rann fringe, preventing underground degradation over a 25-year service life.",
      certifications: ["Anti-Termite", "Salt-Spray Resistant", "Direct Burial"],
    },
    {
      id: "charanka_grid",
      x: 74,
      y: 62,
      num: "03",
      title: "66kV Clean Power Evacuation Substation",
      type: "Utility Grid Interconnection",
      cable: "Volamp 66kV High-Voltage Single-Core XLPE Armoured Feeders",
      spec: "IS 7098 Part 3 / Water-Tight Tape Blocked / Lead Alloy Sheath",
      impact:
        "Evacuates hundreds of megawatts of generated clean energy directly into the Gujarat State GETCO high-voltage transmission grid.",
      certifications: ["IS 7098 Part 3", "Water-Blocked", "GETCO Approved"],
    },
  ],

  // 6. Atal Pedestrian Bridge Sabarmati Riverfront (ID 4)
  4: [
    {
      id: "atal_arch",
      x: 50,
      y: 35,
      num: "01",
      title: "Curved Steel Truss Illumination Spine",
      type: "Architectural Lighting Matrix",
      cable: "Volamp Waterproof Flexible Multi-Core Architectural Feeder",
      spec: "IP68 Submersible / UV-Resistant Silicone Rubber Sheathed",
      impact:
        "Feeds dynamic color-changing LED lighting arrays along the iconic eye-shaped curved steel bridge over the Sabarmati River.",
      certifications: ["IP68 Waterproof", "UV Weatherproof", "Flame Retardant"],
    },
    {
      id: "atal_pier",
      x: 35,
      y: 72,
      num: "02",
      title: "Riverfront Pier Sub-Surface Earthing",
      type: "Surge Protection Grid",
      cable: "Heavy Copper Tape & Chemical Grounding Electrodes",
      spec: "IS 3043 Standards for Wet Riverbed Soil",
      impact:
        "Provides grounding against lightning strikes and static build-up on the pedestrian steel superstructure.",
      certifications: ["IS 3043", "Electrolytic Copper", "Corrosion Proof"],
    },
  ],

  // 7. Bengaluru Aerospace Park (ID 47)
  47: [
    {
      id: "ka_cleanroom",
      x: 48,
      y: 42,
      num: "01",
      title: "Aerospace Cleanroom Precision Grid",
      type: "Harmonic-Filtered Feeder",
      cable: "Volamp Low-Harmonic XLPE Low Smoke Zero Halogen Armoured",
      spec: "BS 6387 / Low Electromagnetic Interference (EMI) Shielding",
      impact:
        "Ensures 99.999% voltage stability for satellite component testing and cleanroom calibration without electrical noise.",
      certifications: ["Low EMI", "Zero Halogen", "Precision Cleanroom"],
    },
    {
      id: "ka_substation",
      x: 22,
      y: 65,
      num: "02",
      title: "33kV Aerospace SEZ Substation",
      type: "High-Tension Incomer",
      cable: "Volamp 33kV Three-Core Armoured Copper Power Line",
      spec: "IS 7098 Part 2 / CPRI Certified",
      impact:
        "Feeds dedicated defense and aerospace manufacturing units across KIADB aerospace park.",
      certifications: ["IS 7098", "CPRI Tested", "High Ampacity"],
    },
  ],
};

interface SiteInspectionInspectorProps {
  project: FootprintProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (proj: FootprintProject) => void;
  allProjects: FootprintProject[];
  onFlyOnGlobe: (proj: FootprintProject) => void;
}

export default function SiteInspectionInspector({
  project,
  isOpen,
  onClose,
  onSelectProject,
  allProjects,
  onFlyOnGlobe,
}: SiteInspectionInspectorProps) {
  if (!isOpen || !project) return null;

  const [activeHotspotIndex, setActiveHotspotIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"drone" | "spec" | "blueprint">("drone");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoTouring, setIsAutoTouring] = useState<boolean>(false);
  const autoTourTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hotspots = LANDMARK_HOTSPOTS[project.id] || [
    {
      id: "default_substation",
      x: 35,
      y: 65,
      num: "01",
      title: `${project.name} Substation Grid`,
      type: "High-Voltage Distribution",
      cable: "Volamp XLPE High-Tension Armoured Copper Cable",
      spec: "IS 7098 / IEC 60502 Standard Compliant",
      impact: project.volampContribution,
      certifications: ["IS 7098", "CPRI Tested", "ISO 9001"],
    },
    {
      id: "default_internal",
      x: 65,
      y: 45,
      num: "02",
      title: "Internal Facility Infrastructure",
      type: "FRLS Distribution Feeder",
      cable: "Volamp Low Smoke Flame Retardant (FRLS) Power Feeder",
      spec: "IS 1554 / BS 6387 Fire Safe Certified",
      impact: project.overview,
      certifications: ["FRLS Class A", "RoHS", "NABL Tested"],
    },
  ];

  const activeHotspot = hotspots[activeHotspotIndex] ?? hotspots[0];

  // Auto-tour through hotspots
  useEffect(() => {
    if (!isAutoTouring) {
      if (autoTourTimerRef.current) clearInterval(autoTourTimerRef.current);
      return;
    }

    autoTourTimerRef.current = setInterval(() => {
      setActiveHotspotIndex((prev) => (prev + 1) % hotspots.length);
    }, 4500);

    return () => {
      if (autoTourTimerRef.current) clearInterval(autoTourTimerRef.current);
    };
  }, [isAutoTouring, hotspots.length]);

  // Reset hotspot index when project changes
  useEffect(() => {
    setActiveHotspotIndex(0);
    setIsAutoTouring(false);
  }, [project.id]);

  // Landmark projects with rich hotspots available for quick switcher
  const landmarkProjects = allProjects.filter((p) =>
    [2, 3, 20, 23, 6, 4, 47, 5, 21, 22].includes(p.id)
  );

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xl transition-all duration-300 ${
        isFullscreen ? "p-0" : ""
      }`}
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col bg-gradient-to-b from-slate-900 via-slate-920 to-slate-950 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? "w-screen h-screen rounded-none border-0"
            : "w-full max-w-6xl max-h-[94vh]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Toolbar (UNESCO Cesium Style) */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/90 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-400">
              <Compass className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  UNESCO 3D SITE INSPECTOR · REAL-WORLD VIEW
                </span>
                <span className="text-xs text-slate-400">
                  <MapPin className="size-3 inline text-amber-400 mr-0.5" />
                  {project.city}, {project.stateCode}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {project.name}
              </h3>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* Auto Drone Tour Toggle */}
            <button
              onClick={() => setIsAutoTouring(!isAutoTouring)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isAutoTouring
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse"
                  : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
              }`}
              title="Automatically tour all engineered components"
            >
              <Play className={`size-3.5 ${isAutoTouring ? "fill-current" : ""}`} />
              <span>{isAutoTouring ? "Touring Site..." : "Drone Tour"}</span>
            </button>

            {/* Fly on 3D Globe Button */}
            <button
              onClick={() => {
                onClose();
                onFlyOnGlobe(project);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 border border-sky-500/30 transition-all"
              title="Swoop 3D globe to this exact geographic coordinates"
            >
              <Globe2 className="size-3.5" />
              <span className="hidden sm:inline">Fly on 3D Globe</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all"
              aria-label="Close Site Inspector"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* 2. Main Interactive Viewport with Real-World Imagery & 3D Hotspot Pins */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] max-h-[62vh] bg-black overflow-hidden select-none">
          {/* Real Landmark Photograph with subtle drone parallax drift */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={project.images || "/projects/project-1.jpg"}
              alt={project.name}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-1000 ease-out"
              style={{
                filter: "brightness(0.92) contrast(1.08)",
                animation: "realWorldDroneDrift 28s ease-in-out infinite alternate",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/projects/project-1.jpg";
              }}
            />
            {/* Atmospheric Vignette & Horizon Tint */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35 pointer-events-none" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/50 pointer-events-none" />
          </div>

          {/* UNESCO Compass / Drone HUD Reticle Overlay */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 text-[11px] font-mono text-slate-300">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>LIVE TELEMETRY: 4K HIGH-RES TWIN</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 font-semibold">{hotspots.length} INSPECTABLE NODES</span>
            </div>
          </div>

          {/* Interactive 3D Callout Hotspot Pins */}
          {hotspots.map((h, idx) => {
            const isSelected = activeHotspotIndex === idx;
            return (
              <div
                key={h.id}
                className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onClick={() => {
                  setIsAutoTouring(false);
                  setActiveHotspotIndex(idx);
                }}
              >
                {/* Concentric UNESCO Radar Wave Ping */}
                <div
                  className={`absolute -inset-4 rounded-full border border-amber-400 transition-opacity pointer-events-none ${
                    isSelected ? "opacity-90 animate-ping" : "opacity-35"
                  }`}
                  style={{ animationDuration: isSelected ? "1.8s" : "3.2s" }}
                />

                {/* Second Concentric Target Ring */}
                <div
                  className={`absolute -inset-2.5 rounded-full border border-amber-400/50 transition-all ${
                    isSelected ? "scale-125 border-amber-300" : "scale-100"
                  }`}
                />

                {/* Glowing Core Dot / Button */}
                <div
                  className={`relative flex items-center justify-center size-8 rounded-full font-bold text-xs shadow-lg transition-all duration-300 ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 scale-125 shadow-amber-400/60 ring-4 ring-amber-400/30"
                      : "bg-slate-950/80 text-amber-300 border-2 border-amber-400/70 hover:scale-115 hover:bg-amber-400 hover:text-slate-950"
                  }`}
                >
                  <span>{h.num}</span>
                </div>

                {/* Floating Glassmorphic Tag Label */}
                <div
                  className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide backdrop-blur-md transition-all duration-300 pointer-events-none shadow-xl border ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 border-amber-300 opacity-100 scale-105"
                      : "bg-slate-950/80 text-slate-200 border-white/20 opacity-80 group-hover:opacity-100 group-hover:scale-100"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="size-3 text-current" />
                    <span>{h.title}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Previous / Next Hotspot Nav Overlay */}
          <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
            <button
              onClick={() => {
                setIsAutoTouring(false);
                setActiveHotspotIndex(
                  (prev) => (prev - 1 + hotspots.length) % hotspots.length
                );
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/15 backdrop-blur-md transition-all"
              title="Previous Hotspot"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 text-xs font-mono text-amber-400 border border-white/15 backdrop-blur-md">
              Node {activeHotspotIndex + 1} / {hotspots.length}
            </span>
            <button
              onClick={() => {
                setIsAutoTouring(false);
                setActiveHotspotIndex((prev) => (prev + 1) % hotspots.length);
              }}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/15 backdrop-blur-md transition-all"
              title="Next Hotspot"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* 3. Bottom Engineering Telemetry Panel & Specifications HUD */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-900/95 to-slate-950 border-t border-white/10 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Left: Active Hotspot Specification Card */}
            <div className="lg:col-span-8 flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  NODE {activeHotspot.num} · {activeHotspot.type.toUpperCase()}
                </span>
                <span className="text-sm font-bold text-white tracking-wide">
                  {activeHotspot.title}
                </span>
              </div>

              {/* Cable System Spec Box */}
              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="size-7 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      CABLE SYSTEM INSTALLED BY VOLAMP
                    </div>
                    <div className="text-sm font-semibold text-slate-100">
                      {activeHotspot.cable}
                    </div>
                    <div className="text-xs text-amber-400 font-mono mt-0.5">
                      Standard: {activeHotspot.spec}
                    </div>
                  </div>
                </div>

                {/* Certifications badges */}
                {activeHotspot.certifications && (
                  <div className="flex flex-wrap gap-1.5 sm:max-w-xs shrink-0">
                    {activeHotspot.certifications.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-2.5 text-emerald-400" />
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-World Societal & Safety Impact */}
              <div className="text-xs text-slate-300 leading-relaxed bg-amber-500/[0.04] border border-amber-500/20 rounded-xl p-3">
                <strong className="text-amber-400 font-semibold block mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-amber-400" />
                  Real-World Public & Engineering Impact:
                </strong>
                {activeHotspot.impact}
              </div>
            </div>

            {/* Right: Quick Action CTAs */}
            <div className="lg:col-span-4 flex flex-col gap-2.5">
              <a
                href={`https://wa.me/919512365582?text=Hi%20Volamp%20Team,%20I%20am%20reviewing%20the%20${encodeURIComponent(
                  project.name
                )}%20engineering%20specs%20and%20would%20like%20to%20discuss%20cable%20requirements.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all"
              >
                <span>Enquire Regarding This Architecture</span>
                <ArrowRight className="size-3.5" />
              </a>

              <button
                onClick={() => {
                  onClose();
                  onFlyOnGlobe(project);
                }}
                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all"
              >
                <Compass className="size-3.5 text-amber-400" />
                <span>Return & Focus on 3D Globe</span>
              </button>
            </div>
          </div>

          {/* 4. Landmark Sites Quick Switcher Carousel */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>EXPLORE OTHER ICONIC NATIONAL SITES</span>
              <span className="text-slate-500 text-[10px]">Click any site to inspect in 3D</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {landmarkProjects.map((p) => {
                const isCur = p.id === project.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onSelectProject(p)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-left shrink-0 transition-all ${
                      isCur
                        ? "bg-amber-500/20 border-amber-400 text-white shadow-md shadow-amber-500/10"
                        : "bg-white/[0.03] hover:bg-white/[0.08] border-white/10 text-slate-300"
                    }`}
                  >
                    <img
                      src={p.images || "/projects/project-1.jpg"}
                      alt={p.name}
                      className="size-7 rounded-lg object-cover border border-white/10"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/projects/project-1.jpg";
                      }}
                    />
                    <div className="max-w-[130px]">
                      <div className="text-[11px] font-semibold truncate">{p.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">
                        {p.city}, {p.stateCode}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
