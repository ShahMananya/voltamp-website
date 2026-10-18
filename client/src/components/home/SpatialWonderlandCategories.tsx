import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// @ts-ignore
import * as THREE from "three";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Zap,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Bot,
  Thermometer,
  Eye,
  CheckCircle2,
  Shield,
  Activity,
  Maximize,
  Play,
  Pause,
  Volume2,
  VolumeX,
  FastForward,
  Cpu,
  Flame,
} from "lucide-react";
import { AiElectricalViewerAssistant } from "./AiElectricalViewerAssistant";

interface SpatialWonderlandCategoriesProps {
  onNavigate: (slug: string) => void;
  onOpenARModal: (cat: any) => void;
  onOpenShowroomLab?: (catId: string) => void;
}

export type ModelType = "panel-assembly" | "cable-cutaway" | "lug-gland" | "switchgear-mccb";
export type VisionMode = "reality" | "thermal" | "blueprint";

export interface TourStep {
  title: string;
  component: string;
  narration: string;
  cameraPos: { x: number; y: number; z: number };
  targetRot: { x: number; y: number };
  zoom: number;
  explodeLevel: number;
  visionMode: VisionMode;
  hotspotId?: string;
  durationMs: number;
}

export interface ModelPreset {
  id: ModelType;
  name: string;
  badge: string;
  subtitle: string;
  categorySlug: string;
  categoryName: string;
  realImage: string;
  specs: {
    title: string;
    role: string;
    standard: string;
    material: string;
    price: string;
    stock: string;
    ampacity: string;
    shortCircuit: string;
    torque: string;
  };
  hotspots: Array<{
    id: string;
    title: string;
    component: string;
    desc: string;
    technical: string;
    pos: [number, number, number];
  }>;
  aiTour: TourStep[];
}

