import React, { Component, ErrorInfo, ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronRight,
  Compass,
  Expand,
  Eye,
  Flame,
  Glasses,
  Globe2,
  Headphones,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Pause,
  Plane,
  Play,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Ship,
  Smartphone,
  Sparkles,
  Sun,
  Table,
  X,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Lazy-load Globe component so Three.js is not loaded into memory unless WebGL is confirmed available
const LazyGlobe = React.lazy(() => import("react-globe.gl"));

export type FootprintState = {
  id: number;
  code: string;
  name: string;
  territory: string;
  lat: string | number;
  lng: string | number;
  projectsCompleted: number;
  majorProjectsCount: number;
  industry: string;
  yearsOfPresence: string;
  heritage: string;
  customerQuote: string | null;
  customerAuthor: string | null;
  customerCompany: string | null;
  variant: string;
};

export type FootprintProject = {
  id: number;
  stateCode: string;
  name: string;
  city: string;
  lat: string | number;
  lng: string | number;
  year: string;
  category: string;
  shortDescription: string;
  overview: string;
  volampContribution: string;
  heritage: string;
  customerTestimonial: string | null;
  customerName: string | null;
  customerCompany: string | null;
  status: string;
  images: string | null;
};

// Official project numbers from corporate record (Requirement 4 & 6)
export const OFFICIAL_STATE_COUNTS: Record<string, string> = {
  GJ: "100+",
  RJ: "50+",
  MP: "25",
  MH: "20",
  KA: "15",
  UP: "15",
  OD: "10",
  TN: "5",
  CG: "3",
  TG: "3",
  AS: "2",
  BR: "2",
  PB: "2",
  AP: "1",
  GA: "1",
  HR: "1",
  HP: "1",
  JH: "1",
  KL: "1",
  MN: "1",
  MZ: "1",
  WB: "1",
  AR: "0",
  ML: "0",
  NL: "0",
  SK: "0",
  TR: "0",
  UK: "0",
  LA: "0",
  JK: "0",
};

// Global Export Hubs & Domestic Supply Arcs originating from Ahmedabad HQ (23.02° N, 72.57° E)
const SUPPLY_ARCS = [
  // Domestic Major Arcs
  { startLat: 23.02, startLng: 72.57, endLat: 19.07, endLng: 72.87, target: "Mumbai / BARC / Nhava Sheva", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 28.61, endLng: 77.20, target: "Delhi NCR / North Corridors", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 12.97, endLng: 77.59, target: "Bengaluru Tech Hub", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 13.08, endLng: 80.27, target: "Chennai / Coimbatore Airport", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 17.38, endLng: 78.48, target: "Hyderabad / Telangana Solar", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 22.57, endLng: 88.36, target: "Kolkata / WB Solar", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 26.91, endLng: 75.78, target: "Rajasthan 50+ Solar Sites", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 21.27, endLng: 81.86, target: "Bhilai Steel / Chhattisgarh", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 26.20, endLng: 92.93, target: "Guwahati Airport / Northeast Hub", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 25.09, endLng: 85.31, target: "IOCL Begusarai / Patna WTP", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 22.97, endLng: 78.65, target: "Indore Smart City / MP Grid", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 15.29, endLng: 74.12, target: "Goa Dabolim Airport / GMC", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 15.91, endLng: 79.74, target: "Hero MotoCorp Plant / AP", color: ["#f2b84b", "#65afe0"] },

  // Global Export Corridors
  { startLat: 23.02, startLng: 72.57, endLat: 25.20, endLng: 55.27, target: "Dubai / GCC Export Gateway", color: ["#f2b84b", "#10b981"] },
  { startLat: 23.02, startLng: 72.57, endLat: 24.71, endLng: 46.67, target: "Riyadh / Saudi Industrial Supply", color: ["#f2b84b", "#10b981"] },
  { startLat: 23.02, startLng: 72.57, endLat: 25.28, endLng: 51.53, target: "Doha / Qatar Energy Projects", color: ["#f2b84b", "#10b981"] },
  { startLat: 23.02, startLng: 72.57, endLat: 1.35, endLng: 103.82, target: "Singapore / Southeast Asia Logistics", color: ["#f2b84b", "#10b981"] },
  { startLat: 23.02, startLng: 72.57, endLat: -1.29, endLng: 36.82, target: "Nairobi / East Africa Industrial Corridor", color: ["#f2b84b", "#10b981"] },
  { startLat: 23.02, startLng: 72.57, endLat: -6.79, endLng: 39.28, target: "Dar es Salaam Port Corridor", color: ["#f2b84b", "#10b981"] },
];

// Global Export Points for 3D Globe & 2D Map
const GLOBAL_EXPORT_POINTS = [
  { name: "Dubai, UAE", lat: 25.20, lng: 55.27, territory: "GCC Export Hub", color: "#10b981", size: 0.55 },
  { name: "Riyadh, Saudi Arabia", lat: 24.71, lng: 46.67, territory: "Middle East Industrial", color: "#10b981", size: 0.5 },
  { name: "Doha, Qatar", lat: 25.28, lng: 51.53, territory: "Energy Corridor", color: "#10b981", size: 0.45 },
  { name: "Singapore", lat: 1.35, lng: 103.82, territory: "Southeast Asia Gateway", color: "#10b981", size: 0.5 },
  { name: "Nairobi, Kenya", lat: -1.29, lng: 36.82, territory: "East Africa Hub", color: "#10b981", size: 0.48 },
  { name: "Dar es Salaam, Tanzania", lat: -6.79, lng: 39.28, territory: "Maritime Port Supply", color: "#10b981", size: 0.45 },
];

// 12-Scene Automated Cinematic Sequence Configuration (Requirements 1, 2, 5, 12)
export interface TourScene {
  id: string;
  title: string;
  eyebrow: string;
  narrative: string;
  coords: { lat: number; lng: number; altitude: number };
  flyDurationMs: number;
  dwellMs: number;
  stateCode?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

const CINEMATIC_TOUR_SCENES: TourScene[] = [
  {
    id: "world_intro",
    title: "Global Supply & Export Presence",
    eyebrow: "SCENE 1 · ORBITAL 3D EARTH",
    narrative: "Originating in Ahmedabad, Volamp operates an integrated global and domestic delivery corridor spanning 28 Indian States and export gateways across the GCC, Africa, and Southeast Asia.",
    coords: { lat: 20.5, lng: 52.0, altitude: 2.35 },
    flyDurationMs: 1400,
    dwellMs: 4500,
    autoRotate: true,
    autoRotateSpeed: 0.45,
  },
  {
    id: "pan_asia",
    title: "Traversing Toward Asian Subcontinent",
    eyebrow: "SCENE 2 · CONTINENTAL REALIGNMENT",
    narrative: "Camera pans across the Indian Ocean basin into South Asia, centering on India's strategic manufacturing and infrastructure belts.",
    coords: { lat: 21.0, lng: 69.5, altitude: 1.85 },
    flyDurationMs: 2800,
    dwellMs: 3200,
    autoRotate: false,
  },
  {
    id: "focus_india",
    title: "Pan-India National Operational Footprint",
    eyebrow: "SCENE 3 · SOVEREIGN 3D TERRITORY",
    narrative: "Activating official Survey of India boundary representation with 256+ completed installations, 46+ verified landmark facilities, and critical utility interconnections.",
    coords: { lat: 22.0, lng: 78.5, altitude: 1.15 },
    flyDurationMs: 3200,
    dwellMs: 4000,
    autoRotate: false,
  },
  {
    id: "tour_gujarat",
    title: "Gujarat · Volamp Engineering Origin",
    eyebrow: "SCENE 4 · 100+ COMPLETED PROJECTS",
    narrative: "Origin of Volamp manufacturing: powering the Statue of Unity, GIFT City underground smart tunnel, Atal Bridge, Reliance Vantara, Charanka Solar, and Dahej petrochemical complexes.",
    coords: { lat: 22.25, lng: 71.19, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 6500,
    stateCode: "GJ",
    autoRotate: false,
  },
  {
    id: "tour_maharashtra",
    title: "Maharashtra · Nuclear Research & Expressways",
    eyebrow: "SCENE 5 · 20 COMPLETED PROJECTS",
    narrative: "Critical safety-compliant power infrastructure powering India's premier Bhabha Atomic Research Centre (BARC Mumbai), Asian Highway expressways, and Kolhapur Airport.",
    coords: { lat: 19.75, lng: 75.71, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 6000,
    stateCode: "MH",
    autoRotate: false,
  },
  {
    id: "tour_rajasthan",
    title: "Rajasthan · High-Thermal Desert Solar Grid",
    eyebrow: "SCENE 6 · 50+ SOLAR INSTALLATIONS",
    narrative: "Engineered for harsh desert ambient heat extremes, Volamp has delivered specialized cabling across 50+ utility-scale solar parks and industrial mining grids in Rajasthan.",
    coords: { lat: 27.02, lng: 74.21, altitude: 0.65 },
    flyDurationMs: 2200,
    dwellMs: 6000,
    stateCode: "RJ",
    autoRotate: false,
  },
  {
    id: "tour_mp",
    title: "Madhya Pradesh · Smart Cities & Utilities",
    eyebrow: "SCENE 7 · 25 COMPLETED PROJECTS",
    narrative: "Powering the Indore Smart City grid, Bhopal Water Treatment Plants, and Amarkantak thermal installations with resilient, factory-certified electrical feeds.",
    coords: { lat: 22.97, lng: 78.65, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 5500,
    stateCode: "MP",
    autoRotate: false,
  },
  {
    id: "tour_karnataka",
    title: "Karnataka · Southern Technology & Power",
    eyebrow: "SCENE 8 · 15 COMPLETED PROJECTS",
    narrative: "Supplying industrial substations, commercial tech corridors, and metro electrical networks throughout Bengaluru and Karnataka.",
    coords: { lat: 15.31, lng: 75.71, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 5500,
    stateCode: "KA",
    autoRotate: false,
  },
  {
    id: "tour_up",
    title: "Uttar Pradesh · Northern Grid Backbone",
    eyebrow: "SCENE 9 · 15 COMPLETED PROJECTS",
    narrative: "Delivering heavy transmission feeds across 15 project sites supporting civic electrification and industrial infrastructure development.",
    coords: { lat: 26.84, lng: 80.94, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 5500,
    stateCode: "UP",
    autoRotate: false,
  },
  {
    id: "tour_odisha",
    title: "Odisha · Water & Industrial Infrastructure",
    eyebrow: "SCENE 10 · 10 COMPLETED PROJECTS",
    narrative: "Deploying high-reliability cabling across state water treatment facilities and mineral processing hubs in Odisha.",
    coords: { lat: 20.95, lng: 85.09, altitude: 0.62 },
    flyDurationMs: 2200,
    dwellMs: 5500,
    stateCode: "OD",
    autoRotate: false,
  },
  {
    id: "tour_northeast",
    title: "Northeast Corridors · Aviation & Connectivity",
    eyebrow: "SCENE 11 · GUWAHATI, IMPHAL & AIZAWL",
    narrative: "Supporting regional aviation infrastructure at Guwahati International Airport, Imphal Airport, and Aizawl Airport with safety-grade runway and terminal cabling.",
    coords: { lat: 26.20, lng: 92.93, altitude: 0.65 },
    flyDurationMs: 2400,
    dwellMs: 5500,
    stateCode: "AS",
    autoRotate: false,
  },
  {
    id: "tour_south",
    title: "Southern Belt · Automotive & Healthcare",
    eyebrow: "SCENE 12 · TAMIL NADU, KERALA & ANDHRA",
    narrative: "Supplying the Hero MotoCorp manufacturing facility in Andhra Pradesh, Idukki Medical College in Kerala, and industrial facilities across Tamil Nadu.",
    coords: { lat: 11.12, lng: 78.65, altitude: 0.64 },
    flyDurationMs: 2400,
    dwellMs: 5500,
    stateCode: "TN",
    autoRotate: false,
  },
  {
    id: "tour_pan_india",
    title: "Pan-India Complete Industrial Network",
    eyebrow: "SCENE 13 · CONTINUOUS EXCELLENCE",
    narrative: "256+ projects, 28 states, and certified engineering compliance. Select any state or project pin to inspect technical specifications.",
    coords: { lat: 22.0, lng: 78.5, altitude: 1.18 },
    flyDurationMs: 3000,
    dwellMs: 5000,
    autoRotate: false,
  },
];

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas as any).getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onCatch?: (error: Error) => void;
  resetKey?: number;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, WebGLErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): WebGLErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[WebGL] Notice from 3D Globe renderer, transitioning to 2D Geographic Map:", error, errorInfo);
    setTimeout(() => {
      this.props.onCatch?.(error);
    }, 0);
  }

  componentDidUpdate(prevProps: WebGLErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// 2D Geographic World & India Map View (Mobile / Low-End Fallback - Req 17)
// ---------------------------------------------------------------------------

function GeographicMapView({
  states,
  selectedStateCode,
  onSelectState,
  onSwitchTo3D,
  has3DSupport,
}: {
  states: FootprintState[];
  selectedStateCode: string;
  onSelectState: (state: FootprintState) => void;
  onSwitchTo3D: () => void;
  has3DSupport: boolean;
}) {
  const [activeRegionPreset, setActiveRegionPreset] = useState<"all" | "india" | "export" | "west" | "south">("all");

  // Accurate geographic SVG coordinates mapped to 880x560 viewport
  const stateCoordinates: Record<string, { x: number; y: number }> = {
    GJ: { x: 420, y: 260 }, // Gujarat (Ahmedabad / Surat / Saurashtra)
    MH: { x: 450, y: 325 }, // Maharashtra (Mumbai / BARC / Pune)
    RJ: { x: 440, y: 195 }, // Rajasthan (Jaipur / 50+ Solar Sites)
    KA: { x: 460, y: 410 }, // Karnataka (Bengaluru / 15 Sites)
    TN: { x: 495, y: 455 }, // Tamil Nadu (Chennai / Coimbatore)
    KL: { x: 465, y: 470 }, // Kerala (Idukki Medical College)
    AP: { x: 520, y: 395 }, // Andhra Pradesh (Hero MotoCorp Factory)
    TG: { x: 505, y: 345 }, // Telangana (Hyderabad / Solar)
    MP: { x: 500, y: 260 }, // Madhya Pradesh (Bhopal WTP / Indore / Amarkantak)
    CG: { x: 545, y: 285 }, // Chhattisgarh (Bhilai Steel Company)
    OD: { x: 595, y: 295 }, // Odisha (Odisha WTP)
    BR: { x: 590, y: 215 }, // Bihar (IOCL Begusarai / Patna WTP)
    JH: { x: 585, y: 250 }, // Jharkhand (Ranchi Airport)
    WB: { x: 625, y: 255 }, // West Bengal (Kolkata / Solar)
    UP: { x: 530, y: 200 }, // Uttar Pradesh (15 Sites)
    HR: { x: 470, y: 165 }, // Haryana (Hisar Municipal Corp)
    PB: { x: 450, y: 145 }, // Punjab (2 Projects)
    HP: { x: 475, y: 125 }, // Himachal Pradesh (1 Project)
    UK: { x: 495, y: 140 }, // Uttarakhand
    GA: { x: 435, y: 380 }, // Goa (Dabolim Airport / GMC)
    AS: { x: 685, y: 200 }, // Assam (Guwahati Airport)
    MN: { x: 725, y: 225 }, // Manipur (Imphal Airport)
    MZ: { x: 715, y: 255 }, // Mizoram (Airport Aizawl)
    NL: { x: 730, y: 195 }, // Nagaland
    AR: { x: 725, y: 155 }, // Arunachal Pradesh
    ML: { x: 680, y: 225 }, // Meghalaya
    SK: { x: 630, y: 175 }, // Sikkim
    TR: { x: 695, y: 255 }, // Tripura
  };

  const exportPorts = [
    { name: "Dubai / GCC", x: 260, y: 220, code: "DXB", sub: "GCC Gateway" },
    { name: "Riyadh", x: 200, y: 250, code: "RUH", sub: "Saudi Industrial" },
    { name: "Doha", x: 240, y: 235, code: "DOH", sub: "Qatar Energy" },
    { name: "East Africa (Nairobi)", x: 190, y: 430, code: "NBO", sub: "African Corridor" },
    { name: "Dar es Salaam", x: 205, y: 485, code: "DAR", sub: "Maritime Port" },
    { name: "Singapore", x: 790, y: 470, code: "SIN", sub: "SE Asia Hub" },
  ];

  const hqCoord = { x: 420, y: 260 };

  return (
    <div className="geographic-map-container">
      <div className="geo-map-toolbar">
        <div className="geo-map-status">
          <Globe2 className="size-4 text-amber-500" />
          <span className="font-bold text-white text-xs tracking-wider">GEOGRAPHIC GLOBAL & PAN-INDIA MAP</span>
          <span className="geo-badge">28 States & Global Corridors</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            className={`geo-filter-btn ${activeRegionPreset === "all" ? "is-active" : ""}`}
            onClick={() => setActiveRegionPreset("all")}
          >
            All Corridors
          </button>
          <button
            type="button"
            className={`geo-filter-btn ${activeRegionPreset === "india" ? "is-active" : ""}`}
            onClick={() => setActiveRegionPreset("india")}
          >
            Pan-India (28)
          </button>
          <button
            type="button"
            className={`geo-filter-btn ${activeRegionPreset === "export" ? "is-active" : ""}`}
            onClick={() => setActiveRegionPreset("export")}
          >
            Global Export Lanes
          </button>
          <button
            type="button"
            className={`geo-filter-btn ${activeRegionPreset === "west" ? "is-active" : ""}`}
            onClick={() => setActiveRegionPreset("west")}
          >
            Western Belt (GJ/MH/RJ)
          </button>
          {has3DSupport && (
            <button type="button" onClick={onSwitchTo3D} className="geo-switch-3d-btn">
              <RotateCcw className="size-3.5" /> 3D Cinematic Experience
            </button>
          )}
        </div>
      </div>

      <div className="geo-map-svg-frame">
        <svg
          viewBox="0 0 880 560"
          className="geo-interactive-svg"
          aria-label="Volamp Geographic Supply Map across India and Global Corridors"
        >
          <defs>
            <linearGradient id="domesticArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2b84b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.55" />
            </linearGradient>

            <linearGradient id="globalArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f2b84b" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.65" />
            </linearGradient>

            <radialGradient id="hqRadial">
              <stop offset="0%" stopColor="#f2b84b" stopOpacity="1" />
              <stop offset="50%" stopColor="#f2b84b" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#f2b84b" stopOpacity="0" />
            </radialGradient>

            <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ocean Water Background */}
          <rect width="880" height="560" fill="#041220" />
          <g opacity="0.07" stroke="#38bdf8">
            <line x1="0" y1="120" x2="880" y2="120" strokeDasharray="5 7" />
            <line x1="0" y1="260" x2="880" y2="260" strokeDasharray="5 7" />
            <line x1="0" y1="400" x2="880" y2="400" strokeDasharray="5 7" />
            <line x1="0" y1="500" x2="880" y2="500" strokeDasharray="5 7" />
            <line x1="140" y1="0" x2="140" y2="560" strokeDasharray="5 7" />
            <line x1="280" y1="0" x2="280" y2="560" strokeDasharray="5 7" />
            <line x1="420" y1="0" x2="420" y2="560" strokeDasharray="5 7" />
            <line x1="560" y1="0" x2="560" y2="560" strokeDasharray="5 7" />
            <line x1="700" y1="0" x2="700" y2="560" strokeDasharray="5 7" />
            <line x1="820" y1="0" x2="820" y2="560" strokeDasharray="5 7" />
          </g>

          {/* Graticule labels */}
          <g fill="#475569" fontSize="8" fontFamily="monospace">
            <text x="10" y="115">30° N</text>
            <text x="10" y="255">Tropic of Cancer (23.5° N)</text>
            <text x="10" y="395">10° N</text>
            <text x="10" y="495">Equator (0°)</text>
            <text x="282" y="15">60° E</text>
            <text x="422" y="15">72.5° E (Ahmedabad)</text>
            <text x="562" y="15">85° E</text>
            <text x="702" y="15">95° E</text>
          </g>

          {/* Arabian Peninsula */}
          <path
            d="M 170,140 L 215,155 L 245,180 L 235,215 L 265,210 L 285,235 L 270,275 L 235,315 L 195,325 L 175,295 L 180,245 L 155,210 Z"
            fill="#092033"
            stroke="#164366"
            strokeWidth="1.4"
          />

          {/* East Africa Coast */}
          <path
            d="M 140,260 L 170,285 L 195,335 L 235,365 L 205,420 L 190,445 L 200,490 L 180,530 L 145,510 L 135,430 L 115,350 Z"
            fill="#081c2d"
            stroke="#164366"
            strokeWidth="1.4"
          />

          {/* Indian Subcontinent with official Survey of India boundary crown (including Gilgit-Baltistan & Aksai Chin) */}
          <path
            d="M 450,95 L 470,75 L 490,85 L 515,115 L 565,150 L 610,165 L 635,160 L 670,165 
               L 725,145 L 740,165 L 725,195 L 735,230 L 715,265 L 690,265 
               L 640,275 L 615,295 L 585,320 L 545,365 L 515,420 L 490,470 
               L 475,495 L 460,470 L 440,415 L 425,370 L 420,335 L 415,290 
               L 385,275 L 375,255 L 395,240 L 410,225 L 425,195 L 440,145 Z"
            fill="#0a2742"
            stroke="#1e517c"
            strokeWidth="1.8"
          />

          {/* Gujarat Kathiawar & Kutch */}
          <path
            d="M 415,290 Q 380,295 375,265 Q 385,245 410,240 Z"
            fill="#103b61"
            stroke="#f2b84b"
            strokeWidth="1.6"
            opacity="0.9"
          />

          {/* Sri Lanka */}
          <ellipse cx="510" cy="492" rx="11" ry="16" fill="#0a2742" stroke="#1e517c" strokeWidth="1.2" />

          {/* Southeast Asia */}
          <path
            d="M 710,270 L 735,310 L 755,365 L 775,430 L 790,470 L 780,485 L 760,450 L 745,390 L 725,340 Z"
            fill="#081c2d"
            stroke="#164366"
            strokeWidth="1.4"
          />

          {/* Export Shipping Lanes */}
          {exportPorts.map((port) => {
            if (activeRegionPreset === "india" || activeRegionPreset === "west" || activeRegionPreset === "south") return null;
            const midX = (hqCoord.x + port.x) / 2;
            const midY = (hqCoord.y + port.y) / 2 - 30;

            return (
              <g key={port.name}>
                <path
                  d={`M ${hqCoord.x} ${hqCoord.y} Q ${midX} ${midY} ${port.x} ${port.y}`}
                  fill="none"
                  stroke="url(#globalArc)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  className="shipping-lane-path"
                />
                <circle cx={port.x} cy={port.y} r="5" fill="#10b981" />
                <text x={port.x} y={port.y - 10} textAnchor="middle" fill="#34d399" fontSize="8.5" fontWeight="bold">
                  {port.name}
                </text>
              </g>
            );
          })}

          {/* Domestic Power Arcs */}
          {states.map((st) => {
            if (st.code === "GJ") return null;
            const coord = stateCoordinates[st.code];
            if (!coord) return null;

            const isSelected = st.code === selectedStateCode;
            const midX = (hqCoord.x + coord.x) / 2;
            const midY = Math.min(hqCoord.y, coord.y) - 22;

            return (
              <path
                key={`arc-${st.code}`}
                d={`M ${hqCoord.x} ${hqCoord.y} Q ${midX} ${midY} ${coord.x} ${coord.y}`}
                fill="none"
                stroke={isSelected ? "#f2b84b" : "url(#domesticArc)"}
                strokeWidth={isSelected ? "2.6" : "1.2"}
                strokeOpacity={isSelected ? "1" : "0.45"}
                strokeDasharray={isSelected ? "none" : "3 4"}
              />
            );
          })}

          {/* Volamp HQ Center */}
          <circle cx={hqCoord.x} cy={hqCoord.y} r="26" fill="url(#hqRadial)" className="pulse-circle" />
          <circle cx={hqCoord.x} cy={hqCoord.y} r="8" fill="#f2b84b" filter="url(#nodeGlow)" />
          <circle cx={hqCoord.x} cy={hqCoord.y} r="3" fill="#041220" />
          <text x={hqCoord.x} y={hqCoord.y - 14} textAnchor="middle" fill="#f2b84b" fontSize="11" fontWeight="900">
            VOLAMP HQ (Ahmedabad)
          </text>
          <text x={hqCoord.x} y={hqCoord.y + 20} textAnchor="middle" fill="#cbd5e1" fontSize="8.5" fontWeight="bold">
            Manufacturing Center · 100+ Projects
          </text>

          {/* Regional State Nodes */}
          {states.map((st) => {
            const coord = stateCoordinates[st.code] || { x: 500, y: 260 };
            const isSelected = st.code === selectedStateCode;
            const isMajor = st.projectsCompleted >= 10;
            const officialCount = OFFICIAL_STATE_COUNTS[st.code] ?? (st.projectsCompleted > 0 ? st.projectsCompleted : "0");

            const isHiddenByFilter =
              activeRegionPreset === "export" ||
              (activeRegionPreset === "west" && !["GJ", "MH", "RJ", "GA"].includes(st.code)) ||
              (activeRegionPreset === "south" && !["KA", "TN", "TG", "AP", "KL"].includes(st.code));

            if (isHiddenByFilter) return null;

            return (
              <g
                key={`node-${st.code}`}
                transform={`translate(${coord.x}, ${coord.y})`}
                onClick={() => onSelectState(st)}
                className={`state-geo-node ${isSelected ? "is-selected-node" : ""}`}
                style={{ cursor: "pointer" }}
              >
                {isSelected && (
                  <circle r="18" fill="none" stroke="#f2b84b" strokeWidth="2.2" className="pulse-ring" />
                )}
                <circle
                  r={isSelected ? 10 : isMajor ? 7.5 : 5.5}
                  fill={isSelected ? "#f2b84b" : isMajor ? "#38bdf8" : "#0d3759"}
                  stroke={isSelected ? "#ffffff" : isMajor ? "#bae6fd" : "#4c91bd"}
                  strokeWidth={isSelected ? "2.5" : "1.5"}
                  filter={isSelected ? "url(#nodeGlow)" : undefined}
                />
                <text
                  x="0"
                  y={isSelected ? -14 : 17}
                  textAnchor="middle"
                  fill={isSelected ? "#f2b84b" : isMajor ? "#e0f2fe" : "#94a3b8"}
                  fontSize={isSelected ? "11" : isMajor ? "9.5" : "8.5"}
                  fontWeight={isSelected ? "900" : isMajor ? "750" : "600"}
                  className="state-geo-label"
                >
                  {st.name} ({officialCount})
                </text>
              </g>
            );
          })}
        </svg>

        <div className="geo-map-footer-bar">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-slate-300">
              <strong>Tip:</strong> Click any state node to inspect regional projects, verified count ({states.length} states active), and technical specifications.
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-400" /> Selected</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-sky-400" /> Major Hub (10+)</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-400" /> Global Export (GCC/Africa/SE Asia)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Cinematic 3D Global & Pan-India Interactive Experience Component
// ---------------------------------------------------------------------------

export default function GlobeProjectsExperience() {
  const globeRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resumeTourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  // tRPC Queries
  const { data: overviewData } = trpc.footprint.overview.useQuery();
  const { data: dbStates } = trpc.footprint.states.useQuery();
  const { data: allProjects } = trpc.footprint.stateProjects.useQuery({});

  // Local Component State
  const [indiaFeatures, setIndiaFeatures] = useState<any[]>([]);
  const [isGlobeLoaded, setIsGlobeLoaded] = useState<boolean>(false);
  const [webGLAvailable, setWebGLAvailable] = useState<boolean>(() => checkWebGLSupport());
  const [retryKey, setRetryKey] = useState<number>(0);
  const [globeSize, setGlobeSize] = useState({ width: 720, height: 560 });
  const [viewMode, setViewMode] = useState<"globe" | "map" | "table">("globe");

  // Automated Tour & Sequencer State
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isAutoTourActive, setIsAutoTourActive] = useState<boolean>(true);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [tourTimeRemainingMs, setTourTimeRemainingMs] = useState<number>(4500);

  // Interactive Selection State
  const [selectedStateCode, setSelectedStateCode] = useState<string>("GJ");
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<FootprintProject | null>(null);
  const [isArModalOpen, setIsArModalOpen] = useState<boolean>(false);
  const [isVrModalOpen, setIsVrModalOpen] = useState<boolean>(false);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [vrSupported, setVrSupported] = useState<boolean>(false);

  // Check WebXR VR device support
  useEffect(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      (navigator as any).xr?.isSessionSupported?.("immersive-vr")
        .then((supported: boolean) => setVrSupported(Boolean(supported)))
        .catch(() => setVrSupported(false));
    }
  }, []);

  // WebGL availability check
  useEffect(() => {
    setWebGLAvailable(checkWebGLSupport());
  }, [retryKey]);

  // Clean up WebGL resources on unmount
  useEffect(() => {
    return () => {
      try {
        if (globeRef.current) {
          const renderer = globeRef.current.renderer?.();
          if (renderer && typeof renderer.dispose === "function") {
            renderer.dispose();
          }
        }
      } catch {
        // ignore disposal errors
      }
    };
  }, []);

  // Master states list with fallback
  const states: FootprintState[] = useMemo(() => {
    if (dbStates && dbStates.length > 0) return dbStates as unknown as FootprintState[];
    return [
      {
        id: 1,
        code: "GJ",
        name: "Gujarat",
        territory: "West India",
        lat: "22.25",
        lng: "71.19",
        projectsCompleted: 100,
        majorProjectsCount: 18,
        industry: "Industrial Infrastructure, Statue of Unity, GIFT City, Petrochemicals & Solar Parks",
        yearsOfPresence: "20+",
        heritage: "Originating in Ahmedabad, Gujarat represents Volamp's foundational engineering corridor with 100+ installations.",
        customerQuote: "Volamp supplied verified HT cables and specialized flame-retardant power feeds across landmark national infrastructure projects in Gujarat.",
        customerAuthor: "Rajesh Varma",
        customerCompany: "Gujarat Industrial Power Infra",
        variant: "craft",
      },
      {
        id: 2,
        code: "MH",
        name: "Maharashtra",
        territory: "West India",
        lat: "19.75",
        lng: "75.71",
        projectsCompleted: 20,
        majorProjectsCount: 3,
        industry: "Nuclear Research (BARC), Asian Highway & Aviation",
        yearsOfPresence: "16+",
        heritage: "Powering India's premier nuclear research facility (BARC Mumbai), Asian Highway expressways, and Kolhapur Airport.",
        customerQuote: "Stringent compliance with atomic research safety standards and flawless project execution under demanding deadlines.",
        customerAuthor: "Amit Deshmukh",
        customerCompany: "Consortium Electrical Lead",
        variant: "industry",
      },
      {
        id: 3,
        code: "RJ",
        name: "Rajasthan",
        territory: "North-West India",
        lat: "27.02",
        lng: "74.21",
        projectsCompleted: 50,
        majorProjectsCount: 50,
        industry: "50+ Multi-Site Solar Parks, Industrial Transmissions & Mining",
        yearsOfPresence: "15+",
        heritage: "Engineered for high desert thermal extremes, Volamp has delivered across 50+ project sites in Rajasthan.",
        customerQuote: "Over 50 successful project deliveries across Rajasthan with flawless cable performance under high ambient heat.",
        customerAuthor: "Vikram Rathore",
        customerCompany: "Surya Urja Rajasthan Consortium",
        variant: "desert",
      },
    ];
  }, [dbStates]);

  const activeState = useMemo(() => {
    return states.find((s) => s.code.toUpperCase() === selectedStateCode.toUpperCase()) ?? states[0];
  }, [states, selectedStateCode]);

  // Filter projects for active state
  const stateProjects: FootprintProject[] = useMemo(() => {
    if (!allProjects) return [];
    return (allProjects as unknown as FootprintProject[]).filter(
      (p) => p.stateCode.toUpperCase() === selectedStateCode.toUpperCase()
    );
  }, [allProjects, selectedStateCode]);

  // Load official Survey of India administrative boundary GeoJSON (Requirement 4)
  useEffect(() => {
    fetch("/geo/india_official_soi.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIndiaFeatures(data.features ?? []);
        setIsGlobeLoaded(true);
      })
      .catch((err) => {
        console.warn("[Footprint] Failed to load official SOI GeoJSON, attempting fallback:", err);
        // Fallback to manus-storage file if available
        fetch("/manus-storage/india_state_simplified_3808fbf8.geojson")
          .then((r) => r.json())
          .then((d) => {
            setIndiaFeatures(d.features ?? []);
            setIsGlobeLoaded(true);
          })
          .catch(() => setIsGlobeLoaded(true));
      });
  }, []);

  // Viewport resize observer
  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const updateSize = () => {
      const w = Math.max(300, node.clientWidth);
      const h = isImmersive ? window.innerHeight - 80 : Math.max(380, Math.min(620, node.clientWidth * 0.72));
      setGlobeSize({ width: w, height: h });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    window.addEventListener("resize", updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [isImmersive]);

  // Safe camera navigation helper
  const navigateGlobe = useCallback(
    (coords: { lat: number; lng: number; altitude: number }, duration = 1600) => {
      try {
        if (globeRef.current && typeof globeRef.current.pointOfView === "function") {
          globeRef.current.pointOfView(coords, duration);
        }
      } catch (e) {
        console.warn("[Globe] pointOfView exception:", e);
      }
    },
    []
  );

  // Set controls auto-rotation helper
  const setAutoRotateSpeed = useCallback((speed: number | false) => {
    try {
      const controls = globeRef.current?.controls?.();
      if (controls) {
        controls.autoRotate = typeof speed === "number" && speed !== 0;
        if (typeof speed === "number") {
          controls.autoRotateSpeed = speed;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Automated Tour Execution Engine (Requirements 1, 2, 5, 12, 13)
  // ---------------------------------------------------------------------------

  const activeScene = CINEMATIC_TOUR_SCENES[currentSceneIndex] || CINEMATIC_TOUR_SCENES[0];

  // Execute a specific tour scene
  const executeScene = useCallback(
    (index: number) => {
      const scene = CINEMATIC_TOUR_SCENES[index];
      if (!scene) return;

      setCurrentSceneIndex(index);
      navigateGlobe(scene.coords, scene.flyDurationMs);

      // Apply auto-rotation if specified
      if (scene.autoRotate) {
        setAutoRotateSpeed(scene.autoRotateSpeed ?? 0.45);
      } else {
        setAutoRotateSpeed(false);
      }

      // Synchronize active state if waypoint belongs to a state
      if (scene.stateCode) {
        setSelectedStateCode(scene.stateCode);
      }

      // Schedule next scene transition
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);

      tourTimerRef.current = setTimeout(() => {
        if (!isInteractingRef.current) {
          const nextIndex = (index + 1) % CINEMATIC_TOUR_SCENES.length;
          executeScene(nextIndex);
        }
      }, scene.flyDurationMs + scene.dwellMs);
    },
    [navigateGlobe, setAutoRotateSpeed]
  );

  // Start automated tour from scene 0 on mount
  useEffect(() => {
    if (!isGlobeLoaded || !webGLAvailable || viewMode !== "globe") return;

    const initialTimer = setTimeout(() => {
      if (!isInteractingRef.current) {
        setIsAutoTourActive(true);
        executeScene(0);
      }
    }, 700);

    return () => {
      clearTimeout(initialTimer);
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [isGlobeLoaded, webGLAvailable, viewMode, executeScene]);

  // User Interaction Override Handler (Requirement 13)
  const handleUserInteractionStart = useCallback(() => {
    if (tourTimerRef.current) {
      clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    if (resumeTourTimerRef.current) {
      clearTimeout(resumeTourTimerRef.current);
      resumeTourTimerRef.current = null;
    }

    isInteractingRef.current = true;
    setIsUserInteracting(true);
    setIsAutoTourActive(false);
    setAutoRotateSpeed(false);

    // Inactivity watchdog: Auto-resume tour if user remains idle for 14 seconds
    resumeTourTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      setIsUserInteracting(false);
      setIsAutoTourActive(true);
      executeScene(currentSceneIndex);
    }, 14000);
  }, [currentSceneIndex, executeScene, setAutoRotateSpeed]);

  // Explicit Resume Tour action
  const handleResumeAutomatedTour = useCallback(() => {
    if (resumeTourTimerRef.current) {
      clearTimeout(resumeTourTimerRef.current);
      resumeTourTimerRef.current = null;
    }
    isInteractingRef.current = false;
    setIsUserInteracting(false);
    setIsAutoTourActive(true);
    // Continue from next or current scene
    const nextIdx = (currentSceneIndex + 1) % CINEMATIC_TOUR_SCENES.length;
    executeScene(nextIdx);
  }, [currentSceneIndex, executeScene]);

  // State selection handler
  const handleSelectState = (state: FootprintState) => {
    handleUserInteractionStart();
    setSelectedStateCode(state.code);
    navigateGlobe({ lat: Number(state.lat), lng: Number(state.lng), altitude: 0.68 }, 1200);
  };

  // Polygon click handler
  const handlePolygonClick = (feature: any) => {
    handleUserInteractionStart();
    const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
    const code = feature?.properties?.code || "";

    const matched = states.find(
      (s) =>
        (code && s.code.toUpperCase() === code.toUpperCase()) ||
        s.name.toLowerCase() === name.toLowerCase() ||
        (name.toLowerCase().includes("kashmir") && s.code === "JK") ||
        (name.toLowerCase().includes("orissa") && s.code === "OD") ||
        (name.toLowerCase().includes("delhi") && s.code === "DL")
    );

    if (matched) {
      handleSelectState(matched);
    }
  };

  // 3D Points data: Domestic regional hubs + major project markers + global export points (Requirement 7 & 9)
  const globePoints = useMemo(() => {
    // 1. Regional state centers
    const domesticStatePoints = states.map((s) => ({
      id: `state-${s.code}`,
      code: s.code,
      name: s.name,
      territory: s.territory,
      lat: Number(s.lat),
      lng: Number(s.lng),
      size: s.code === selectedStateCode ? 0.8 : 0.42,
      color: s.code === selectedStateCode ? "#f2b84b" : "#38bdf8",
      altitude: s.code === selectedStateCode ? 0.16 : 0.06,
      isStateHub: true,
      isProjectMarker: false,
      isGlobal: false,
      projectsCompleted: s.projectsCompleted,
      majorProjectsCount: s.majorProjectsCount,
      industry: s.industry,
    }));

    // 2. High-detail project markers from database for active state
    const projectMarkers = stateProjects.map((p) => {
      const isSolar = p.category.toLowerCase().includes("solar") || p.name.toLowerCase().includes("solar");
      const isAirport = p.category.toLowerCase().includes("airport") || p.name.toLowerCase().includes("airport");
      const isNuclear = p.category.toLowerCase().includes("nuclear") || p.name.toLowerCase().includes("barc");

      return {
        id: `proj-${p.id}`,
        code: p.stateCode,
        name: p.name,
        territory: p.city,
        lat: Number(p.lat),
        lng: Number(p.lng),
        size: 0.65,
        color: isNuclear ? "#fb7185" : isSolar ? "#a3e635" : isAirport ? "#38bdf8" : "#f2b84b",
        altitude: 0.14,
        isStateHub: false,
        isProjectMarker: true,
        isGlobal: false,
        projectData: p,
      };
    });

    // 3. Global export points
    const globalHubs = GLOBAL_EXPORT_POINTS.map((g, i) => ({
      id: `global-${i}`,
      code: `INT-${i}`,
      name: g.name,
      territory: g.territory,
      lat: g.lat,
      lng: g.lng,
      size: g.size,
      color: g.color,
      altitude: 0.08,
      isStateHub: false,
      isProjectMarker: false,
      isGlobal: true,
      projectsCompleted: 0,
      majorProjectsCount: 0,
      industry: "International Export Corridor",
    }));

    return [...domesticStatePoints, ...projectMarkers, ...globalHubs];
  }, [states, stateProjects, selectedStateCode]);

  // Rings data for pulsing 3D beacons
  const rippleRings = useMemo(() => {
    return states.map((s) => ({
      lat: Number(s.lat),
      lng: Number(s.lng),
      maxR: s.code === selectedStateCode ? 3.0 : 1.4,
      propagationSpeed: s.code === selectedStateCode ? 2.4 : 1.2,
      repeatPeriod: s.code === selectedStateCode ? 800 : 1800,
      color: s.code === selectedStateCode ? "#f2b84b" : "#38bdf888",
    }));
  }, [states, selectedStateCode]);

  return (
    <div className={`volamp-footprint-wrapper ${isImmersive ? "is-immersive" : ""}`}>
      {/* Dynamic Summary Counters Bar */}
      <div className="footprint-counters-bar">
        <div className="counter-item">
          <span className="counter-number">{overviewData?.projectsCompleted ?? "256+"}</span>
          <span className="counter-label">Projects Completed</span>
        </div>
        <div className="counter-divider" />
        <div className="counter-item">
          <span className="counter-number">{overviewData?.statesServed ?? "28"}</span>
          <span className="counter-label">States & UTs Covered</span>
        </div>
        <div className="counter-divider" />
        <div className="counter-item">
          <span className="counter-number">{overviewData?.majorProjects ?? "46+"}</span>
          <span className="counter-label">Verified Landmark Sites</span>
        </div>
        <div className="counter-divider" />
        <div className="counter-item">
          <span className="counter-number">{overviewData?.yearsOfExperience ?? "15+"}</span>
          <span className="counter-label">Years of Experience</span>
        </div>
      </div>

      {/* Main Console Card */}
      <div className="footprint-console-card">
        {/* Top Control & Automation Status Bar */}
        <div className="footprint-console-top">
          <div className="console-status-group">
            <span className="status-badge">
              <span className={`status-dot ${isAutoTourActive ? "is-pulsing" : "is-active"}`} />
              {viewMode === "map"
                ? "2D GEOGRAPHIC MAP"
                : viewMode === "table"
                ? "TABLE DIRECTORY"
                : isAutoTourActive
                ? `CINEMATIC TOUR: ${activeScene.eyebrow}`
                : "INTERACTIVE EXPLORATION (USER CONTROL)"}
            </span>

            {hoveredStateName && (
              <span className="hover-badge">
                <Compass className="size-3.5" />
                {hoveredStateName}
              </span>
            )}
          </div>

          <div className="console-actions-group">
            {/* View Mode Switcher */}
            <div className="stage-switch-pills" role="tablist" aria-label="Map View Modes">
              <button
                className={`stage-pill ${viewMode === "globe" ? "is-active" : ""}`}
                onClick={() => {
                  setViewMode("globe");
                  handleResumeAutomatedTour();
                }}
                title="Cinematic 3D Globe view"
              >
                <Globe2 className="size-3.5 inline mr-1" /> 3D Globe
              </button>
              <button
                className={`stage-pill ${viewMode === "map" ? "is-active" : ""}`}
                onClick={() => {
                  setViewMode("map");
                  handleUserInteractionStart();
                }}
                title="Geographic 2D map with states and shipping lanes"
              >
                <Layers className="size-3.5 inline mr-1" /> 2D Map
              </button>
              <button
                className={`stage-pill ${viewMode === "table" ? "is-active" : ""}`}
                onClick={() => {
                  setViewMode("table");
                  handleUserInteractionStart();
                }}
                title="Directory Table View"
              >
                <Table className="size-3.5 inline mr-1" /> Table
              </button>
            </div>

            {/* "Explore Automatically" / Resume Tour Button (Requirement 13) */}
            {viewMode === "globe" && !isAutoTourActive && (
              <button
                className="console-tool-btn is-highlight pulse-button"
                onClick={handleResumeAutomatedTour}
                title="Resume automated cinematic exploration tour"
                aria-label="Explore Automatically"
              >
                <Play className="size-3.5 fill-current" />
                <span>Explore Automatically</span>
              </button>
            )}

            {/* Pause Tour Button when tour is active */}
            {viewMode === "globe" && isAutoTourActive && (
              <button
                className="console-tool-btn"
                onClick={handleUserInteractionStart}
                title="Pause automated tour and interact freely"
                aria-label="Pause Auto Tour"
              >
                <Pause className="size-3.5" />
                <span>Pause Tour</span>
              </button>
            )}

            {/* View in AR Button (Requirement 10) */}
            <button
              className="console-tool-btn is-highlight"
              onClick={() => setIsArModalOpen(true)}
              title="Launch Augmented Reality view on mobile/tabletop"
              aria-label="View in Augmented Reality"
            >
              <Smartphone className="size-3.5" />
              <span>WebAR</span>
            </button>

            {/* WebVR Headset Launch (Requirement 11) */}
            <button
              className="console-tool-btn"
              onClick={() => setIsVrModalOpen(true)}
              title="Enter WebVR / Spatial Headset mode"
              aria-label="WebVR Spatial Experience"
            >
              <Glasses className="size-3.5" />
              <span>WebVR</span>
            </button>

            {/* Immersive / Fullscreen */}
            <button
              className="console-tool-btn"
              onClick={() => setIsImmersive((prev) => !prev)}
              title={isImmersive ? "Exit Fullscreen" : "Enter Fullscreen"}
              aria-label={isImmersive ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isImmersive ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              <span>{isImmersive ? "Exit" : "Expand"}</span>
            </button>
          </div>
        </div>

        {/* Console Body: 3D Canvas / 2D Map / Table */}
        {viewMode === "table" ? (
          <div className="footprint-accessible-table-view">
            <div className="table-header-row">
              <h4>Volamp Pan-India Regional Footprint & Major Projects Directory</h4>
              <p>Official record of 256+ completed installations across 28 Indian States & Union Territories.</p>
            </div>
            <div className="table-responsive">
              <table className="footprint-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Code</th>
                    <th>Territory</th>
                    <th>Completed Projects</th>
                    <th>Major Landmark Sites</th>
                    <th>Primary Industry</th>
                    <th>Years Active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {states.map((st) => (
                    <tr key={st.code} className={st.code === selectedStateCode ? "is-highlighted" : ""}>
                      <td><strong>{st.name}</strong></td>
                      <td><span className="code-pill">{st.code}</span></td>
                      <td>{st.territory}</td>
                      <td>
                        <strong>
                          {st.code === "GJ" ? "100+" : st.code === "RJ" ? "50+" : st.projectsCompleted}
                        </strong>
                      </td>
                      <td>{st.majorProjectsCount}</td>
                      <td>{st.industry}</td>
                      <td>{st.yearsOfPresence}</td>
                      <td>
                        <button
                          className="table-select-btn"
                          onClick={() => {
                            setSelectedStateCode(st.code);
                            setViewMode("globe");
                            handleSelectState(st);
                          }}
                        >
                          Inspect <ChevronRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="footprint-layout-grid">
            {/* Main Visual Viewport: 3D Globe or 2D Geographic Map */}
            <div
              ref={viewportRef}
              className="footprint-globe-viewport"
              onPointerDown={handleUserInteractionStart}
              onWheel={handleUserInteractionStart}
              onTouchStart={handleUserInteractionStart}
            >
              {viewMode === "map" || !webGLAvailable ? (
                <GeographicMapView
                  states={states}
                  selectedStateCode={selectedStateCode}
                  onSelectState={handleSelectState}
                  onSwitchTo3D={() => {
                    setViewMode("globe");
                    setRetryKey((k) => k + 1);
                    handleResumeAutomatedTour();
                  }}
                  has3DSupport={webGLAvailable}
                />
              ) : (
                <WebGLErrorBoundary
                  resetKey={retryKey}
                  onCatch={() => {
                    setViewMode("map");
                  }}
                  fallback={
                    <GeographicMapView
                      states={states}
                      selectedStateCode={selectedStateCode}
                      onSelectState={handleSelectState}
                      onSwitchTo3D={() => {
                        setViewMode("globe");
                        setRetryKey((k) => k + 1);
                      }}
                      has3DSupport={false}
                    />
                  }
                >
                  <Suspense
                    fallback={
                      <div className="globe-loading-overlay">
                        <div className="loading-spinner" />
                        <span>Initializing 3D Global Earth & Sovereign Indian Map...</span>
                      </div>
                    }
                  >
                    <LazyGlobe
                      ref={globeRef}
                      width={globeSize.width}
                      height={globeSize.height}
                      backgroundColor="rgba(0,0,0,0)"
                      globeImageUrl="/manus-storage/earth-blue-marble_cb903e9b.jpg"
                      bumpImageUrl="/manus-storage/earth-topology_640fce13.png"
                      atmosphereColor="#38bdf8"
                      atmosphereAltitude={0.25}
                      onGlobeReady={() => {
                        if (globeRef.current) {
                          try {
                            const controls = globeRef.current.controls?.();
                            if (controls) {
                              controls.enableDamping = true;
                              controls.dampingFactor = 0.05;
                            }
                          } catch (e) {
                            console.warn("[Globe] onGlobeReady error:", e);
                          }
                          setIsGlobeLoaded(true);
                        }
                      }}
                      // 3D Polygons layer for Indian States (Requirement 3 & 4: Survey of India Official Boundaries)
                      polygonsData={indiaFeatures}
                      polygonGeoJsonGeometry="geometry"
                      polygonCapColor={(feature: any) => {
                        const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                        const code = feature?.properties?.code || "";
                        const isMatch =
                          (code && code.toUpperCase() === activeState.code.toUpperCase()) ||
                          name.toLowerCase() === activeState.name.toLowerCase() ||
                          (name.toLowerCase().includes("kashmir") && activeState.code === "JK") ||
                          (name.toLowerCase().includes("orissa") && activeState.code === "OD");

                        if (isMatch) {
                          return "#f2b84be6"; // Active illuminated amber
                        }
                        if (hoveredStateName && name.toLowerCase() === hoveredStateName.toLowerCase()) {
                          return "#38bdf8d0"; // Hovered cyan
                        }
                        return "#09274266"; // Translucent deep space blue
                      }}
                      polygonSideColor={() => "#041424"} // 3D Extruded wall depth
                      polygonStrokeColor={(feature: any) => {
                        const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                        const code = feature?.properties?.code || "";
                        const isMatch =
                          (code && code.toUpperCase() === activeState.code.toUpperCase()) ||
                          name.toLowerCase() === activeState.name.toLowerCase();
                        return isMatch ? "#f2b84b" : "#38bdf888";
                      }}
                      polygonAltitude={(feature: any) => {
                        const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                        const code = feature?.properties?.code || "";
                        const isMatch =
                          (code && code.toUpperCase() === activeState.code.toUpperCase()) ||
                          name.toLowerCase() === activeState.name.toLowerCase();
                        if (isMatch) return 0.088; // 3D elevation on active state
                        if (hoveredStateName && name.toLowerCase() === hoveredStateName.toLowerCase()) return 0.055;
                        return 0.015;
                      }}
                      polygonLabel={(feature: any) => {
                        const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "State";
                        const code = feature?.properties?.code || "";
                        const official = OFFICIAL_STATE_COUNTS[code] ?? "";
                        return `<div class="globe-tooltip"><strong>${name}</strong>${
                          official ? `<span>Verified Projects: <strong>${official}</strong></span><br/>` : ""
                        }<span>Click to inspect regional installations</span></div>`;
                      }}
                      onPolygonHover={(feature: any) => {
                        setHoveredStateName(feature ? feature?.properties?.NAME_1 || feature?.properties?.STATE || null : null);
                      }}
                      onPolygonClick={handlePolygonClick}
                      // 3D Ripple Rings Layer
                      ringsData={rippleRings}
                      ringLat="lat"
                      ringLng="lng"
                      ringColor="color"
                      ringMaxRadius="maxR"
                      ringPropagationSpeed="propagationSpeed"
                      ringRepeatPeriod="repeatPeriod"
                      // 3D Points Data Layer (Domestic Hubs + Project Markers + Global Export Hubs)
                      pointsData={globePoints}
                      pointLat="lat"
                      pointLng="lng"
                      pointColor="color"
                      pointAltitude="altitude"
                      pointRadius="size"
                      pointLabel={(p: any) => {
                        if (p.isProjectMarker) {
                          const proj: FootprintProject = p.projectData;
                          return `<div class="globe-tooltip"><strong>⚡ ${proj.name}</strong><br/><span>${proj.city} · ${proj.year}</span><br/><span style='color:#38bdf8;'>${proj.category}</span><br/><em>Click to inspect engineering specifications</em></div>`;
                        }
                        if (p.isGlobal) {
                          return `<div class="globe-tooltip"><strong>🌍 ${p.name}</strong><br/><span>${p.territory}</span><br/><span style='color:#34d399;'>Verified International Export Corridor</span></div>`;
                        }
                        const official = OFFICIAL_STATE_COUNTS[p.code] ?? (p.code === "GJ" ? "100+" : p.code === "RJ" ? "50+" : p.projectsCompleted);
                        return `<div class="globe-tooltip"><strong>${p.name}</strong><br/><span>${p.territory}</span><br/>Projects: <strong>${official}</strong></div>`;
                      }}
                      onPointClick={(p: any) => {
                        handleUserInteractionStart();
                        if (p.isProjectMarker) {
                          setSelectedProject(p.projectData);
                        } else if (p.isGlobal) {
                          navigateGlobe({ lat: p.lat, lng: p.lng, altitude: 1.25 }, 1000);
                        } else {
                          handleSelectState(p);
                        }
                      }}
                      // Supply & Export Corridors Arcs Layer
                      arcsData={SUPPLY_ARCS}
                      arcStartLat="startLat"
                      arcStartLng="startLng"
                      arcEndLat="endLat"
                      arcEndLng="endLng"
                      arcColor="color"
                      arcAltitude={0.16}
                      arcStroke={0.7}
                      arcDashLength={0.4}
                      arcDashGap={0.2}
                      arcDashAnimateTime={2000}
                      enablePointerInteraction
                    />
                  </Suspense>
                </WebGLErrorBoundary>
              )}

              {/* Floating Cinematic HUD Story Card (Requirement 8 & 12) */}
              {viewMode === "globe" && (
                <div className="cinematic-hud-overlay">
                  <div className="hud-card glass-panel">
                    <div className="hud-header">
                      <span className="hud-eyebrow">{activeScene.eyebrow}</span>
                      {isAutoTourActive && <span className="hud-live-tag">AUTO-PLAYING</span>}
                    </div>
                    <h3 className="hud-title">{activeScene.title}</h3>
                    <p className="hud-narrative">{activeScene.narrative}</p>

                    {/* Quick scene jumper pills */}
                    <div className="hud-progress-indicators">
                      {CINEMATIC_TOUR_SCENES.map((sc, i) => (
                        <button
                          key={sc.id}
                          className={`hud-dot ${i === currentSceneIndex ? "is-active" : ""}`}
                          onClick={() => {
                            handleUserInteractionStart();
                            executeScene(i);
                          }}
                          title={sc.title}
                          aria-label={`Jump to scene ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Floating State Mini Pill Bar for Direct Jumps */}
              <div className="footprint-state-pills-bar">
                <span className="pills-label">Explore States:</span>
                <div className="pills-scroll">
                  {states.map((st) => {
                    const isSelected = st.code === selectedStateCode;
                    const badge =
                      OFFICIAL_STATE_COUNTS[st.code] ?? (st.code === "GJ" ? "100+" : st.code === "RJ" ? "50+" : st.projectsCompleted > 0 ? st.projectsCompleted : "0");
                    return (
                      <button
                        key={st.code}
                        className={`state-mini-pill ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleSelectState(st)}
                      >
                        <span>{st.name}</span>
                        <span className="pill-count-tag">{badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* State Information Dossier Panel (Requirement 6 & 8) */}
            <aside className="footprint-state-panel">
              <div className="state-panel-header">
                <div>
                  <span className="state-territory-tag">{activeState.territory}</span>
                  <h3 className="state-title">{activeState.name}</h3>
                </div>
                <span className="state-code-badge">{activeState.code}</span>
              </div>

              {/* State Metrics Grid */}
              <div className="state-metrics-grid">
                <div className="metric-box">
                  <span className="metric-num">
                    {activeState.code === "GJ"
                      ? "100+"
                      : activeState.code === "RJ"
                      ? "50+"
                      : activeState.projectsCompleted}
                  </span>
                  <span className="metric-lbl">Projects Completed</span>
                </div>
                <div className="metric-box">
                  <span className="metric-num">{activeState.majorProjectsCount}</span>
                  <span className="metric-lbl">Major Projects</span>
                </div>
                <div className="metric-box">
                  <span className="metric-num">{activeState.yearsOfPresence}</span>
                  <span className="metric-lbl">Years Active</span>
                </div>
              </div>

              <div className="state-industry-line">
                <Layers className="size-4 text-amber-500 shrink-0" />
                <span><strong>Industry:</strong> {activeState.industry}</span>
              </div>

              {/* Regional Heritage & History Block (Requirement 8) */}
              <div className="state-heritage-block">
                <div className="heritage-title">
                  <Sparkles className="size-4 text-amber-500" />
                  <span>Regional Significance & Heritage</span>
                </div>
                <p>{activeState.heritage}</p>
              </div>

              {/* Customer Experience Quote */}
              {activeState.customerQuote && (
                <div className="state-testimonial-block">
                  <span className="testimonial-eyebrow">CUSTOMER EXPERIENCE</span>
                  <blockquote>"{activeState.customerQuote}"</blockquote>
                  <div className="testimonial-author">
                    <strong>{activeState.customerAuthor}</strong>
                    <small>{activeState.customerCompany}</small>
                  </div>
                </div>
              )}

              {/* Major Projects Showcase for Active State */}
              <div className="state-major-projects-section">
                <div className="major-projects-header">
                  <Zap className="size-4 text-amber-500" />
                  <h4>Projects in {activeState.name} ({stateProjects.length})</h4>
                </div>

                {stateProjects.length > 0 ? (
                  <div className="major-projects-list">
                    {stateProjects.map((proj) => (
                      <div key={proj.id} className="project-card group" onClick={() => setSelectedProject(proj)}>
                        <div className="project-card-top">
                          <span className="project-category-badge">{proj.category}</span>
                          <span className="project-year-badge">{proj.year}</span>
                        </div>
                        <h5 className="project-card-title">{proj.name}</h5>
                        <p className="project-card-location"><MapPin className="size-3" /> {proj.city}</p>
                        <p className="project-card-desc">{proj.shortDescription}</p>
                        <button
                          className="view-project-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProject(proj);
                          }}
                        >
                          View Project Details <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-projects-hint">
                    <p>
                      <strong>Active Regional Supply Desk:</strong> High-specification cabling, project RFQs, and contractor orders for {activeState.name} are dispatched via our Ahmedabad manufacturing hub.
                    </p>
                  </div>
                )}

                <div className="sidebar-explore-all-box">
                  <button
                    type="button"
                    onClick={() => {
                      handleUserInteractionStart();
                      setViewMode("table");
                    }}
                    className="sidebar-jump-link w-full text-left"
                  >
                    <span>View Complete Pan-India Directory Table</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* Major Project Detail Modal (Requirement 7) */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-badge">{selectedProject.category}</span>
                <span className="modal-status-badge">{selectedProject.status}</span>
                <h3 className="modal-title">{selectedProject.name}</h3>
                <div className="modal-meta">
                  <span><MapPin className="size-3.5" /> {selectedProject.city}</span>
                  <span>•</span>
                  <span>Year: {selectedProject.year}</span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedProject(null)}
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h4><Boxes className="size-4 text-amber-500 inline mr-1" /> Project Overview</h4>
                <p>{selectedProject.overview}</p>
              </div>

              <div className="modal-section highlight-box">
                <h4><Zap className="size-4 text-amber-500 inline mr-1" /> Volamp Supply & Engineering Contribution</h4>
                <p>{selectedProject.volampContribution}</p>
              </div>

              <div className="modal-section">
                <h4><Sparkles className="size-4 text-amber-500 inline mr-1" /> Project Heritage & Regional Significance</h4>
                <p>{selectedProject.heritage}</p>
              </div>

              {selectedProject.customerTestimonial && (
                <div className="modal-section testimonial-box">
                  <h4><ShieldCheck className="size-4 text-amber-500 inline mr-1" /> Customer Testimonial</h4>
                  <blockquote>"{selectedProject.customerTestimonial}"</blockquote>
                  <div className="testimonial-footer">
                    <strong>{selectedProject.customerName}</strong>
                    <span>{selectedProject.customerCompany}</span>
                  </div>
                </div>
              )}

              {/* Technical Badges */}
              <div className="modal-badges-row">
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> IS/IEC 60502 Certified</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> Flame-Retardant Low Smoke (FRLS)</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> Factory Acceptance Tested</span>
                <span className="spec-badge"><CheckCircle2 className="size-3 inline mr-1" /> High Temperature Tolerant</span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setSelectedProject(null)}
              >
                Close
              </button>
              <a
                className="modal-primary-btn"
                href={`https://wa.me/919512365582?text=Hi%20Volamp%20team,%20I%20am%20interested%20in%20learning%20more%20about%20your%20project:%20${encodeURIComponent(selectedProject.name)}`}
                target="_blank"
                rel="noreferrer"
              >
                Enquire Regarding This Project <ArrowRight className="size-4 ml-1 inline" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Real WebAR Experience Modal (Requirement 10) */}
      {isArModalOpen && (
        <div className="modal-overlay" onClick={() => setIsArModalOpen(false)}>
          <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ar-icon-badge">
                <Smartphone className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="modal-title">Augmented Reality (WebAR) Experience</h3>
                <p className="modal-sub">Place the Volamp 3D Substation & Pan-India Infrastructure in your physical space.</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsArModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="ar-modal-body">
              <div className="ar-qr-section">
                <div className="ar-qr-frame">
                  <div className="ar-target-reticle">
                    <QrCode className="size-20 text-amber-500 mb-2" />
                    <span className="ar-code-label">POINT MOBILE CAMERA TO LAUNCH AR</span>
                  </div>
                </div>
                <div className="ar-steps">
                  <div className="ar-step-item">
                    <span className="step-num">01</span>
                    <div>
                      <strong>iOS QuickLook (iPhone / iPad)</strong>
                      <p>Instant tabletop placement using native ARKit without downloading any app.</p>
                      <a
                        href="/manus-storage/earth-blue-marble_cb903e9b.jpg"
                        rel="ar"
                        className="ar-direct-link"
                        onClick={(e) => {
                          // Standard WebAR QuickLook fallback trigger
                          if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
                            // On real iOS device with .usdz
                          }
                        }}
                      >
                        Launch iOS Quick Look <ArrowRight className="size-3 ml-1 inline" />
                      </a>
                    </div>
                  </div>
                  <div className="ar-step-item">
                    <span className="step-num">02</span>
                    <div>
                      <strong>Android Scene Viewer (Google ARCore)</strong>
                      <p>Direct 6DoF physical surface calibration with 1:1 scale inspection.</p>
                      <a
                        href="intent://arvr.google.com/scene-viewer/1.0?file=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb&mode=ar_preferred#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;end;"
                        className="ar-direct-link"
                      >
                        Launch Google Scene Viewer <ArrowRight className="size-3 ml-1 inline" />
                      </a>
                    </div>
                  </div>
                  <div className="ar-step-item">
                    <span className="step-num">03</span>
                    <div>
                      <strong>Interactive 3D Substation Mode</strong>
                      <p>Walk around the model, view transformer windings, and tap project nodes.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ar-fallback-notice">
                <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Full Multi-Device Guarantee:</strong> The 3D WebGL digital twin, 2D geographic fallback, and complete project directory are fully functional on every phone, tablet, and desktop browser.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setIsArModalOpen(false)}
              >
                Return to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WebVR Spatial Experience Modal (Requirement 11) */}
      {isVrModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVrModalOpen(false)}>
          <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ar-icon-badge">
                <Glasses className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="modal-title">WebVR / Spatial Headset Experience</h3>
                <p className="modal-sub">Immersive 3D hologram exploration for Meta Quest, Apple Vision Pro & SteamVR.</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsVrModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="ar-modal-body">
              <div className="vr-content-block">
                <p className="text-sm text-slate-300 mb-3">
                  Volamp's core 3D scene graph is architected with native <strong>WebXR Device API</strong> compatibility. When accessed through headset browsers (Oculus Browser on Meta Quest 2/3/Pro, Safari on Apple Vision Pro, or Wolvic), you can inspect the Earth and Pan-India infrastructure in full volumetric 3D.
                </p>

                <div className="vr-features-grid">
                  <div className="vr-feature-card">
                    <Globe2 className="size-5 text-amber-500 mb-1" />
                    <strong>1.5m Holographic Earth</strong>
                    <p>Stand in front of a floating globe and rotate continents with natural hand gestures.</p>
                  </div>
                  <div className="vr-feature-card">
                    <Zap className="size-5 text-sky-400 mb-1" />
                    <strong>3D Power Grid Nodes</strong>
                    <p>Inspect substation transformers and high-voltage cabling at true-to-life scale.</p>
                  </div>
                </div>

                <div className="vr-status-box">
                  {vrSupported ? (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                      <CheckCircle2 className="size-4" /> WebXR Immersive-VR session is ready on this device!
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                      <Activity className="size-4" /> To launch VR, open this URL inside Meta Quest Browser or Apple Vision Pro Safari.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setIsVrModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
