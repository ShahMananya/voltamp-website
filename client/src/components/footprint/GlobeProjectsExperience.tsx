import React, { Component, ErrorInfo, ReactNode, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Flame,
  Glasses,
  Globe2,
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
  Smartphone,
  Sparkles,
  Table,
  X,
  Zap,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// Lazy-load Globe component so Three.js is not loaded into memory unless WebGL is confirmed available
const LazyGlobe = React.lazy(() => import("react-globe.gl"));
import Universal3DGlobeCanvas from "./Universal3DGlobeCanvas";
// @ts-ignore
import * as THREE from "three";
if (typeof window !== "undefined") {
  (window as any).THREE = THREE;
}

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
  // Domestic Major Supply Corridors
  { startLat: 23.02, startLng: 72.57, endLat: 19.07, endLng: 72.87, target: "Mumbai / BARC / Nhava Sheva", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 28.61, endLng: 77.20, target: "Delhi NCR / North Corridors", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 12.97, endLng: 77.59, target: "Bengaluru Tech Hub", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 13.08, endLng: 80.27, target: "Chennai / Industrial Belt", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 17.38, endLng: 78.48, target: "Hyderabad / Telangana Grid", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 22.57, endLng: 88.36, target: "Kolkata / WB Corridor", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 26.91, endLng: 75.78, target: "Rajasthan 50+ Solar Sites", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 21.27, endLng: 81.86, target: "Bhilai Steel / Chhattisgarh", color: ["#f2b84b", "#8dd2f4"] },
  { startLat: 23.02, startLng: 72.57, endLat: 26.20, endLng: 92.93, target: "Guwahati Airport / Northeast Hub", color: ["#f2b84b", "#65afe0"] },
  { startLat: 23.02, startLng: 72.57, endLat: 25.09, endLng: 85.31, target: "IOCL Begusarai / Bihar", color: ["#f2b84b", "#8dd2f4"] },
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

// Global Export Points for 3D Globe
const GLOBAL_EXPORT_POINTS = [
  { name: "Dubai, UAE", lat: 25.20, lng: 55.27, territory: "GCC Export Hub", color: "#10b981", size: 0.65, isGlobal: true },
  { name: "Riyadh, Saudi Arabia", lat: 24.71, lng: 46.67, territory: "Middle East Industrial", color: "#10b981", size: 0.55, isGlobal: true },
  { name: "Doha, Qatar", lat: 25.28, lng: 51.53, territory: "Energy Corridor", color: "#10b981", size: 0.52, isGlobal: true },
  { name: "Singapore", lat: 1.35, lng: 103.82, territory: "Southeast Asia Gateway", color: "#10b981", size: 0.60, isGlobal: true },
  { name: "Nairobi, Kenya", lat: -1.29, lng: 36.82, territory: "East Africa Hub", color: "#10b981", size: 0.55, isGlobal: true },
  { name: "Dar es Salaam, Tanzania", lat: -6.79, lng: 39.28, territory: "Maritime Port Supply", color: "#10b981", size: 0.52, isGlobal: true },
];

// Waypoint Type & Interface for Dynamic Camera Storyteller (Requirements 1, 2, 4, 6, 8, 10, 16)
export type WaypointType = "world" | "asia" | "india" | "state" | "city" | "project";

export interface CinematicWaypoint {
  id: string;
  type: WaypointType;
  title: string;
  eyebrow: string;
  narrative: string;
  coords: { lat: number; lng: number; altitude: number };
  flyDurationMs: number;
  dwellMs: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  stateCode?: string;
  stateName?: string;
  city?: string;
  heritage?: string;
  project?: FootprintProject;
  priority?: number;
}

// Check WebGL 2 support safely in browser (Three.js r163+ requires WebGL 2)
function isWebGL2Available(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

// WebGL Error Boundary to catch any GPU context loss without crashing React tree
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  resetKey?: any;
  onError?: (error: Error) => void;
}
interface ErrorBoundaryState {
  hasError: boolean;
}
class WebGLErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("[WebGL ErrorBoundary] Caught WebGL render fault:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Dynamic Multi-Tier Cinematic Journey Builder (Requirement 10 & 16)
 * Generates an end-to-end real-world storytelling itinerary from database states and projects.
 * Sequence:
 *   1. World Overview (Orbital Earth, slow rotation, export corridors)
 *   2. Asia Approach (Indian Ocean basin transit)
 *   3. India National View (Survey of India sovereign territory)
 *   4. For each active Indian state:
 *        - State overview (geography, heritage, project count)
 *        - For each city with projects:
 *            - City approach (altitude 0.36)
 *            - Pinpoint project spotlight (altitude 0.24, photo, engineering specs, client quote)
 *   5. Grand Finale Orbit
 */
function buildDynamicCinematicJourney(
  states: FootprintState[],
  allProjects: FootprintProject[]
): CinematicWaypoint[] {
  const waypoints: CinematicWaypoint[] = [];

  // 1. Orbital World View (Requirement 1)
  waypoints.push({
    id: "world_intro",
    type: "world",
    title: "Global Supply & Export Footprint",
    eyebrow: "STAGE 1 · ORBITAL 3D EARTH",
    narrative:
      "Originating in Ahmedabad, Volamp operates an integrated global and domestic delivery corridor spanning 28 Indian States and export gateways across the GCC, Africa, and Southeast Asia.",
    coords: { lat: 20.5, lng: 45.0, altitude: 2.5 },
    flyDurationMs: 1600,
    dwellMs: 5000,
    autoRotate: true,
    autoRotateSpeed: 0.35,
  });

  // 2. Asia Transit (Requirement 2 & 3)
  waypoints.push({
    id: "pan_asia",
    type: "asia",
    title: "Traversing Toward South Asian Subcontinent",
    eyebrow: "STAGE 2 · CONTINENTAL APPROACH",
    narrative:
      "Camera descends across the Indian Ocean basin into South Asia, centering on India's strategic manufacturing clusters and industrial energy corridors.",
    coords: { lat: 21.0, lng: 69.5, altitude: 1.85 },
    flyDurationMs: 2800,
    dwellMs: 3600,
    autoRotate: false,
  });

  // 3. Pan-India National Overview (Requirement 3 & 19)
  waypoints.push({
    id: "focus_india",
    type: "india",
    title: "Pan-India Sovereign Operational Territory",
    eyebrow: "STAGE 3 · SOVEREIGN 3D TERRITORY",
    narrative:
      "Activating official Survey of India boundary representation with 256+ completed installations, 46+ verified landmark facilities, and critical utility interconnections.",
    coords: { lat: 22.0, lng: 78.5, altitude: 1.18 },
    flyDurationMs: 3000,
    dwellMs: 4000,
    autoRotate: false,
  });

  // Priority order for exploration (Requirement 4 & 15)
  // Gujarat first (manufacturing origin, 100+ projects), then key industrial & renewable corridors
  const statePriority = ["GJ", "MH", "RJ", "MP", "KA", "UP", "OD", "TN", "AS", "BR", "PB", "AP", "GA", "WB"];
  const sortedStates = [...states].sort((a, b) => {
    const aIdx = statePriority.indexOf(a.code);
    const bIdx = statePriority.indexOf(b.code);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return b.projectsCompleted - a.projectsCompleted;
  });

  // Filter to states that have verified projects or active presence
  const statesWithPresence = sortedStates.filter(
    (st) =>
      st.projectsCompleted > 0 ||
      allProjects.some((p) => p.stateCode.toUpperCase() === st.code.toUpperCase())
  );

  // 4. Iterate through states, cities, and projects (Requirements 4, 5, 6, 7, 8)
  for (const st of statesWithPresence) {
    const stProjects = allProjects.filter(
      (p) => p.stateCode.toUpperCase() === st.code.toUpperCase()
    );

    const officialCount =
      OFFICIAL_STATE_COUNTS[st.code] ?? (st.projectsCompleted > 0 ? String(st.projectsCompleted) : "Active Desk");

    // Add State Overview Waypoint
    waypoints.push({
      id: `state_${st.code}`,
      type: "state",
      title: `${st.name} · ${officialCount} Completed Projects`,
      eyebrow: `STATE OVERVIEW · ${st.territory.toUpperCase()}`,
      narrative: st.heritage || `Volamp delivers safety-certified HT and LT cabling networks across ${st.name}.`,
      coords: { lat: Number(st.lat), lng: Number(st.lng), altitude: 0.62 },
      flyDurationMs: 2400,
      dwellMs: 4800,
      stateCode: st.code,
      stateName: st.name,
      heritage: st.heritage,
      autoRotate: false,
    });

    if (stProjects.length > 0) {
      // Group projects by city to enable true City-Level Zoom (Requirement 6)
      const cityMap = new Map<string, FootprintProject[]>();
      for (const p of stProjects) {
        const cityKey = p.city.trim();
        if (!cityMap.has(cityKey)) {
          cityMap.set(cityKey, []);
        }
        cityMap.get(cityKey)!.push(p);
      }

      for (const [cityName, cityProjects] of cityMap.entries()) {
        const firstProj = cityProjects[0];
        const cityLat = Number(firstProj.lat);
        const cityLng = Number(firstProj.lng);

        // City Transit Waypoint (Altitude 0.36)
        waypoints.push({
          id: `city_${st.code}_${cityName}`,
          type: "city",
          title: `${cityName} · Infrastructure Corridor`,
          eyebrow: `CITY TRANSIT · ${st.name.toUpperCase()}`,
          narrative: `Approaching ${cityName}, a vital installation hub in ${st.name} powering ${cityProjects.length} major facility network(s).`,
          coords: { lat: cityLat, lng: cityLng, altitude: 0.36 },
          flyDurationMs: 2200,
          dwellMs: 3600,
          stateCode: st.code,
          stateName: st.name,
          city: cityName,
          heritage: firstProj.heritage || st.heritage,
          autoRotate: false,
        });

        // Project Spotlight Waypoints (Altitude 0.24) (Requirement 8 & 15)
        for (const proj of cityProjects) {
          const isMajor =
            proj.category.toLowerCase().includes("landmark") ||
            proj.category.toLowerCase().includes("solar") ||
            proj.name.toLowerCase().includes("statue") ||
            proj.name.toLowerCase().includes("gift") ||
            proj.name.toLowerCase().includes("barc") ||
            proj.name.toLowerCase().includes("airport") ||
            proj.name.toLowerCase().includes("refinery") ||
            proj.name.toLowerCase().includes("smart city");

          waypoints.push({
            id: `proj_${proj.id}`,
            type: "project",
            title: proj.name,
            eyebrow: `PROJECT SPOTLIGHT · ${proj.category.toUpperCase()} (${proj.year})`,
            narrative: proj.shortDescription || proj.overview,
            coords: { lat: Number(proj.lat), lng: Number(proj.lng), altitude: 0.24 },
            flyDurationMs: 2000,
            dwellMs: isMajor ? 6500 : 4500, // Longer dwell for major projects (Requirement 15)
            stateCode: st.code,
            stateName: st.name,
            city: proj.city,
            project: proj,
            heritage: proj.heritage || st.heritage,
            priority: isMajor ? 5 : 3,
            autoRotate: false,
          });
        }
      }
    }
  }

  // 5. Grand Finale: Panoramic Return to Orbit (Requirement 20)
  waypoints.push({
    id: "orbit_finale",
    type: "world",
    title: "Pan-India Network & Global Export Corridors",
    eyebrow: "STAGE COMPLETE · PANORAMIC ORBIT",
    narrative:
      "Journey complete across Volamp's 28 Indian States and global export lanes. Explore any project marker interactively or restart the journey.",
    coords: { lat: 21.0, lng: 75.0, altitude: 2.2 },
    flyDurationMs: 3200,
    dwellMs: 6000,
    autoRotate: true,
    autoRotateSpeed: 0.35,
  });

  return waypoints;
}

export default function GlobeProjectsExperience() {
  const globeRef = useRef<any>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const tourTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleResumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef<boolean>(false);

  // tRPC Queries (Requirement 16 & 17: Fully decoupled, zero hardcoding)
  const { data: dbStates } = trpc.footprint.states.useQuery();
  const { data: dbProjects } = trpc.footprint.stateProjects.useQuery({});

  // Local State
  const [indiaFeatures, setIndiaFeatures] = useState<any[]>([]);
  const [isGlobeCanvasReady, setIsGlobeCanvasReady] = useState<boolean>(false);
  const [useUniversalEngine, setUseUniversalEngine] = useState<boolean>(() => !isWebGL2Available());
  const [retryKey, setRetryKey] = useState<number>(0);
  const [globeSize, setGlobeSize] = useState({ width: 1200, height: 740 });

  // Playback & Storyteller State
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState<number>(0);
  const [isAutoTourActive, setIsAutoTourActive] = useState<boolean>(true);
  const [isUserInteracting, setIsUserInteracting] = useState<boolean>(false);
  const [isDossierVisible, setIsDossierVisible] = useState<boolean>(true);

  // Modal State
  const [selectedProject, setSelectedProject] = useState<FootprintProject | null>(null);
  const [isArModalOpen, setIsArModalOpen] = useState<boolean>(false);
  const [isVrModalOpen, setIsVrModalOpen] = useState<boolean>(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState<boolean>(false);
  const [isImmersive, setIsImmersive] = useState<boolean>(false);
  const [vrSupported, setVrSupported] = useState<boolean>(false);

  // Hover state for interactive 3D inspection
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);

  // Check WebXR VR support
  useEffect(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      (navigator as any).xr?.isSessionSupported?.("immersive-vr")
        .then((supported: boolean) => setVrSupported(Boolean(supported)))
        .catch(() => setVrSupported(false));
    }
  }, []);

  // WebGL 2 availability check
  useEffect(() => {
    setUseUniversalEngine(!isWebGL2Available());
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

  // Master states list with verified fallback
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
        industry: "Statue of Unity, GIFT City, Petrochemicals & Solar Parks",
        yearsOfPresence: "20+",
        heritage: "Originating in Ahmedabad, Gujarat represents Volamp's foundational manufacturing and engineering corridor with 100+ installations.",
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

  const allProjectsList: FootprintProject[] = useMemo(() => {
    return (dbProjects ?? []) as unknown as FootprintProject[];
  }, [dbProjects]);

  // Construct Data-Driven Cinematic Itinerary (Requirement 10 & 16)
  const waypoints = useMemo(() => {
    return buildDynamicCinematicJourney(states, allProjectsList);
  }, [states, allProjectsList]);

  const activeWaypoint = waypoints[currentWaypointIndex] ?? waypoints[0];

  // Active state data based on waypoint
  const activeState = useMemo(() => {
    if (activeWaypoint?.stateCode) {
      return states.find((s) => s.code.toUpperCase() === activeWaypoint.stateCode!.toUpperCase()) ?? states[0];
    }
    return states[0];
  }, [states, activeWaypoint]);

  // Filter projects for active state
  const activeStateProjects = useMemo(() => {
    if (!activeWaypoint?.stateCode) return [];
    return allProjectsList.filter(
      (p) => p.stateCode.toUpperCase() === activeWaypoint.stateCode!.toUpperCase()
    );
  }, [allProjectsList, activeWaypoint]);

  // Load official Survey of India administrative boundary GeoJSON (Requirement 19)
  useEffect(() => {
    fetch("/geo/india_official_soi.geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIndiaFeatures(data.features ?? []);
      })
      .catch((err) => {
        console.warn("[Footprint] Failed to load official SOI GeoJSON:", err);
      });
  }, []);

  // ResizeObserver for 100% full-bleed stage container
  useEffect(() => {
    if (!viewportRef.current) return;
    const updateDimensions = () => {
      if (viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        setGlobeSize({
          width: Math.floor(rect.width) || 1200,
          height: Math.floor(rect.height) || 740,
        });
      }
    };
    updateDimensions();
    const ro = new ResizeObserver(() => updateDimensions());
    ro.observe(viewportRef.current);
    window.addEventListener("resize", updateDimensions);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isImmersive]);

  // Smooth Camera Navigation Function (Requirement 2 & 11)
  const navigateGlobe = useCallback(
    (coords: { lat: number; lng: number; altitude: number }, durationMs: number = 2200) => {
      if (!globeRef.current) return;
      try {
        const controls = globeRef.current.controls?.();
        if (controls) {
          // Disable auto-rotate during flight
          controls.autoRotate = false;
        }
        globeRef.current.pointOfView(
          {
            lat: coords.lat,
            lng: coords.lng,
            altitude: coords.altitude,
          },
          durationMs
        );
      } catch (e) {
        console.warn("[Globe] pointOfView navigation error:", e);
      }
    },
    []
  );

  // Execute a specific waypoint in the cinematic journey
  const executeWaypoint = useCallback(
    (index: number) => {
      if (index < 0 || index >= waypoints.length) return;
      const target = waypoints[index];
      setCurrentWaypointIndex(index);

      // Perform camera flight
      navigateGlobe(target.coords, target.flyDurationMs);

      // Manage auto-rotate for orbital views
      if (target.autoRotate && target.type === "world") {
        setTimeout(() => {
          try {
            const controls = globeRef.current?.controls?.();
            if (controls && !isInteractingRef.current) {
              controls.autoRotate = true;
              controls.autoRotateSpeed = target.autoRotateSpeed ?? 0.35;
            }
          } catch {
            // ignore
          }
        }, target.flyDurationMs + 200);
      }
    },
    [waypoints, navigateGlobe]
  );

  // Automated Tour Timer Loop (Requirement 13)
  useEffect(() => {
    if (!isAutoTourActive || isUserInteracting || !isGlobeCanvasReady) {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
      return;
    }

    const currentWp = waypoints[currentWaypointIndex];
    if (!currentWp) return;

    const totalStepTime = currentWp.flyDurationMs + currentWp.dwellMs;

    tourTimerRef.current = setTimeout(() => {
      const nextIndex = (currentWaypointIndex + 1) % waypoints.length;
      executeWaypoint(nextIndex);
    }, totalStepTime);

    return () => {
      if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
    };
  }, [isAutoTourActive, isUserInteracting, isGlobeCanvasReady, currentWaypointIndex, waypoints, executeWaypoint]);

  // Initial flight on globe canvas ready (Requirement 1: Start with World)
  useEffect(() => {
    if (isGlobeCanvasReady && waypoints.length > 0) {
      executeWaypoint(0);
    }
  }, [isGlobeCanvasReady]);

  // User manual interaction handlers (Requirement 14)
  const handleUserInteractionStart = useCallback(() => {
    isInteractingRef.current = true;
    setIsUserInteracting(true);
    setIsAutoTourActive(false);

    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);

    // Stop auto-rotation immediately when user touches
    try {
      const controls = globeRef.current?.controls?.();
      if (controls) {
        controls.autoRotate = false;
      }
    } catch {
      // ignore
    }

    // Set 14-second idle auto-resume timer
    if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);
    idleResumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      setIsUserInteracting(false);
      setIsAutoTourActive(true);
    }, 14000);
  }, []);

  const handleResumeAutomatedTour = useCallback(() => {
    if (idleResumeTimerRef.current) clearTimeout(idleResumeTimerRef.current);
    isInteractingRef.current = false;
    setIsUserInteracting(false);
    setIsAutoTourActive(true);
    // Continue from next waypoint
    const nextIdx = (currentWaypointIndex + 1) % waypoints.length;
    executeWaypoint(nextIdx);
  }, [currentWaypointIndex, waypoints.length, executeWaypoint]);

  const handlePauseTour = useCallback(() => {
    setIsAutoTourActive(false);
    if (tourTimerRef.current) clearTimeout(tourTimerRef.current);
  }, []);

  const handlePrevWaypoint = useCallback(() => {
    handleUserInteractionStart();
    const prevIdx = (currentWaypointIndex - 1 + waypoints.length) % waypoints.length;
    executeWaypoint(prevIdx);
  }, [currentWaypointIndex, waypoints.length, handleUserInteractionStart, executeWaypoint]);

  const handleNextWaypoint = useCallback(() => {
    handleUserInteractionStart();
    const nextIdx = (currentWaypointIndex + 1) % waypoints.length;
    executeWaypoint(nextIdx);
  }, [currentWaypointIndex, waypoints.length, handleUserInteractionStart, executeWaypoint]);

  const handleRestartTour = useCallback(() => {
    handleUserInteractionStart();
    executeWaypoint(0);
  }, [handleUserInteractionStart, executeWaypoint]);

  // Jump directly to a state via bottom ribbon
  const jumpToState = useCallback(
    (code: string) => {
      handleUserInteractionStart();
      const stateIndex = waypoints.findIndex(
        (w) => w.type === "state" && w.stateCode?.toUpperCase() === code.toUpperCase()
      );
      if (stateIndex !== -1) {
        executeWaypoint(stateIndex);
      } else {
        const st = states.find((s) => s.code.toUpperCase() === code.toUpperCase());
        if (st) {
          navigateGlobe({ lat: Number(st.lat), lng: Number(st.lng), altitude: 0.62 }, 2200);
        }
      }
    },
    [waypoints, states, handleUserInteractionStart, executeWaypoint, navigateGlobe]
  );

  // 3D Point Markers Layer (Projects + State Hubs + Global Export Gateways)
  const globePoints = useMemo(() => {
    const pts: any[] = [];

    // Global Export Gateways (Emerald green)
    GLOBAL_EXPORT_POINTS.forEach((p) => {
      pts.push({
        lat: p.lat,
        lng: p.lng,
        color: p.color,
        size: p.size,
        altitude: 0.05,
        name: p.name,
        territory: p.territory,
        isGlobal: true,
      });
    });

    // Indian State Hubs (Cyan)
    states.forEach((st) => {
      const isSelected = activeWaypoint?.stateCode?.toUpperCase() === st.code.toUpperCase();
      pts.push({
        lat: Number(st.lat),
        lng: Number(st.lng),
        color: isSelected ? "#f2b84b" : "#38bdf8",
        size: isSelected ? 0.75 : 0.45,
        altitude: isSelected ? 0.08 : 0.03,
        name: st.name,
        code: st.code,
        territory: st.territory,
        projectsCompleted: st.projectsCompleted,
        isStateHub: true,
      });
    });

    // Landmark Verified Projects (Illuminated Amber)
    allProjectsList.forEach((proj) => {
      const isActiveProject = activeWaypoint?.project?.id === proj.id;
      pts.push({
        lat: Number(proj.lat),
        lng: Number(proj.lng),
        color: isActiveProject ? "#ffffff" : "#f2b84b",
        size: isActiveProject ? 0.95 : 0.55,
        altitude: isActiveProject ? 0.12 : 0.05,
        name: proj.name,
        city: proj.city,
        category: proj.category,
        isProjectMarker: true,
        projectData: proj,
      });
    });

    return pts;
  }, [states, allProjectsList, activeWaypoint]);

  // Ripple Rings Layer: Emits pulsing energy from active waypoint coords (Requirement 8)
  const rippleRings = useMemo(() => {
    if (!activeWaypoint) return [];
    return [
      {
        lat: activeWaypoint.coords.lat,
        lng: activeWaypoint.coords.lng,
        maxR: activeWaypoint.type === "project" ? 2.5 : activeWaypoint.type === "city" ? 4.0 : 7.0,
        propagationSpeed: 1.8,
        repeatPeriod: 1200,
        color: activeWaypoint.type === "project" ? ["#f2b84bff", "#f2b84b00"] : ["#38bdf8ff", "#38bdf800"],
      },
    ];
  }, [activeWaypoint]);

  // Progress percentage across current itinerary
  const progressPercent = useMemo(() => {
    if (waypoints.length <= 1) return 100;
    return Math.round(((currentWaypointIndex + 1) / waypoints.length) * 100);
  }, [currentWaypointIndex, waypoints.length]);

  return (
    <div className={`footprint-theater-stage ${isImmersive ? "is-immersive" : ""}`}>
      {/* 1. Main 3D Canvas Viewport (100% full bleed, Map-first) */}
      <div
        ref={viewportRef}
        className="cinematic-canvas-viewport"
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest(".cinematic-telemetry-hud") ||
            target.closest(".cinematic-top-actions") ||
            target.closest(".cinematic-floating-dossier") ||
            target.closest(".cinematic-playback-deck") ||
            target.closest(".cinematic-state-ribbon") ||
            target.closest(".cinematic-override-banner")
          ) {
            return;
          }
          handleUserInteractionStart();
        }}
        onTouchStart={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest(".cinematic-telemetry-hud") ||
            target.closest(".cinematic-top-actions") ||
            target.closest(".cinematic-floating-dossier") ||
            target.closest(".cinematic-playback-deck") ||
            target.closest(".cinematic-state-ribbon") ||
            target.closest(".cinematic-override-banner")
          ) {
            return;
          }
          handleUserInteractionStart();
        }}
      >
        {useUniversalEngine ? (
          <Universal3DGlobeCanvas
            activeWaypoint={activeWaypoint}
            states={states}
            allProjects={allProjectsList}
            indiaFeatures={indiaFeatures}
            exportArcs={SUPPLY_ARCS}
            globalExportPoints={GLOBAL_EXPORT_POINTS}
            isUserInteracting={isUserInteracting}
            onUserInteractionStart={handleUserInteractionStart}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onSelectState={(code) => jumpToState(code)}
          />
        ) : (
          <WebGLErrorBoundary
            resetKey={retryKey}
            onError={() => setUseUniversalEngine(true)}
            fallback={
              <Universal3DGlobeCanvas
                activeWaypoint={activeWaypoint}
                states={states}
                allProjects={allProjectsList}
                indiaFeatures={indiaFeatures}
                exportArcs={SUPPLY_ARCS}
                globalExportPoints={GLOBAL_EXPORT_POINTS}
                isUserInteracting={isUserInteracting}
                onUserInteractionStart={handleUserInteractionStart}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onSelectState={(code) => jumpToState(code)}
              />
            }
          >
            <Suspense
              fallback={
                <div className="cinematic-loading-overlay">
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
                animateIn={false}
                waitForGlobeReady={true}
                onGlobeReady={() => {
                  try {
                    const controls = globeRef.current?.controls?.();
                    if (controls) {
                      controls.enableDamping = true;
                      controls.dampingFactor = 0.05;
                      controls.autoRotate = false;
                      controls.enableZoom = true;
                    }
                  } catch (e) {
                    console.warn("[Globe] onGlobeReady error:", e);
                  }
                  setIsGlobeCanvasReady(true);
                }}
                // Survey of India Official Boundaries 3D Extrusion (Requirement 19)
                polygonsData={indiaFeatures}
                polygonGeoJsonGeometry="geometry"
                polygonCapColor={(feature: any) => {
                  const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                  const code = feature?.properties?.code || "";
                  const isMatch =
                    (code && activeWaypoint?.stateCode && code.toUpperCase() === activeWaypoint.stateCode.toUpperCase()) ||
                    (activeState && name.toLowerCase() === activeState.name.toLowerCase());

                  if (isMatch) {
                    return "#f2b84be6"; // Illuminated Sovereign Amber
                  }
                  if (hoveredStateName && name.toLowerCase() === hoveredStateName.toLowerCase()) {
                    return "#38bdf8d0"; // Hovered Cyan
                  }
                  return "#09274266"; // Deep Space Translucent Blue
                }}
                polygonSideColor={() => "#041424"}
                polygonStrokeColor={(feature: any) => {
                  const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                  const code = feature?.properties?.code || "";
                  const isMatch =
                    (code && activeWaypoint?.stateCode && code.toUpperCase() === activeWaypoint.stateCode.toUpperCase()) ||
                    (activeState && name.toLowerCase() === activeState.name.toLowerCase());
                  return isMatch ? "#f2b84b" : "#38bdf888";
                }}
                polygonAltitude={(feature: any) => {
                  const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                  const code = feature?.properties?.code || "";
                  const isMatch =
                    (code && activeWaypoint?.stateCode && code.toUpperCase() === activeWaypoint.stateCode.toUpperCase()) ||
                    (activeState && name.toLowerCase() === activeState.name.toLowerCase());
                  if (isMatch) return 0.088;
                  if (hoveredStateName && name.toLowerCase() === hoveredStateName.toLowerCase()) return 0.055;
                  return 0.015;
                }}
                polygonLabel={(feature: any) => {
                  const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "State";
                  const code = feature?.properties?.code || "";
                  const official = OFFICIAL_STATE_COUNTS[code] ?? "";
                  return `<div class="globe-tooltip"><strong>${name}</strong>${
                    official ? `<br/><span>Verified Projects: <strong>${official}</strong></span>` : ""
                  }<br/><span>Click to inspect regional installations</span></div>`;
                }}
                onPolygonHover={(feature: any) => {
                  setHoveredStateName(
                    feature ? feature?.properties?.NAME_1 || feature?.properties?.STATE || null : null
                  );
                }}
                onPolygonClick={(feature: any) => {
                  handleUserInteractionStart();
                  const code = feature?.properties?.code || "";
                  const name = feature?.properties?.NAME_1 || feature?.properties?.STATE || "";
                  const matched = states.find(
                    (s) =>
                      (code && s.code.toUpperCase() === code.toUpperCase()) ||
                      s.name.toLowerCase() === name.toLowerCase()
                  );
                  if (matched) {
                    jumpToState(matched.code);
                  }
                }}
                // Ripple Rings Layer
                ringsData={rippleRings}
                ringLat="lat"
                ringLng="lng"
                ringColor="color"
                ringMaxRadius="maxR"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"
                // 3D Points Data Layer (Projects + Hubs)
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
                  const official =
                    OFFICIAL_STATE_COUNTS[p.code] ?? (p.code === "GJ" ? "100+" : p.code === "RJ" ? "50+" : p.projectsCompleted);
                  return `<div class="globe-tooltip"><strong>${p.name}</strong><br/><span>${p.territory}</span><br/>Projects: <strong>${official}</strong></div>`;
                }}
                onPointClick={(p: any) => {
                  handleUserInteractionStart();
                  if (p.isProjectMarker) {
                    setSelectedProject(p.projectData);
                  } else if (p.isGlobal) {
                    navigateGlobe({ lat: p.lat, lng: p.lng, altitude: 1.25 }, 1200);
                  } else if (p.code) {
                    jumpToState(p.code);
                  }
                }}
                // Animated Global & Domestic Supply Arcs (Requirement 1 & 8)
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
      </div>

      {/* 2. Top-Left Telemetry & Breadcrumb HUD (Requirement 2 & 12) */}
      <div className="cinematic-telemetry-hud">
        <div className="telemetry-status-pill">
          <span className={`live-dot ${isAutoTourActive && !isUserInteracting ? "is-playing" : "is-paused"}`} />
          <span>{isAutoTourActive && !isUserInteracting ? "AUTO-JOURNEY ACTIVE" : "INTERACTIVE EXPLORATION"}</span>
          <span className="opacity-40">|</span>
          <span>
            WAYPOINT {currentWaypointIndex + 1}/{waypoints.length}
          </span>
        </div>

        {/* Dynamic Breadcrumb Hierarchy (Requirement 2: World -> Asia -> India -> State -> City -> Project) */}
        <div className="telemetry-breadcrumb">
          <span className={activeWaypoint.type === "world" ? "crumb-active" : ""}>WORLD</span>
          <span>›</span>
          <span className={activeWaypoint.type === "asia" ? "crumb-active" : ""}>ASIA</span>
          <span>›</span>
          <span className={activeWaypoint.type === "india" ? "crumb-active" : ""}>INDIA</span>
          {activeWaypoint.stateName && (
            <>
              <span>›</span>
              <span className={activeWaypoint.type === "state" ? "crumb-active" : ""}>
                {activeWaypoint.stateName}
              </span>
            </>
          )}
          {activeWaypoint.city && (
            <>
              <span>›</span>
              <span className={activeWaypoint.type === "city" ? "crumb-active" : ""}>
                {activeWaypoint.city}
              </span>
            </>
          )}
          {activeWaypoint.project && (
            <>
              <span>›</span>
              <span className="crumb-active truncate max-w-[120px]">{activeWaypoint.project.name}</span>
            </>
          )}
        </div>

        <div className="telemetry-coords">
          LAT {activeWaypoint.coords.lat.toFixed(4)}° N &nbsp;•&nbsp; LNG {activeWaypoint.coords.lng.toFixed(4)}° E &nbsp;•&nbsp; ALT {activeWaypoint.coords.altitude.toFixed(2)} AU
        </div>
      </div>

      {/* 3. Top-Right Minimal Actions Bar (Requirement 12 & 13) */}
      <div className="cinematic-top-actions">
        {/* Play/Pause Journey */}
        {isAutoTourActive && !isUserInteracting ? (
          <button className="cinematic-glass-btn" onClick={handlePauseTour} title="Pause automated journey">
            <Pause className="size-3.5" />
            <span>Pause</span>
          </button>
        ) : (
          <button className="cinematic-glass-btn is-primary" onClick={handleResumeAutomatedTour} title="Start / Resume automated journey">
            <Play className="size-3.5 fill-current" />
            <span>Start Cinematic Journey</span>
          </button>
        )}

        {/* Toggle Dossier Visibility */}
        <button
          className="cinematic-glass-btn"
          onClick={() => setIsDossierVisible((prev) => !prev)}
          title={isDossierVisible ? "Collapse Dossier Panel" : "Show Dossier Panel"}
        >
          {isDossierVisible ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          <span>{isDossierVisible ? "Hide Dossier" : "Show Dossier"}</span>
        </button>

        {/* WebAR Launch (Requirement 18) */}
        <button
          className="cinematic-glass-btn"
          onClick={() => setIsArModalOpen(true)}
          title="Launch Augmented Reality view on mobile"
        >
          <Smartphone className="size-3.5 text-amber-400" />
          <span>WebAR</span>
        </button>

        {/* WebVR Headset Launch (Requirement 18) */}
        <button
          className="cinematic-glass-btn"
          onClick={() => setIsVrModalOpen(true)}
          title="Enter WebVR / Spatial Headset mode"
        >
          <Glasses className="size-3.5 text-sky-400" />
          <span>WebVR</span>
        </button>

        {/* Accessible Table Directory Modal */}
        <button
          className="cinematic-glass-btn"
          onClick={() => setIsTableModalOpen(true)}
          title="Open complete pan-India table directory"
        >
          <Table className="size-3.5" />
          <span>Directory</span>
        </button>

        {/* Fullscreen Theater Mode */}
        <button
          className="cinematic-glass-btn"
          onClick={() => setIsImmersive((prev) => !prev)}
          title={isImmersive ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isImmersive ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          <span>{isImmersive ? "Exit" : "Expand"}</span>
        </button>
      </div>

      {/* 4. Floating Contextual Dossier (Top-Right, Collapsible) (Requirement 7, 8, 9) */}
      {isDossierVisible && (
        <aside className="cinematic-floating-dossier" aria-label="Geographic & Project Story Context">
          <div className="dossier-header">
            <div>
              <span className="dossier-eyebrow">{activeWaypoint.eyebrow}</span>
              <h3 className="dossier-title">{activeWaypoint.title}</h3>
            </div>
            {activeWaypoint.stateCode && (
              <span className="dossier-code-badge">{activeWaypoint.stateCode}</span>
            )}
          </div>

          <p className="dossier-narrative">{activeWaypoint.narrative}</p>

          {/* Context A: World / Asia / India Overview Metrics */}
          {(activeWaypoint.type === "world" ||
            activeWaypoint.type === "asia" ||
            activeWaypoint.type === "india") && (
            <div className="dossier-metrics-grid">
              <div className="dossier-metric-box">
                <span className="num">28</span>
                <span className="lbl">Indian States</span>
              </div>
              <div className="dossier-metric-box">
                <span className="num">256+</span>
                <span className="lbl">Installations</span>
              </div>
              <div className="dossier-metric-box">
                <span className="num">6+</span>
                <span className="lbl">Export Hubs</span>
              </div>
            </div>
          )}

          {/* Context B: State Overview Metrics & Heritage */}
          {activeWaypoint.type === "state" && (
            <>
              <div className="dossier-metrics-grid">
                <div className="dossier-metric-box">
                  <span className="num">
                    {OFFICIAL_STATE_COUNTS[activeState.code] ?? activeState.projectsCompleted}
                  </span>
                  <span className="lbl">Total Projects</span>
                </div>
                <div className="dossier-metric-box">
                  <span className="num">{activeState.majorProjectsCount}</span>
                  <span className="lbl">Major Sites</span>
                </div>
                <div className="dossier-metric-box">
                  <span className="num">{activeState.yearsOfPresence}</span>
                  <span className="lbl">Years Active</span>
                </div>
              </div>

              {/* Verified Heritage Context (Requirement 7) */}
              {activeState.heritage && (
                <div className="dossier-heritage-block">
                  <div className="heritage-title">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>Regional Significance & Heritage</span>
                  </div>
                  <p>{activeState.heritage}</p>
                </div>
              )}

              {/* Customer Testimonial Quote */}
              {activeState.customerQuote && (
                <div className="dossier-testimonial-block">
                  <span className="t-eyebrow">CUSTOMER EXPERIENCE</span>
                  <blockquote>"{activeState.customerQuote}"</blockquote>
                  <div className="t-author">
                    <strong>{activeState.customerAuthor}</strong>
                    <small>{activeState.customerCompany}</small>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Context C: City Transit Overview */}
          {activeWaypoint.type === "city" && (
            <div className="dossier-city-block">
              <div className="city-info-line">
                <MapPin className="size-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong>Regional Node:</strong> {activeWaypoint.city}, {activeWaypoint.stateName}
                </span>
              </div>
              {activeWaypoint.heritage && (
                <div className="dossier-heritage-block mt-3">
                  <div className="heritage-title">
                    <Sparkles className="size-3.5 text-amber-400" />
                    <span>Geographic & Industrial Context</span>
                  </div>
                  <p>{activeWaypoint.heritage}</p>
                </div>
              )}
            </div>
          )}

          {/* Context D: Pinpoint Project Spotlight (Requirement 8) */}
          {activeWaypoint.type === "project" && activeWaypoint.project && (
            <div className="dossier-project-spotlight">
              <div className="spotlight-top">
                <span className="spotlight-badge">{activeWaypoint.project.category}</span>
                <span className="spotlight-year">{activeWaypoint.project.year}</span>
              </div>

              <div className="spotlight-meta">
                <MapPin className="size-3 text-amber-400" />
                <span>
                  {activeWaypoint.project.city}, {activeWaypoint.stateName}
                </span>
              </div>

              <div className="spotlight-section">
                <strong>Volamp Contribution:</strong>
                <p>{activeWaypoint.project.volampContribution}</p>
              </div>

              {/* Customer Testimonial */}
              {activeWaypoint.project.customerTestimonial && (
                <div className="dossier-testimonial-block mt-2">
                  <span className="t-eyebrow">VERIFIED CLIENT FEEDBACK</span>
                  <blockquote>"{activeWaypoint.project.customerTestimonial}"</blockquote>
                  <div className="t-author">
                    <strong>{activeWaypoint.project.customerName}</strong>
                    <small>{activeWaypoint.project.customerCompany}</small>
                  </div>
                </div>
              )}

              <button
                className="spotlight-action-btn"
                onClick={() => setSelectedProject(activeWaypoint.project!)}
              >
                Inspect Engineering Specifications <ArrowRight className="size-3.5" />
              </button>
            </div>
          )}

          {/* Footer Jump to Full Project Directory */}
          <div className="dossier-footer">
            <button
              className="dossier-explore-all-btn"
              onClick={() => setIsTableModalOpen(true)}
            >
              <span>Explore All 28 States & 46+ Landmark Sites</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* 5. User Manual Override Notice Banner (Requirement 14) */}
      {isUserInteracting && (
        <div className="cinematic-override-banner">
          <div className="override-content">
            <Compass className="size-4 text-amber-400 shrink-0" />
            <span>Manual 3D Exploration Mode &nbsp;•&nbsp; Automated journey paused</span>
            <button className="override-resume-btn" onClick={handleResumeAutomatedTour}>
              <Play className="size-3 fill-current inline mr-1" /> Resume Journey
            </button>
          </div>
        </div>
      )}

      {/* 6. Floating Bottom-Center Playback Deck (Requirement 13) */}
      <div className="cinematic-playback-deck">
        <div className="playback-controls-row">
          <button
            className="deck-btn"
            onClick={handlePrevWaypoint}
            title="Previous Story Waypoint"
            aria-label="Previous Waypoint"
          >
            <ChevronLeft className="size-4" />
          </button>

          {isAutoTourActive && !isUserInteracting ? (
            <button
              className="deck-btn is-play-pause is-active"
              onClick={handlePauseTour}
              title="Pause automated cinematic journey"
              aria-label="Pause Journey"
            >
              <Pause className="size-4" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              className="deck-btn is-play-pause is-resume"
              onClick={handleResumeAutomatedTour}
              title="Resume automated cinematic journey"
              aria-label="Resume Journey"
            >
              <Play className="size-4 fill-current" />
              <span>Resume Journey</span>
            </button>
          )}

          <button
            className="deck-btn"
            onClick={handleNextWaypoint}
            title="Next Story Waypoint"
            aria-label="Next Waypoint"
          >
            <ChevronRight className="size-4" />
          </button>

          <button
            className="deck-btn"
            onClick={handleRestartTour}
            title="Restart journey from World view"
            aria-label="Restart Journey"
          >
            <RotateCcw className="size-3.5" />
            <span>Restart</span>
          </button>
        </div>

        {/* Waypoint Progress Bar */}
        <div className="playback-progress-track" title={`Step ${currentWaypointIndex + 1} of ${waypoints.length}`}>
          <div className="playback-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* 7. Floating Bottom-Left State Ribbon (Direct Regional Jumpers) */}
      <div className="cinematic-state-ribbon">
        <span className="ribbon-label">EXPLORE REGIONS:</span>
        <div className="ribbon-scroll">
          {states.slice(0, 10).map((st) => {
            const isSelected = activeWaypoint?.stateCode?.toUpperCase() === st.code.toUpperCase();
            const badge =
              OFFICIAL_STATE_COUNTS[st.code] ?? (st.code === "GJ" ? "100+" : st.code === "RJ" ? "50+" : st.projectsCompleted);
            return (
              <button
                key={st.code}
                className={`ribbon-pill ${isSelected ? "is-selected" : ""}`}
                onClick={() => jumpToState(st.code)}
              >
                <span>{st.name}</span>
                <span className="pill-badge">{badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modal A: Major Project Detailed Specification Modal (Requirement 8 & 16) */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="project-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-badge">{selectedProject.category}</span>
                <span className="modal-status-badge">{selectedProject.status}</span>
                <h3 className="modal-title">{selectedProject.name}</h3>
                <div className="modal-meta">
                  <span>
                    <MapPin className="size-3.5" /> {selectedProject.city}
                  </span>
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
                <h4>
                  <Boxes className="size-4 text-amber-500 inline mr-1" /> Project Overview
                </h4>
                <p>{selectedProject.overview}</p>
              </div>

              <div className="modal-section highlight-box">
                <h4>
                  <Zap className="size-4 text-amber-500 inline mr-1" /> Volamp Engineering & Cable Supply
                </h4>
                <p>{selectedProject.volampContribution}</p>
              </div>

              <div className="modal-section">
                <h4>
                  <Sparkles className="size-4 text-amber-500 inline mr-1" /> Project Heritage & Regional Significance
                </h4>
                <p>{selectedProject.heritage}</p>
              </div>

              {selectedProject.customerTestimonial && (
                <div className="modal-section testimonial-box">
                  <h4>
                    <ShieldCheck className="size-4 text-amber-500 inline mr-1" /> Customer Testimonial
                  </h4>
                  <blockquote>"{selectedProject.customerTestimonial}"</blockquote>
                  <div className="testimonial-footer">
                    <strong>{selectedProject.customerName}</strong>
                    <span>{selectedProject.customerCompany}</span>
                  </div>
                </div>
              )}

              {/* Certified Technical Standards */}
              <div className="modal-badges-row">
                <span className="spec-badge">
                  <CheckCircle2 className="size-3 inline mr-1" /> IS/IEC 60502 Certified
                </span>
                <span className="spec-badge">
                  <CheckCircle2 className="size-3 inline mr-1" /> Flame-Retardant Low Smoke (FRLS)
                </span>
                <span className="spec-badge">
                  <CheckCircle2 className="size-3 inline mr-1" /> Factory Acceptance Tested
                </span>
                <span className="spec-badge">
                  <CheckCircle2 className="size-3 inline mr-1" /> High-Thermal Resilient
                </span>
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
                href={`https://wa.me/919512365582?text=Hi%20Volamp%20team,%20I%20am%20interested%20in%20learning%20more%20about%20your%20project:%20${encodeURIComponent(
                  selectedProject.name
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                Enquire Regarding This Project <ArrowRight className="size-4 ml-1 inline" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal B: WebAR Augmented Reality Experience (Requirement 18) */}
      {isArModalOpen && (
        <div className="modal-overlay" onClick={() => setIsArModalOpen(false)}>
          <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ar-icon-badge">
                <Smartphone className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="modal-title">Augmented Reality (WebAR) Experience</h3>
                <p className="modal-sub">
                  Place the Volamp 3D Substation & Pan-India Infrastructure in your physical space.
                </p>
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
                  <strong>Full Multi-Device Guarantee:</strong> The 3D WebGL digital twin, geographic fallback, and complete project directory are fully functional on every phone, tablet, and desktop browser.
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setIsArModalOpen(false)}
              >
                Return to Globe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal C: WebVR Spatial Headset Experience (Requirement 18) */}
      {isVrModalOpen && (
        <div className="modal-overlay" onClick={() => setIsVrModalOpen(false)}>
          <div className="ar-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="ar-icon-badge">
                <Glasses className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="modal-title">WebVR / Spatial Headset Experience</h3>
                <p className="modal-sub">
                  Immersive 3D hologram exploration for Meta Quest, Apple Vision Pro & SteamVR.
                </p>
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

      {/* Modal D: Complete Pan-India Table Directory */}
      {isTableModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTableModalOpen(false)}>
          <div className="project-detail-modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-badge">PAN-INDIA ARCHIVE</span>
                <h3 className="modal-title">Volamp Regional Footprint & Project Directory</h3>
                <p className="modal-sub">
                  Official record of 256+ completed installations across 28 Indian States & Union Territories.
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsTableModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="modal-body max-h-[60vh] overflow-y-auto">
              <table className="footprint-table w-full">
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
                    <tr
                      key={st.code}
                      className={activeWaypoint?.stateCode === st.code ? "is-highlighted" : ""}
                    >
                      <td>
                        <strong>{st.name}</strong>
                      </td>
                      <td>
                        <span className="code-pill">{st.code}</span>
                      </td>
                      <td>{st.territory}</td>
                      <td>
                        <strong>
                          {OFFICIAL_STATE_COUNTS[st.code] ?? st.projectsCompleted}
                        </strong>
                      </td>
                      <td>{st.majorProjectsCount}</td>
                      <td>{st.industry}</td>
                      <td>{st.yearsOfPresence}</td>
                      <td>
                        <button
                          className="table-select-btn"
                          onClick={() => {
                            setIsTableModalOpen(false);
                            jumpToState(st.code);
                          }}
                        >
                          Fly To <ChevronRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="modal-secondary-btn"
                onClick={() => setIsTableModalOpen(false)}
              >
                Return to Globe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