export function SpatialWonderlandCategories({
  onNavigate,
  onOpenARModal,
  onOpenShowroomLab,
}: SpatialWonderlandCategoriesProps) {
  // Master Real-World Industrial Presets with AI Guided 3D Animation Sequences
  const modelPresets: ModelPreset[] = useMemo(
    () => [
      {
        id: "panel-assembly",
        name: "Complete 400A Industrial Control Panel Assembly",
        badge: "AI 3D INDUSTRIAL TWIN",
        subtitle:
          "Full Physical Assembly: Overhead GI Tray ➔ Armoured Feeder ➔ M63 Brass Glands ➔ DIN Copper Lugs ➔ 400A 3VA2 MCCB ➔ Solid Copper Busbars ➔ Earth Bar",
        categorySlug: "switch-gears",
        categoryName: "Industrial Switchgear",
        realImage: "/products/mcc-panel-real.jpg",
        specs: {
          title: "Complete 400A MCC Control Panel Installation",
          role: "Main high-current power distribution system connecting incoming transformer feed to motor control breakers",
          standard: "IS 7098 / DIN 46235 / BS 6121 / IEC 60947-2 / IS 8623",
          material: "CRCA Powder Coated Steel + 99.97% ETP Copper + CZ121 Naval Brass",
          price: "Turnkey Engineered Package",
          stock: "All Components Ready in Ahmedabad Warehouse",
          ampacity: "400A Continuous Rated",
          shortCircuit: "36kA / 1 sec (Icu)",
          torque: "38 N·m on M12 Copper Busbar Studs",
        },
        hotspots: [
          {
            id: "cable-tray",
            title: "Overhead GI Perforated Cable Tray",
            component: "Cable Routing & Containment",
            desc: "Hot-dip galvanized slotted ladder tray carrying heavy 4-core XLPE armoured feeder lines into the facility.",
            technical: "Steel gauge: 2.0mm · Zinc coating: 80µm · Heavy load certified",
            pos: [0.0, 1.25, 0.25],
          },
          {
            id: "brass-glands",
            title: "M63 Double Compression Brass Glands",
            component: "CZ121 Naval Brass Cable Gland",
            desc: "Clamps cable steel wire armour (SWA) for 100% grounding return and provides IP66 gas-tight environmental seal.",
            technical: "Standard: BS 6121 / IS 12943 · Thread: M63 x 1.5mm · IP66 / IP68 Rated",
            pos: [0.25, -0.72, 0.25],
          },
          {
            id: "copper-lugs",
            title: "DIN 46235 Pure Copper Crimp Lugs",
            component: "Heavy Duty Tubular Cable Lugs",
            desc: "Hydraulically crimped with hexagonal dies onto stripped XLPE cores; zero heating under 400A continuous load.",
            technical: "Material: 99.97% Pure Copper · Electro-tinned 15µm · DIN 46235 stamped",
            pos: [0.22, -0.15, 0.25],
          },
          {
            id: "copper-busbars",
            title: "99.97% Solid ETP Copper Busbars",
            component: "Electrolytic Copper Busbars",
            desc: "Heavy 50x6mm pure electrolytic copper busbars distributing power from incomer to feeder poles.",
            technical: "Conductivity: 101% IACS · Max Temp: 90°C · Silver-plated contact palms",
            pos: [0.22, 0.25, 0.25],
          },
          {
            id: "mccb-breaker",
            title: "400A Incomer MCCB (Siemens 3VA2)",
            component: "Molded Case Circuit Breaker",
            desc: "4-Pole high-breaking-capacity MCCB with electronic trip unit (ETU) and silver-alloy contacts.",
            technical: "Rating: 400A · 36kA @ 415V · IEC 60947-2 · Sub-cycle arc extinction",
            pos: [0.55, 0.55, 0.28],
          },
          {
            id: "earth-busbar",
            title: "Galvanized Gland Plate & Earth Bar",
            component: "Grounding Continuity System",
            desc: "Heavy 3mm galvanized steel gland plate bonded with multi-point green/yellow earth conductors.",
            technical: "Ground fault withstand: 36kA · Bond resistance: < 0.1 mΩ · IS 3043",
            pos: [-0.65, -0.45, 0.25],
          },
        ],
        aiTour: [
          {
            title: "1. Overhead GI Cable Tray Feeder Entry",
            component: "Overhead GI Cable Ladder Tray",
            narration:
              "Welcome to the VOLA AI 3D tour. Incoming 400A power arrives through heavy 4-core XLPE armoured cable routed across hot-dip galvanized cable ladder trays.",
            cameraPos: { x: 0, y: 0.9, z: 4.6 },
            targetRot: { x: -0.08, y: 0.05 },
            zoom: 4.6,
            explodeLevel: 0,
            visionMode: "reality",
            hotspotId: "cable-tray",
            durationMs: 6500,
          },
          {
            title: "2. M63 Double-Compression Brass Glands",
            component: "Armour Clamping & Gas-Tight Glands",
            narration:
              "The feeder enters through dual M63 naval brass glands. Notice the internal conical ring clamping the steel wire armour to create a permanent 36 kiloamp earth fault path.",
            cameraPos: { x: 0.25, y: -0.5, z: 3.8 },
            targetRot: { x: 0.12, y: -0.12 },
            zoom: 3.8,
            explodeLevel: 30,
            visionMode: "reality",
            hotspotId: "brass-glands",
            durationMs: 7000,
          },
          {
            title: "3. DIN 46235 Pure Copper Crimp Lugs",
            component: "Hydraulic Hexagonal Termination",
            narration:
              "Each phase conductor is terminated with DIN 46235 pure electrolytic copper lugs, hydraulically pressed at 120 kilonewtons. Electro-tinning ensures zero oxidation.",
            cameraPos: { x: 0.22, y: -0.1, z: 3.4 },
            targetRot: { x: 0.05, y: 0.08 },
            zoom: 3.4,
            explodeLevel: 20,
            visionMode: "reality",
            hotspotId: "copper-lugs",
            durationMs: 7000,
          },
          {
            title: "4. Solid Copper Busbars & 400A MCCB",
            component: "Main Incomer Switchgear",
            narration:
              "Power feeds directly into solid 99.97% ETP copper busbars leading to the Siemens 3VA2 400A breaker. Fast de-ion arc chutes quench short circuits in milliseconds.",
            cameraPos: { x: 0.45, y: 0.4, z: 3.6 },
            targetRot: { x: 0.05, y: 0.18 },
            zoom: 3.6,
            explodeLevel: 10,
            visionMode: "reality",
            hotspotId: "mccb-breaker",
            durationMs: 7500,
          },
          {
            title: "5. FLIR Thermal Infrared Heat Dissipation",
            component: "400A Full Load Thermal Scan",
            narration:
              "Switching to thermal scan: under full 400A load, solid copper busbars run at 68 degrees Celsius, well below the 90 degree IEC allowable limit.",
            cameraPos: { x: 0, y: 0.1, z: 4.8 },
            targetRot: { x: 0.1, y: 0.2 },
            zoom: 4.8,
            explodeLevel: 0,
            visionMode: "thermal",
            durationMs: 7000,
          },
        ],
      },
      {
        id: "cable-cutaway",
        name: "1.1kV 4-Core XLPE Armoured Power Cable",
        badge: "AI 3D LAYER CUTAWAY",
        subtitle:
          "Macro Cutaway: Electrolytic Copper Strands ➔ XLPE Insulation ➔ Inner Bedding ➔ Steel Wire Armour (GSWA) ➔ FRLS Outer Jacket",
        categorySlug: "wire-cables",
        categoryName: "Wire & Cables",
        realImage: "/products/cable-cross-section.jpg",
        specs: {
          title: "1.1kV 4C x 185 sq.mm XLPE Armoured Copper Cable",
          role: "Primary heavy power transmission feeder for underground trenches, industrial cable trays, and substations",
          standard: "IS 7098 (Part 1) / IEC 60502-1 / BS 5467",
          material: "99.97% Electrolytic Copper + Extruded XLPE + Galvanized Steel Wire Armour + FRLS PVC",
          price: "₹1,480 / Mtr",
          stock: "12,500+ Mtrs Ready in Ahmedabad",
          ampacity: "415A in Air / 380A in Ground",
          shortCircuit: "26.4kA / 1 sec",
          torque: "Minimum Bending Radius: 12 x Outer Diameter",
        },
        hotspots: [
          {
            id: "copper-strands",
            title: "Compacted Electrolytic Copper Strands",
            component: "Class 2 Stranded Conductor",
            desc: "99.97% pure oxygen-free high-conductivity copper strands compacted into sector-shaped cores to reduce cable diameter.",
            technical: "Purity: 99.97% ETP · Resistivity: 0.017241 Ω·mm²/m @ 20°C",
            pos: [0.08, 0.08, 0.25],
          },
          {
            id: "xlpe-insulation",
            title: "Cross-Linked Polyethylene (XLPE) Insulation",
            component: "High-Dielectric Insulation",
            desc: "Thermoset polymer providing 90°C continuous service temperature and high dielectric breakdown resistance.",
            technical: "Voltage Grade: 1100V · Dielectric Strength: 30 kV/mm · IS 7098 Part 1",
            pos: [-0.28, 0.22, 0.25],
          },
          {
            id: "steel-armour",
            title: "Galvanized Steel Wire Armour (GSWA)",
            component: "Heavy Mechanical Armour Cage",
            desc: "Continuous spiral galvanized steel wire cage protecting against crushing forces, backhoes, and rodent attacks.",
            technical: "Tensile Strength: 390-540 N/mm² · Zinc mass: > 180 g/m²",
            pos: [-0.52, -0.12, 0.25],
          },
          {
            id: "outer-jacket",
            title: "FRLS Heavy Duty Outer Jacket",
            component: "Flame Retardant Low Smoke Jacket",
            desc: "Special UV-stabilized zero-halogen thermoplastic polymer preventing flame propagation and emitting minimal smoke.",
            technical: "Oxygen Index: > 30% · Temperature Index: > 250°C · Color: Jet Black",
            pos: [0.52, 0.32, 0.25],
          },
        ],
        aiTour: [
          {
            title: "1. Pure Copper Compacted Conductor Cores",
            component: "99.97% ETP Copper Conductors",
            narration:
              "Inspecting the high-conductivity copper core. Notice the sector-shaped compaction that maximizes current density while minimizing total outer diameter.",
            cameraPos: { x: 0.1, y: 0.1, z: 3.5 },
            targetRot: { x: 0.05, y: 0.1 },
            zoom: 3.5,
            explodeLevel: 0,
            visionMode: "reality",
            hotspotId: "copper-strands",
            durationMs: 6500,
          },
          {
            title: "2. Cross-Linked XLPE Thermoset Insulation",
            component: "90°C Continuous Service Insulation",
            narration:
              "Extruded cross-linked polyethylene insulation offers superior dielectric strength and withstands emergency short-circuit overloads up to 250 degrees.",
            cameraPos: { x: -0.2, y: 0.2, z: 3.4 },
            targetRot: { x: 0.1, y: -0.15 },
            zoom: 3.4,
            explodeLevel: 10,
            visionMode: "reality",
            hotspotId: "xlpe-insulation",
            durationMs: 6500,
          },
        ],
      },
      {
        id: "lug-gland",
        name: "Pure Copper DIN Crimp Lugs & Brass Cable Glands",
        badge: "AI 3D HARDWARE MACRO",
        subtitle:
          "DIN 46235 Pure ETP Copper Tubular Lugs & BS 6121 Double Compression High-Tensile Naval Brass Glands",
        categorySlug: "lugs",
        categoryName: "Cable Lugs & Glands",
        realImage: "/products/cable-lugs-macro.jpg",
        specs: {
          title: "Heavy-Duty Copper Tubular Lug & Brass Gland Assembly",
          role: "Guarantees zero-resistance electrical termination on switchgear busbars and weatherproof mechanical grip on cable armour",
          standard: "DIN 46235 / IS 8309 / BS 6121 / IS 12943 / IEC 61238",
          material: "100% Pure ETP Copper (15µm Tin Plated) + High-Tensile Naval Brass (CZ121)",
          price: "₹142 (Lug) / ₹345 (Gland)",
          stock: "8,400+ Lugs / 3,200+ Glands Ready",
          ampacity: "Rated up to 500A Continuous",
          shortCircuit: "Tested to 40kA / 1 sec",
          torque: "Recommended Crimp Pressure: 120 kN",
        },
        hotspots: [
          {
            id: "lug-barrel",
            title: "DIN 46235 Pure Copper Crimp Barrel",
            component: "Heavy Gauge Copper Barrel",
            desc: "Extra-heavy seamless electrolytic copper tube with stamped DIN markings indicating hexagonal crimp die size.",
            technical: "Purity: 99.97% ETP · Tin Plating: 15µm · DIN 46235 / IS 8309 certified",
            pos: [-0.32, 0.15, 0.25],
          },
          {
            id: "lug-palm",
            title: "M12 Bolted Contact Palm",
            component: "Bolted Terminal Palm",
            desc: "Mirror-flat electro-tinned palm with precision M12 bolt hole for maximum contact area against copper busbars.",
            technical: "Contact Area: 420 mm² · Bolt Size: M12 · Contact Resistance: < 0.05 mΩ",
            pos: [-0.32, 0.65, 0.25],
          },
          {
            id: "gland-body",
            title: "Double Compression Brass Gland Body",
            component: "CZ121 Naval Brass Body",
            desc: "Two-stage compression body that locks inner cable bedding and outer sheath simultaneously with armour clamp cone.",
            technical: "Material: CZ121 Brass · Thread: Metric ISO · IP66 / IP68 Gas-Tight",
            pos: [0.38, -0.15, 0.25],
          },
        ],
        aiTour: [
          {
            title: "1. DIN 46235 Crimp Gauge & Markings",
            component: "Seamless ETP Copper Tube",
            narration:
              "Examining the DIN 46235 lug barrel. The stamped rings guide the crimp operator on exact die positioning to produce gas-tight hexagonal compaction.",
            cameraPos: { x: -0.3, y: 0.3, z: 3.3 },
            targetRot: { x: 0.05, y: -0.1 },
            zoom: 3.3,
            explodeLevel: 0,
            visionMode: "reality",
            hotspotId: "lug-barrel",
            durationMs: 6500,
          },
        ],
      },
      {
        id: "switchgear-mccb",
        name: "400A Incomer MCCB & Substation Vacuum Switchgear",
        badge: "AI 3D SWITCHGEAR VCB",
        subtitle:
          "4-Pole 36kA Molded Case Circuit Breaker & 11kV Substation Vacuum Circuit Breaker with Arc Extinction Chambers",
        categorySlug: "switch-gears",
        categoryName: "Industrial Switchgear",
        realImage: "/products/substation-vcb-real.jpg",
        specs: {
          title: "400A 4-Pole 36kA MCCB & Substation VCB Panel",
          role: "High-voltage and low-voltage circuit protection capable of interrupting destructive short circuits in milliseconds",
          standard: "IS/IEC 60947-2 / IEC 62271-100 / CE Certified",
          material: "Thermoset DMC Molded Housing + Electrolytic Copper Palms + Ceramic Vacuum Bottles",
          price: "₹16,850 / Unit",
          stock: "140+ Units Ready in Ahmedabad",
          ampacity: "400A Low Voltage / 1250A Medium Voltage",
          shortCircuit: "36kA Low Voltage / 25kA @ 11kV",
          torque: "Closing Time: < 45 ms · Tripping Time: < 35 ms",
        },
        hotspots: [
          {
            id: "vacuum-bottle",
            title: "Vacuum Interrupter Arc Quenching Bottle",
            component: "Sealed Ceramic Vacuum Bottle",
            desc: "High-vacuum ceramic chamber where circuit contacts separate; the absolute vacuum eliminates electric arcs instantly.",
            technical: "Dielectric Withstand: 28kV RMS / 75kV Peak · Contact Material: CuCr alloy",
            pos: [0.02, 0.12, 0.25],
          },
          {
            id: "busbar-stabs",
            title: "Solid Copper Primary Disconnecting Contacts",
            component: "Silver-Plated Tulip Contacts",
            desc: "Heavy spring-loaded copper tulip contacts that rack into the energized substation busbar spouts.",
            technical: "Continuous Current: 1250A · Contact Finger Pressure: 180 N · Silver Plated",
            pos: [0.02, 0.68, 0.25],
          },
        ],
        aiTour: [
          {
            title: "1. 11kV Ceramic Vacuum Interrupter",
            component: "High-Vacuum Arc Extinction",
            narration:
              "Inspecting the sealed vacuum interrupter. Contact separation occurs inside a deep vacuum, quenching destructive 25 kiloamp arcs at the first current zero.",
            cameraPos: { x: 0, y: 0.3, z: 3.5 },
            targetRot: { x: 0.05, y: 0.1 },
            zoom: 3.5,
            explodeLevel: 10,
            visionMode: "reality",
            hotspotId: "vacuum-bottle",
            durationMs: 7000,
          },
        ],
      },
    ],
    []
  );

  // States
  const [activeModelId, setActiveModelId] = useState<ModelType>("panel-assembly");
  const [visionMode, setVisionMode] = useState<VisionMode>("reality");
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodeLevel, setExplodeLevel] = useState(0);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHud, setShowHud] = useState(true);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "hotspots" | "ai-tour">("ai-tour");

  // AI 3D Guided Animation Tour States
  const [isAiTourPlaying, setIsAiTourPlaying] = useState(false);
  const [currentTourStepIdx, setCurrentTourStepIdx] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isCurrentFlowActive, setIsCurrentFlowActive] = useState(true);

  // Screen-space hotspot coords calculated each frame
  const [screenHotspots, setScreenHotspots] = useState<
    Array<{ id: string; x: number; y: number; visible: boolean }>
  >([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.12, y: 0.22 });
  const zoomRef = useRef(5.2);
  const mouseParallaxRef = useRef({ x: 0, y: 0 });

  // Camera animation target refs for smooth cinematic tweening
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.2, 5.2));
  const targetRotRef = useRef<{ x: number; y: number }>({ x: 0.12, y: 0.22 });
  const targetZoomRef = useRef(5.2);

  const currentPreset = modelPresets.find((m) => m.id === activeModelId) || modelPresets[0];
  const activeHotspotData = currentPreset.hotspots.find((h) => h.id === selectedHotspot);
  const currentTourStep = currentPreset.aiTour[currentTourStepIdx] || currentPreset.aiTour[0];

  // Speech synthesis helper
  const speakNarration = useCallback(
    (text: string) => {
      if (!isVoiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(
          (v) =>
            v.lang.startsWith("en") &&
            (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("David"))
        );
        if (engVoice) utterance.voice = engVoice;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Speech synthesis error", e);
      }
    },
    [isVoiceEnabled]
  );

  // Stop voice on unmount or pause
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    modelGroup: THREE.Group;
    layerMeshes: THREE.Object3D[];
    currentFlowPoints: THREE.Points | null;
    animFrame: number | null;
  } | null>(null);

  // -------------------------------------------------------------
  // THREE.JS 3D ENGINE WITH TRUE 3D PHYSICAL ASSEMBLY & BRIGHT LIGHTING
  // -------------------------------------------------------------
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1000;
    const height = mount.clientHeight || 750;

    // 1. Scene with High-Quality Ambient Lighting & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.Fog(0x070b14, 16, 42);

    // 2. Camera centered precisely at the panel
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.2, zoomRef.current);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with High-Performance Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.replaceChildren(renderer.domElement);

    // 4. Bright, Radiant Studio Lighting Suite (Eliminates all dark/black shadows)
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 2.0);
    scene.add(hemiLight);

    const frontKeyLight = new THREE.DirectionalLight(0xfffaed, 3.0);
    frontKeyLight.position.set(0, 2, 6);
    scene.add(frontKeyLight);

    const studioKeyLight = new THREE.DirectionalLight(0xfff8ee, 2.8);
    studioKeyLight.position.set(5, 7, 4);
    scene.add(studioKeyLight);

    const coolRimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    coolRimLight.position.set(-6, 3, -2);
    scene.add(coolRimLight);

    const warmCopperRim = new THREE.DirectionalLight(0xf97316, 2.4);
    warmCopperRim.position.set(6, -1, 3);
    scene.add(warmCopperRim);

    // 5. 3D Animated Cable Store Background Group
    const bgStoreGroup = new THREE.Group();
    scene.add(bgStoreGroup);

    const animStoreData: {
      backdropMesh: THREE.Mesh | null;
      energyPoints: THREE.Points | null;
      dustPoints: THREE.Points | null;
    } = {
      backdropMesh: null,
      energyPoints: null,
      dustPoints: null,
    };

    buildAnimatedCableStoreBackground3D(bgStoreGroup, animStoreData);

    // 6. Foreground True 3D Physical Assembly Model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    const layerMeshes: THREE.Object3D[] = [];

    // Build the Physical 3D Digital Twin Assembly
    const twinResult = buildSolid3DIndustrialTwin(
      modelGroup,
      layerMeshes,
      currentPreset,
      renderer
    );

    // 7. Animation Loop with Parallax & Camera LookAt
    let animFrame: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrame = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth Cinematic Camera Tweening during AI Tour
      if (isAiTourPlaying) {
        rotationRef.current.x += (targetRotRef.current.x - rotationRef.current.x) * 0.06;
        rotationRef.current.y += (targetRotRef.current.y - rotationRef.current.y) * 0.06;
        zoomRef.current += (targetZoomRef.current - zoomRef.current) * 0.06;
        camera.position.x += (targetCamPosRef.current.x - camera.position.x) * 0.06;
        camera.position.y += (targetCamPosRef.current.y - camera.position.y) * 0.06;
        camera.position.z += (targetCamPosRef.current.z - camera.position.z) * 0.06;
      } else {
        if (autoRotate && !isDraggingRef.current) {
          rotationRef.current.y += 0.0035;
        }
        camera.position.x += (0 - camera.position.x) * 0.08;
        camera.position.y += (0.2 - camera.position.y) * 0.08;
        camera.position.z += (zoomRef.current - camera.position.z) * 0.08;
      }

      // CRITICAL: Always look directly at the center of the panel
      camera.lookAt(0, 0, 0);

      modelGroup.rotation.x = rotationRef.current.x;
      modelGroup.rotation.y = rotationRef.current.y;

      // Parallax Shift on 3D Cable Store Backdrop
      bgStoreGroup.position.x += (mouseParallaxRef.current.x * 0.7 - bgStoreGroup.position.x) * 0.08;
      bgStoreGroup.position.y += (-mouseParallaxRef.current.y * 0.4 - bgStoreGroup.position.y) * 0.08;
      bgStoreGroup.rotation.y += (mouseParallaxRef.current.x * 0.06 - bgStoreGroup.rotation.y) * 0.08;

      // Electrical Sparks along ceiling trays
      if (animStoreData.energyPoints && animStoreData.energyPoints.geometry) {
        const positions = animStoreData.energyPoints.geometry.attributes.position.array as Float32Array;
        for (let i = 2; i < positions.length; i += 3) {
          positions[i] += 0.12;
          if (positions[i] > 3.0) {
            positions[i] = -14.0;
          }
        }
        animStoreData.energyPoints.geometry.attributes.position.needsUpdate = true;
      }

      // 400A Live Current Flow Particles
      if (twinResult.currentFlowPoints && twinResult.currentFlowPoints.geometry) {
        twinResult.currentFlowPoints.visible = isCurrentFlowActive;
        const cpos = twinResult.currentFlowPoints.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < cpos.length; i += 3) {
          cpos[i] += 0.025;
          if (cpos[i] > 0.8) {
            cpos[i] = -0.9;
          }
        }
        twinResult.currentFlowPoints.geometry.attributes.position.needsUpdate = true;
      }

      // Dust motes
      if (animStoreData.dustPoints && animStoreData.dustPoints.geometry) {
        const dustPos = animStoreData.dustPoints.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < dustPos.length; i += 3) {
          dustPos[i] += Math.sin(elapsed * 1.4 + i) * 0.0022;
        }
        animStoreData.dustPoints.geometry.attributes.position.needsUpdate = true;
      }

      // Project Hotspots into 2D Screen Space
      if (mount) {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        const projected: Array<{ id: string; x: number; y: number; visible: boolean }> = [];

        currentPreset.hotspots.forEach((spot) => {
          const v = new THREE.Vector3(spot.pos[0], spot.pos[1], spot.pos[2]);
          v.applyMatrix4(modelGroup.matrixWorld);

          const isFacing = v.z < camera.position.z;
          v.project(camera);

          const screenX = (v.x * 0.5 + 0.5) * w;
          const screenY = (-(v.y * 0.5) + 0.5) * h;

          projected.push({
            id: spot.id,
            x: screenX,
            y: screenY,
            visible: isFacing && v.z >= -1 && v.z <= 1,
          });
        });

        setScreenHotspots(projected);
      }

      renderer.render(scene, camera);
    };

    animFrame = requestAnimationFrame(animate);

    threeRef.current = {
      scene,
      camera,
      renderer,
      modelGroup,
      layerMeshes,
      currentFlowPoints: twinResult.currentFlowPoints,
      animFrame,
    };

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrame);
      renderer.dispose();
      mount.replaceChildren();
      threeRef.current = null;
    };
  }, [activeModelId, currentPreset, isCurrentFlowActive]);

  // Update Exploded Layers view in real-time
  useEffect(() => {
    if (!threeRef.current) return;
    const factor = explodeLevel / 100;
    threeRef.current.layerMeshes.forEach((mesh) => {
      const offsetX = (mesh.userData?.explodeX || 0) * factor;
      const offsetY = (mesh.userData?.explodeY || 0) * factor;
      const offsetZ = (mesh.userData?.explodeZ || 0) * factor;

      mesh.position.x = (mesh.userData?.initialX || 0) + offsetX;
      mesh.position.y = (mesh.userData?.initialY || 0) + offsetY;
      mesh.position.z = (mesh.userData?.initialZ || 0) + offsetZ;
    });
  }, [explodeLevel]);

  // AI 3D Guided Tour Execution Engine
  const executeTourStep = useCallback(
    (stepIdx: number) => {
      if (!currentPreset.aiTour[stepIdx]) return;
      const step = currentPreset.aiTour[stepIdx];

      setCurrentTourStepIdx(stepIdx);
      targetCamPosRef.current.set(step.cameraPos.x, step.cameraPos.y, step.cameraPos.z);
      targetRotRef.current = { x: step.targetRot.x, y: step.targetRot.y };
      targetZoomRef.current = step.zoom;
      setExplodeLevel(step.explodeLevel);
      setVisionMode(step.visionMode);
      setSelectedHotspot(step.hotspotId || null);

      speakNarration(step.narration);
    },
    [currentPreset, speakNarration]
  );

  // Auto-advance AI Tour when playing
  useEffect(() => {
    if (!isAiTourPlaying) return;

    executeTourStep(currentTourStepIdx);

    const stepDuration = currentPreset.aiTour[currentTourStepIdx]?.durationMs || 7000;
    const timer = setTimeout(() => {
      if (currentTourStepIdx < currentPreset.aiTour.length - 1) {
        setCurrentTourStepIdx((prev) => prev + 1);
      } else {
        setIsAiTourPlaying(false);
        setCameraPreset("front");
      }
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [isAiTourPlaying, currentTourStepIdx, currentPreset, executeTourStep]);

  // Trigger Instant AI Actions
  const handleTriggerAiAction = (action: "flow" | "explode" | "thermal" | "macro") => {
    setAutoRotate(false);
    if (action === "flow") {
      setIsCurrentFlowActive((prev) => !prev);
      speakNarration(
        isCurrentFlowActive
          ? "Halting 400A current simulation."
          : "Simulating 400 Ampere power flow through incoming XLPE feeder, brass glands, copper lugs, and MCCB contacts."
      );
    } else if (action === "explode") {
      setIsAiTourPlaying(false);
      const nextLevel = explodeLevel > 0 ? 0 : 65;
      setExplodeLevel(nextLevel);
      speakNarration(
        nextLevel > 0
          ? "Exploding 3D physical enclosure to inspect internal busbar routing, gland plate, and crimp lugs."
          : "Reassembling 3D industrial enclosure."
      );
    } else if (action === "thermal") {
      setIsAiTourPlaying(false);
      const nextMode = visionMode === "thermal" ? "reality" : "thermal";
      setVisionMode(nextMode);
      speakNarration(
        nextMode === "thermal"
          ? "Activating FLIR thermal infrared scan: copper busbar junctions running at 68 degrees Celsius under 400A continuous load."
          : "Restoring photorealistic reality mode."
      );
    } else if (action === "macro") {
      setIsAiTourPlaying(false);
      setCameraPreset("focus");
      setSelectedHotspot("copper-lugs");
      speakNarration(
        "Focusing macro 3D camera on DIN 46235 heavy pure copper crimp lugs and M12 high-tensile bolted palms."
      );
    }
  };

  // Mouse & Touch 360 Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
    if (isAiTourPlaying) {
      setIsAiTourPlaying(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / rect.width - 0.5;
      const normY = (e.clientY - rect.top) / rect.height - 0.5;
      mouseParallaxRef.current = { x: normX, y: normY };
    }

    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    rotationRef.current.y += deltaX * 0.007;
    rotationRef.current.x += deltaY * 0.007;
    rotationRef.current.x = Math.max(-Math.PI / 2.6, Math.min(Math.PI / 2.6, rotationRef.current.x));

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(3.2, Math.min(8.0, zoomRef.current + e.deltaY * 0.0035));
  };

  // View Preset Camera Angles
  const setCameraPreset = (type: "front" | "iso" | "top" | "focus") => {
    setAutoRotate(false);
    setIsAiTourPlaying(false);
    if (type === "front") {
      rotationRef.current = { x: 0, y: 0 };
      zoomRef.current = 5.2;
    } else if (type === "iso") {
      rotationRef.current = { x: 0.22, y: 0.35 };
      zoomRef.current = 5.4;
    } else if (type === "top") {
      rotationRef.current = { x: Math.PI / 2.3, y: 0 };
      zoomRef.current = 5.6;
    } else if (type === "focus") {
      rotationRef.current = { x: 0.05, y: 0.1 };
      zoomRef.current = 3.4;
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full select-none overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-[800px] sm:h-[880px] lg:h-[940px]"
      } bg-[#070b14]`}
    >
      {/* 3D WEBGL CANVAS VIEWPORT */}
      <div
        ref={canvasMountRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none transition-filter duration-300 ${
          visionMode === "thermal"
            ? "hue-rotate-[180deg] saturate-[2.4] contrast-[1.3]"
            : visionMode === "blueprint"
            ? "invert hue-rotate-[190deg] saturate-[2.0] contrast-[1.4]"
            : ""
        }`}
      />

      {/* FLOATING 3D SCREEN-SPACE HOTSPOT PINS */}
      {showHud && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          {screenHotspots.map((spot) => {
            if (!spot.visible) return null;
            const hotspotData = currentPreset.hotspots.find((h) => h.id === spot.id);
            if (!hotspotData) return null;
            const isSelected = selectedHotspot === spot.id;

            return (
              <div
                key={spot.id}
                style={{
                  left: `${spot.x}px`,
                  top: `${spot.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute pointer-events-auto transition-transform hover:scale-110"
              >
                <button
                  onClick={() => {
                    setIsAiTourPlaying(false);
                    setSelectedHotspot(isSelected ? null : spot.id);
                    if (!isSelected) {
                      speakNarration(hotspotData.desc);
                    }
                  }}
                  className="relative group flex items-center justify-center cursor-pointer"
                  title={hotspotData.title}
                >
                  <span
                    className={`absolute size-8 rounded-full animate-ping opacity-60 ${
                      isSelected ? "bg-[#ec6437]" : "bg-cyan-400"
                    }`}
                  />
                  <span
                    className={`relative size-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-colors ${
                      isSelected
                        ? "bg-[#ec6437] shadow-[#ec6437]/80"
                        : "bg-cyan-500 group-hover:bg-[#ec6437] shadow-cyan-500/80"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-white" />
                  </span>

                  {!isSelected && (
                    <span className="absolute left-6 whitespace-nowrap px-2.5 py-1 rounded-md bg-black/85 border border-white/20 text-[10px] font-mono font-bold text-white shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {hotspotData.title}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TOP HEADER: BRAND + PRESETS + AI ACTIONS */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 sm:p-6 flex flex-col gap-3 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#ec6437] to-[#d94819] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#ec6437]/40 ring-1 ring-white/20">
              V
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wider uppercase">
                  VOLAMP 3D AI ELECTRICAL TWIN
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ec6437]/25 text-[#ec6437] border border-[#ec6437]/40 flex items-center gap-1">
                  <Cpu className="size-3" /> AI 3D CO-PILOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                AI-Driven 3D Physical Assembly Animation · Live 400A Current Simulation · Voice Guided Tour
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Quick AI Action Pills */}
            <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md shadow-md">
              <button
                onClick={() => handleTriggerAiAction("flow")}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrentFlowActive
                    ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Toggle 400A Live Electrical Current Flow Particles"
              >
                <Zap className="size-3 text-cyan-400 animate-pulse" />
                <span>400A FLOW</span>
              </button>

              <button
                onClick={() => handleTriggerAiAction("explode")}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  explodeLevel > 0
                    ? "bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-md shadow-amber-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="AI 3D Exploded Layer Disassembly"
              >
                <Layers className="size-3 text-amber-400" />
                <span>EXPLODE 3D</span>
              </button>

              <button
                onClick={() => handleTriggerAiAction("thermal")}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  visionMode === "thermal"
                    ? "bg-red-500/25 text-red-300 border border-red-400/50 shadow-md shadow-red-500/30"
                    : "text-slate-400 hover:text-white"
                }`}
                title="FLIR Thermal Infrared Heat Dissipation Scan"
              >
                <Flame className="size-3 text-red-400" />
                <span>THERMAL SCAN</span>
              </button>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.02]"
              title="Open AI Electrical Cable Sizer & Hardware Calculator"
            >
              <Bot className="size-3.5 text-emerald-400" />
              <span className="hidden sm:inline">AI CABLE SIZER</span>
            </button>

            {/* Focus / HUD Toggle */}
            <button
              onClick={() => setShowHud((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full border text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                showHud
                  ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                  : "bg-[#ec6437] border-[#ec6437] text-white shadow-[#ec6437]/40 font-bold"
              }`}
              title={showHud ? "Hide HUD Overlays for Clean View" : "Show HUD Technical Overlays"}
            >
              <Eye className="size-3.5" />
              <span className="hidden sm:inline">{showHud ? "CLEAN" : "HUD"}</span>
            </button>

            {onOpenShowroomLab && (
              <button
                onClick={() => onOpenShowroomLab(currentPreset.id)}
                className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#ec6437] text-white text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                title="Inspect in 360° AR Lab"
              >
                <Zap className="size-3.5 text-amber-400" />
                <span className="hidden sm:inline">360° AR</span>
              </button>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-full bg-black/60 hover:bg-white/15 border border-white/10 text-white transition-all cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>
        </div>

        {/* 4 Real Hardware Model Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
          {modelPresets.map((preset) => {
            const isActive = preset.id === activeModelId;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setActiveModelId(preset.id);
                  setExplodeLevel(0);
                  setSelectedHotspot(null);
                  setIsAiTourPlaying(false);
                  setCurrentTourStepIdx(0);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border backdrop-blur-md ${
                  isActive
                    ? "bg-gradient-to-r from-[#ec6437] to-[#d94819] text-white border-[#ec6437] shadow-lg shadow-[#ec6437]/30 scale-[1.02]"
                    : "bg-black/60 hover:bg-white/10 text-slate-300 border-white/10 hover:border-white/20"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${
                    isActive ? "bg-white animate-pulse" : "bg-[#ec6437]"
                  }`}
                />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CENTER TOP: AI 3D GUIDED TOUR CONTROLLER & SPEECH BANNER */}
      {showHud && (
        <div className="absolute top-28 sm:top-24 inset-x-4 sm:inset-x-0 mx-auto max-w-xl z-30 pointer-events-none">
          <div className="p-3 sm:p-4 rounded-2xl bg-black/85 backdrop-blur-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Bot className="size-3.5 text-cyan-400" />
                  <span>AI 3D CO-PILOT: {currentTourStep.title}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isVoiceEnabled
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40"
                      : "bg-white/5 text-slate-500 border-white/10"
                  }`}
                  title={isVoiceEnabled ? "Mute Voice Narration" : "Enable Voice Narration"}
                >
                  {isVoiceEnabled ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
                </button>

                <button
                  onClick={() => {
                    if (isAiTourPlaying) {
                      setIsAiTourPlaying(false);
                      if (typeof window !== "undefined" && "speechSynthesis" in window) {
                        window.speechSynthesis.cancel();
                      }
                    } else {
                      setIsAiTourPlaying(true);
                      executeTourStep(currentTourStepIdx);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isAiTourPlaying
                      ? "bg-amber-500 text-black shadow-amber-500/40"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-cyan-500/40 hover:scale-[1.02]"
                  }`}
                >
                  {isAiTourPlaying ? (
                    <>
                      <Pause className="size-3 fill-current" />
                      <span>PAUSE AI TOUR</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3 fill-current" />
                      <span>START 3D AI TOUR</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const next = (currentTourStepIdx + 1) % currentPreset.aiTour.length;
                    setCurrentTourStepIdx(next);
                    executeTourStep(next);
                  }}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Next AI Tour Step"
                >
                  <FastForward className="size-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans bg-white/5 p-2 rounded-xl border border-white/10">
              "{currentTourStep.narration}"
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-mono text-slate-400">
                STEP {currentTourStepIdx + 1} OF {currentPreset.aiTour.length} ·{" "}
                {currentTourStep.component}
              </span>
              <div className="flex items-center gap-1.5">
                {currentPreset.aiTour.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentTourStepIdx(idx);
                      executeTourStep(idx);
                    }}
                    className={`size-2 rounded-full transition-all cursor-pointer ${
                      idx === currentTourStepIdx
                        ? "bg-cyan-400 w-4 shadow-sm shadow-cyan-400"
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LEFT FLOATING ENGINEERING HUD */}
      {showHud && (
        <div className="absolute left-4 sm:left-6 bottom-16 sm:bottom-20 z-30 max-w-sm sm:max-w-md w-full space-y-3 pointer-events-none">
          {activeHotspotData ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/90 backdrop-blur-2xl border-2 border-[#ec6437] shadow-2xl shadow-[#ec6437]/30 space-y-3 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#ec6437] uppercase tracking-wider">
                    <span className="size-1.5 rounded-full bg-[#ec6437]" />
                    <span>PIN INSPECTION · {activeHotspotData.component}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white mt-0.5">
                    {activeHotspotData.title}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="size-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeHotspotData.desc}
              </p>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-cyan-300 space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">
                  ENGINEERING RATINGS:
                </span>
                <p>{activeHotspotData.technical}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Bot className="size-3.5" />
                  <span>CALCULATE CABLE & LUGS</span>
                </button>
                <button
                  onClick={() => onNavigate(currentPreset.categorySlug)}
                  className="py-2 px-3 rounded-xl bg-[#ec6437] hover:bg-[#d94819] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#ec6437]/30"
                >
                  <span>BROWSE SPEC</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl space-y-3 pointer-events-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ec6437]/20 text-[#ec6437] border border-[#ec6437]/30 uppercase">
                    {currentPreset.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    {currentPreset.specs.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                    {currentPreset.subtitle}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveTab("ai-tour")}
                  className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === "ai-tour"
                      ? "border-cyan-400 text-cyan-300"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Bot className="size-3 text-cyan-400" />
                  <span>AI TOUR ({currentPreset.aiTour.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab("hotspots")}
                  className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
                    activeTab === "hotspots"
                      ? "border-[#ec6437] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  HOTSPOTS
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-2 px-3 transition-colors cursor-pointer border-b-2 ${
                    activeTab === "specs"
                      ? "border-[#ec6437] text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  RATINGS
                </button>
              </div>

              {/* Tab Contents */}
              {activeTab === "ai-tour" && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {currentPreset.aiTour.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentTourStepIdx(idx);
                        executeTourStep(idx);
                      }}
                      className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                        idx === currentTourStepIdx
                          ? "bg-cyan-500/20 border-cyan-400/50 text-white shadow-md shadow-cyan-500/20"
                          : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`size-2 rounded-full ${
                            idx === currentTourStepIdx ? "bg-cyan-400 animate-pulse" : "bg-slate-500"
                          }`}
                        />
                        <span className="text-xs font-bold truncate">{step.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                        PLAY ➔
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "hotspots" && (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {currentPreset.hotspots.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspot(h.id)}
                      className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="size-2 rounded-full bg-[#ec6437] group-hover:scale-125 transition-transform" />
                        <span className="text-xs font-bold text-white truncate">{h.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#ec6437]">
                        INSPECT ➔
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === "specs" && (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">RATED CURRENT</span>
                    <span className="text-emerald-400 font-bold">{currentPreset.specs.ampacity}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 text-[10px] block">SHORT CIRCUIT (1s)</span>
                    <span className="text-amber-400 font-bold">{currentPreset.specs.shortCircuit}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 col-span-2">
                    <span className="text-slate-400 text-[10px] block">TORQUE / BENDING SPEC</span>
                    <span className="text-cyan-300 font-bold">{currentPreset.specs.torque}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Bot className="size-3.5 text-emerald-400" />
                  <span>AI CABLE SIZER</span>
                </button>
                <button
                  onClick={() => onNavigate(currentPreset.categorySlug)}
                  className="py-2 px-3.5 rounded-xl bg-[#ec6437] hover:bg-[#d94819] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-[#ec6437]/30"
                >
                  <span>ORDER CATALOG</span>
                  <ArrowRight className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RIGHT FLOATING CAD CONTROLS: EXPLODE SLIDER + CAMERA PRESETS */}
      {showHud && (
        <div className="absolute right-4 sm:right-6 bottom-16 sm:bottom-20 z-30 max-w-[240px] sm:max-w-[280px] w-full space-y-2.5 pointer-events-auto">
          {/* Camera Angles Toolbar */}
          <div className="p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/15 flex items-center justify-between text-xs font-mono shadow-xl">
            <button
              onClick={() => setCameraPreset("front")}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-bold transition-colors cursor-pointer"
            >
              FRONT
            </button>
            <button
              onClick={() => setCameraPreset("iso")}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-bold transition-colors cursor-pointer"
            >
              ISO 3D
            </button>
            <button
              onClick={() => setCameraPreset("top")}
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 font-bold transition-colors cursor-pointer"
            >
              TOP
            </button>
            <button
              onClick={() => setCameraPreset("focus")}
              className="px-2.5 py-1.5 rounded-lg text-amber-400 hover:bg-white/10 font-bold transition-colors cursor-pointer"
              title="Close-Up Macro Focus"
            >
              MACRO
            </button>
            <div className="w-px h-4 bg-white/15 mx-0.5" />
            <button
              onClick={() => setAutoRotate((prev) => !prev)}
              title={autoRotate ? "Pause 360° Auto-Rotate" : "Start 360° Auto-Rotate"}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                autoRotate ? "bg-[#ec6437]/20 text-[#ec6437]" : "text-slate-400 hover:text-white"
              }`}
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>

          {/* Explode 3D Physical Assembly Slider */}
          <div className="p-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 space-y-1.5 text-xs shadow-xl">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Layers className="size-3.5" /> EXPLODE ASSEMBLY:
              </span>
              <span className="text-[#ec6437] font-bold">{explodeLevel}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={explodeLevel}
              onChange={(e) => {
                setIsAiTourPlaying(false);
                setExplodeLevel(Number(e.target.value));
              }}
              className="w-full accent-[#ec6437] cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
              <span>ASSEMBLED</span>
              <span>50% DISASSEMBLE</span>
              <span>FULL EXPLODE</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CENTER: USER HINT */}
      <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="px-4 py-1.5 rounded-full bg-black/80 text-slate-300 text-xs font-mono border border-white/15 backdrop-blur-md shadow-2xl flex items-center gap-2">
          <Sparkles className="size-3.5 text-cyan-400" />
          <span>DRAG TO ROTATE 360° · AI 3D TOUR ACTIVE · CLICK HOTSPOTS TO INSPECT</span>
        </span>
      </div>

      {/* AI ELECTRICAL ASSISTANT & CABLE SIZER MODAL */}
      <AiElectricalViewerAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        activeModelName={currentPreset.name}
        activeModelSlug={currentPreset.categorySlug}
        onNavigateCategory={onNavigate}
        onOpenARModal={onOpenARModal}
      />
    </div>
  );
}

// ============================================================================
// SOLID 3D INDUSTRIAL PHYSICAL DIGITAL TWIN BUILDER (GENUINE DEPTH & REAL HARDWARE)
// ============================================================================

function buildSolid3DIndustrialTwin(
  group: THREE.Group,
  layerMeshes: THREE.Object3D[],
  preset: ModelPreset,
  renderer: THREE.WebGLRenderer
): { currentFlowPoints: THREE.Points | null } {
  const panelW = 2.8;
  const panelH = 1.95;
  const panelD = 0.42;

  // Materials with vibrant, crystal-clear reflectance (no dark shadows)
  const steelCabinetMat = new THREE.MeshStandardMaterial({
    color: 0x222e42, // Siemens Blue-Grey powder coat
    metalness: 0.5,
    roughness: 0.35,
  });

  const galvanizedMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  });

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xdf6936, // Gleaming 99.97% ETP Copper
    metalness: 0.92,
    roughness: 0.18,
  });

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4af37, // Naval Brass CZ121
    metalness: 0.9,
    roughness: 0.2,
  });

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.12,
  });

  const cableJacketMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5,
  });

  // 1. Heavy Industrial Steel Plinth Base
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(panelW + 0.3, 0.22, panelD + 0.1),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
  );
  plinth.position.set(0, -panelH / 2 - 0.15, 0);
  group.add(plinth);

  // 2. Heavy Solid 3D Enclosure Outer Cabinet Box (Back, Left, Right, Top, Bottom)
  const cabinetBack = new THREE.Mesh(
    new THREE.BoxGeometry(panelW + 0.16, panelH + 0.16, 0.05),
    steelCabinetMat
  );
  cabinetBack.position.set(0, 0, -panelD / 2);
  cabinetBack.userData = { initialZ: -panelD / 2, explodeZ: -0.5 };
  group.add(cabinetBack);
  layerMeshes.push(cabinetBack);

  const cabinetTop = new THREE.Mesh(
    new THREE.BoxGeometry(panelW + 0.2, 0.06, panelD),
    steelCabinetMat
  );
  cabinetTop.position.set(0, panelH / 2 + 0.03, 0);
  cabinetTop.userData = { initialY: panelH / 2 + 0.03, explodeY: 0.4 };
  group.add(cabinetTop);
  layerMeshes.push(cabinetTop);

  const cabinetBot = new THREE.Mesh(
    new THREE.BoxGeometry(panelW + 0.2, 0.06, panelD),
    steelCabinetMat
  );
  cabinetBot.position.set(0, -panelH / 2 - 0.03, 0);
  cabinetBot.userData = { initialY: -panelH / 2 - 0.03, explodeY: -0.4 };
  group.add(cabinetBot);
  layerMeshes.push(cabinetBot);

  const cabinetLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, panelH + 0.16, panelD),
    steelCabinetMat
  );
  cabinetLeft.position.set(-panelW / 2 - 0.03, 0, 0);
  cabinetLeft.userData = { initialX: -panelW / 2 - 0.03, explodeX: -0.4 };
  group.add(cabinetLeft);
  layerMeshes.push(cabinetLeft);

  const cabinetRight = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, panelH + 0.16, panelD),
    steelCabinetMat
  );
  cabinetRight.position.set(panelW / 2 + 0.03, 0, 0);
  cabinetRight.userData = { initialX: panelW / 2 + 0.03, explodeX: 0.4 };
  group.add(cabinetRight);
  layerMeshes.push(cabinetRight);

  // 3. Overhead Galvanized Cable Tray with slot perforations
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(panelW + 0.35, 0.06, 0.45),
    galvanizedMat
  );
  tray.position.set(0, panelH / 2 + 0.25, 0.08);
  tray.userData = { initialY: panelH / 2 + 0.25, explodeY: 0.6 };
  group.add(tray);
  layerMeshes.push(tray);

  for (let tx = -panelW / 2; tx <= panelW / 2; tx += 0.32) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 })
    );
    slot.position.set(tx, panelH / 2 + 0.25, 0.08);
    group.add(slot);
  }

  // 4. Internal Realistic Photographic Equipment Plate
  // We apply the texture with DoubleSide and subtle emissive so it NEVER goes black from any angle!
  const textureLoader = new THREE.TextureLoader();
  const plateGeo = new THREE.PlaneGeometry(panelW, panelH, 16, 16);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.08, // Low metalness keeps texture vibrant and bright
    roughness: 0.55,
    side: THREE.DoubleSide,
    emissive: 0x182030,
    emissiveIntensity: 0.25,
  });

  const plateMesh = new THREE.Mesh(plateGeo, plateMat);
  plateMesh.position.set(0, 0, -0.05);
  plateMesh.userData = { initialZ: -0.05, explodeZ: -0.2 };
  group.add(plateMesh);
  layerMeshes.push(plateMesh);

  textureLoader.load(
    preset.realImage,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      // @ts-ignore
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 8;
      plateMat.map = texture;
      plateMat.needsUpdate = true;
    },
    undefined,
    (err) => console.warn("Could not load hardware texture", err)
  );

  // 5. Solid 3D Physical Hardware Components in Foreground

  // A. 400A Siemens 3VA2 MCCB Switchgear (3D Body, Face, Toggle)
  const mccbBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.68, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x1c2436, roughness: 0.35, metalness: 0.6 })
  );
  mccbBody.position.set(0.55, 0.55, 0.12);
  mccbBody.userData = { initialZ: 0.12, explodeZ: 0.5 };
  group.add(mccbBody);
  layerMeshes.push(mccbBody);

  const toggle = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xec6437, roughness: 0.25 })
  );
  toggle.position.set(0.55, 0.55, 0.25);
  group.add(toggle);

  // B. 4 Solid 99.97% ETP Copper Busbars connecting to MCCB
  const phaseX = [0.26, 0.44, 0.64, 0.82];
  phaseX.forEach((bx) => {
    const busbar = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.42, 0.025),
      copperMat
    );
    busbar.position.set(bx, 0.15, 0.1);
    busbar.userData = { initialZ: 0.1, explodeZ: 0.35 };
    group.add(busbar);
    layerMeshes.push(busbar);

    // M12 Silver Bolted Studs on Busbars
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 0.05, 6),
      silverMat
    );
    bolt.rotateX(Math.PI / 2);
    bolt.position.set(bx, 0.15, 0.13);
    group.add(bolt);
  });

  // C. DIN 46235 Pure Copper Crimp Lugs (Barrels + Palms)
  phaseX.forEach((lx) => {
    const lugBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.16, 16),
      copperMat
    );
    lugBarrel.position.set(lx, -0.15, 0.1);
    lugBarrel.userData = { initialZ: 0.1, explodeZ: 0.25 };
    group.add(lugBarrel);
    layerMeshes.push(lugBarrel);

    const lugPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.1, 0.025),
      copperMat
    );
    lugPalm.position.set(lx, -0.05, 0.1);
    group.add(lugPalm);
  });

  // D. Bottom Gland Plate & M63 Double-Compression Naval Brass Glands
  const glandPlate = new THREE.Mesh(
    new THREE.BoxGeometry(panelW - 0.2, 0.04, 0.3),
    galvanizedMat
  );
  glandPlate.position.set(0, -panelH / 2 + 0.12, 0.06);
  glandPlate.userData = { initialY: -panelH / 2 + 0.12, explodeY: -0.3 };
  group.add(glandPlate);
  layerMeshes.push(glandPlate);

  phaseX.forEach((gx) => {
    const glandNut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.14, 6),
      brassMat
    );
    glandNut.position.set(gx, -panelH / 2 + 0.16, 0.1);
    glandNut.userData = { initialY: -panelH / 2 + 0.16, explodeY: -0.35 };
    group.add(glandNut);
    layerMeshes.push(glandNut);
  });

  // E. 4 Heavy Black XLPE Feeder Cables entering from the bottom
  const cableColors = [0xdc2626, 0xeab308, 0x2563eb, 0x1e293b]; // Red, Yellow, Blue, Black
  phaseX.forEach((cx, idx) => {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cx, -panelH / 2 - 0.3, 0.1),
      new THREE.Vector3(cx, -panelH / 2 + 0.16, 0.1),
      new THREE.Vector3(cx, -0.5, 0.09),
      new THREE.Vector3(cx, -0.24, 0.1),
    ]);
    const cableTube = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 20, 0.038, 12, false),
      new THREE.MeshStandardMaterial({ color: cableColors[idx], roughness: 0.45 })
    );
    cableTube.userData = { initialZ: 0.1, explodeZ: -0.15 };
    group.add(cableTube);
    layerMeshes.push(cableTube);
  });

  // F. Solid Copper Earth Busbar & Grounding Conductor
  const earthBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.04, 0.02),
    copperMat
  );
  earthBar.position.set(-0.55, -panelH / 2 + 0.35, 0.08);
  group.add(earthBar);

  const earthLead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.9, 10),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
  );
  earthLead.position.set(-0.55, -panelH / 2 - 0.1, 0.08);
  group.add(earthLead);

  // 6. Live 400A Electrical Current Particle Simulation
  const currentParticleCount = 180;
  const currentGeo = new THREE.BufferGeometry();
  const currentPos = new Float32Array(currentParticleCount * 3);

  for (let i = 0; i < currentParticleCount; i++) {
    const lineX = phaseX[i % 4];
    currentPos[i * 3] = lineX + (Math.random() - 0.5) * 0.025;
    currentPos[i * 3 + 1] = -panelH / 2 + Math.random() * 1.5;
    currentPos[i * 3 + 2] = 0.12 + (Math.random() - 0.5) * 0.02;
  }

  currentGeo.setAttribute("position", new THREE.BufferAttribute(currentPos, 3));
  const currentMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.085,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });
  const currentFlowPoints = new THREE.Points(currentGeo, currentMat);
  group.add(currentFlowPoints);

  return { currentFlowPoints };
}

// ============================================================================
// 3D ANIMATED CABLE STORE & WAREHOUSE BACKGROUND
// ============================================================================

function buildAnimatedCableStoreBackground3D(
  bgGroup: THREE.Group,
  animData: {
    backdropMesh: THREE.Mesh | null;
    energyPoints: THREE.Points | null;
    dustPoints: THREE.Points | null;
  }
) {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "/products/cable-store-background.jpg",
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;

      const backdropGeo = new THREE.PlaneGeometry(30, 15, 32, 16);
      const pos = backdropGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -(x * x) * 0.016);
      }
      backdropGeo.computeVertexNormals();

      const backdropMat = new THREE.MeshBasicMaterial({
        map: texture,
        depthWrite: false,
      });

      const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
      backdropMesh.position.set(0, 1.8, -10.5);
      bgGroup.add(backdropMesh);
      animData.backdropMesh = backdropMesh;
    },
    undefined,
    (err) => {
      console.warn("Could not load cable store texture", err);
    }
  );

  // Polished Industrial Showroom Floor
  const floorGeo = new THREE.PlaneGeometry(28, 24);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x090e18,
    metalness: 0.7,
    roughness: 0.3,
    transparent: true,
    opacity: 0.9,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.position.set(0, -1.5, -2);
  bgGroup.add(floorMesh);

  // Reflective Floor Grid Accent
  const grid = new THREE.GridHelper(18, 24, 0xec6437, 0x1e293b);
  grid.position.set(0, -1.49, -2);
  // @ts-ignore
  grid.material.opacity = 0.35;
  // @ts-ignore
  grid.material.transparent = true;
  bgGroup.add(grid);

  // Overhead GI Cable Ladder Trays Suspended from Ceiling
  const trayMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.25,
  });

  const trayRailL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 16.0), trayMat);
  trayRailL.position.set(-0.55, 3.2, -4.0);
  bgGroup.add(trayRailL);

  const trayRailR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 16.0), trayMat);
  trayRailR.position.set(0.55, 3.2, -4.0);
  bgGroup.add(trayRailR);

  for (let rz = 3.0; rz >= -12.0; rz -= 0.6) {
    const rung = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.02, 0.035), trayMat);
    rung.position.set(0, 3.17, rz);
    bgGroup.add(rung);
  }

  // 4 Power Feeder Cables in the Tray (Red, Yellow, Blue, Green)
  const cableColors = [0xdc2626, 0xeab308, 0x2563eb, 0x16a34a];
  [-0.38, -0.12, 0.12, 0.38].forEach((cx, i) => {
    const cableGeo = new THREE.CylinderGeometry(0.035, 0.035, 16.0, 8);
    cableGeo.rotateX(Math.PI / 2);
    const cableMesh = new THREE.Mesh(
      cableGeo,
      new THREE.MeshStandardMaterial({ color: cableColors[i], roughness: 0.5 })
    );
    cableMesh.position.set(cx, 3.22, -4.0);
    bgGroup.add(cableMesh);
  });

  // Flowing High-Speed Electrical Energy Spark Particles along Cable Tray
  const energyCount = 100;
  const energyGeo = new THREE.BufferGeometry();
  const energyPos = new Float32Array(energyCount * 3);

  for (let i = 0; i < energyCount; i++) {
    const wireX = [-0.38, -0.12, 0.12, 0.38][i % 4];
    energyPos[i * 3] = wireX + (Math.random() - 0.5) * 0.025;
    energyPos[i * 3 + 1] = 3.22 + (Math.random() - 0.5) * 0.025;
    energyPos[i * 3 + 2] = -14.0 + Math.random() * 17.0;
  }

  energyGeo.setAttribute("position", new THREE.BufferAttribute(energyPos, 3));
  const energyMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.14,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  });
  const energyPoints = new THREE.Points(energyGeo, energyMat);
  bgGroup.add(energyPoints);
  animData.energyPoints = energyPoints;

  // Atmospheric Floating Light Sparks & Dust in Store Air
  const dustCount = 140;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 12.0;
    dustPos[i * 3 + 1] = -1.2 + Math.random() * 4.8;
    dustPos[i * 3 + 2] = -12.0 + Math.random() * 15.0;
  }

  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xfbbf24,
    size: 0.065,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  bgGroup.add(dustPoints);
  animData.dustPoints = dustPoints;
}
