import React, { useEffect, useRef, useState } from "react";
// @ts-ignore
import * as THREE from "three";
import {
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Activity,
  Cpu,
  QrCode,
  ShieldCheck,
  Radio,
  Scan,
  ChevronRight,
  Sliders,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VirtualShowroomLabProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  onRequestQuote?: (category: string, productTitle: string) => void;
}

interface LabProductSpec {
  id: string;
  name: string;
  category: string;
  tagline: string;
  badge: string;
  voltageRating: string;
  ampCapacity: string;
  tempRange: string;
  standards: string[];
  insulationClass: string;
  description: string;
  voiceScript: string;
  accentColor: string;
  hotspots: {
    id: string;
    title: string;
    spec: string;
    pos: [number, number, number];
  }[];
}

const LAB_PRODUCTS: LabProductSpec[] = [
  {
    id: "cables",
    name: "4-Core HT Armoured Power Cable",
    category: "Wire & Power Cables",
    tagline: "33kV XLPE Insulated Heavy-Duty Transmission Cable",
    badge: "IS 7098 Part II / IEC 60502-2",
    voltageRating: "11kV / 22kV / 33kV Grade",
    ampCapacity: "Up to 680 Amperes (In Ground)",
    tempRange: "-20°C to +90°C (Short Circuit 250°C)",
    standards: ["IS 7098 (II)", "IEC 60502", "BS 6622", "RoHS"],
    insulationClass: "Cross-Linked Polyethylene (XLPE)",
    description:
      "Engineered with 99.97% high-conductivity electrolytic copper conductors, triple extruded dry-cured XLPE insulation, galvanized round steel wire armour, and flame-retardant low-smoke (FRLS) outer sheath for extreme utility grade reliability.",
    voiceScript:
      "You are inspecting the Volamp 4-Core HT Armoured Power Cable. Featuring electrolytic copper conductors with ninety-nine point nine seven percent purity, cross-linked XLPE insulation rated for thirty-three kilovolts, and heavy-duty galvanized steel wire armoring designed for subterranean industrial installations.",
    accentColor: "#0284c7",
    hotspots: [
      { id: "core", title: "Electrolytic Copper Core", spec: "IS 8130 Class 2 Conductor (99.97% Pure)", pos: [0, 1.4, 0] },
      { id: "xlpe", title: "Dry-Cured XLPE Insulation", spec: "Dielectric Strength >30 kV/mm", pos: [0, 0.7, 0.6] },
      { id: "armour", title: "Galvanized Steel Armour", spec: "IS 3975 Mechanical Impact Resistance", pos: [0, -0.2, 0.8] },
      { id: "sheath", title: "FRLS Outer Sheath", spec: "Oxygen Index >29%, Low Smoke Emission", pos: [0, -1.1, 0.9] },
    ],
  },
  {
    id: "switchgear",
    name: "3-Phase Industrial MCB Module",
    category: "Switchgear & Power Protection",
    tagline: "10kA Breaking Capacity Circuit Protection with Arc Quench",
    badge: "IS/IEC 60898-1 / CE Certified",
    voltageRating: "415V AC (50/60 Hz)",
    ampCapacity: "63A (Curve C/D Trip Characteristic)",
    tempRange: "-25°C to +70°C Calibration",
    standards: ["IS/IEC 60898-1", "IEC 60947-2", "CE", "KEMA-KEUR"],
    insulationClass: "Class II Reinforced Thermoplastic",
    description:
      "High-speed thermal-magnetic trip system with 12-plate silver-plated de-ionizing arc quenching chamber, bi-metallic thermal overload release, and dual DIN rail snap mounts for demanding motor feeder protection.",
    voiceScript:
      "Displaying the 3-Phase Industrial Miniature Circuit Breaker. Equipped with a silver alloy contact bridge, a twelve-plate magnetic de-ion arc quenching chamber, and calibrated bi-metal overload release for instantaneous ten kiloamp short-circuit interruption.",
    accentColor: "#059669",
    hotspots: [
      { id: "toggle", title: "Bi-Stable Actuator Dolly", spec: "Mechanical Endurance >20,000 Cycles", pos: [0, 1.1, 0.7] },
      { id: "contacts", title: "Silver-Cadmium Oxide Contacts", spec: "Zero Contact Welding at 10kA Arc", pos: [0, 0.2, 0.5] },
      { id: "arcchute", title: "12-Plate De-Ionizing Arc Chute", spec: "Rapid Arc Extinction <3 Milliseconds", pos: [0, -0.5, 0.6] },
      { id: "terminals", title: "Box Lug Terminals", spec: "Tunnel Clamp up to 35 sq.mm Cable", pos: [0, -1.3, 0] },
    ],
  },
  {
    id: "lugs",
    name: "Heavy-Duty Tubular Copper Lug",
    category: "Terminations & Cable Lugs",
    tagline: "Pure ETP Copper Ring Terminal with Bell-Mouth Barrel",
    badge: "IS 8309 / DIN 46235 / UL Listed",
    voltageRating: "Up to 33kV Grade Applications",
    ampCapacity: "Rated up to 630 Amperes",
    tempRange: "-50°C to +150°C Continuous",
    standards: ["IS 8309", "DIN 46235", "UL 486A", "RoHS"],
    insulationClass: "Electro-Tin Plated (10 Microns)",
    description:
      "Manufactured from seamless electrolytic tough pitch (ETP) copper tube annealed to resist crimp fracturing. Features a wide palm stud hole, internal chamfered bell mouth for smooth multi-strand insertion, and inspection hole.",
    voiceScript:
      "This is the Volamp Heavy-Duty ETP Copper Lug. Machined from seamless high-conductivity annealed copper tubing with a ten-micron tin electroplating barrier to eliminate galvanic corrosion in harsh industrial panels.",
    accentColor: "#ea580c",
    hotspots: [
      { id: "palm", title: "Solid Contact Palm", spec: "Mirror Flat Contact Face for Low Resistance", pos: [0, 1.3, 0] },
      { id: "stud", title: "M12 Stud Hole", spec: "Torque Tested to 45 Nm without Deformation", pos: [0, 1.1, 0.3] },
      { id: "inspect", title: "Inspection Window", spec: "Visual Verification of Full Conductor Depth", pos: [0, 0.1, 0.4] },
      { id: "barrel", title: "Annealed Crimp Barrel", spec: "Hexagonal or Indent Die Compatible", pos: [0, -1.0, 0] },
    ],
  },
  {
    id: "glands",
    name: "Ex-d Double Compression Cable Gland",
    category: "Cable Accessories & Glands",
    tagline: "Flameproof & Weatherproof Brass IP68 Gland",
    badge: "ATEX / IECEx / PESO Certified",
    voltageRating: "Mechanical Barrier Protection",
    ampCapacity: "Continuous Earth Continuity <5mΩ",
    tempRange: "-60°C to +130°C Operating",
    standards: ["IEC 60079-1 (Ex d)", "IEC 60079-7 (Ex e)", "IP68 Submersible", "PESO"],
    insulationClass: "CW614N Brass with Nickel Option",
    description:
      "Certified explosion-proof cable gland providing dual environmental and gas seal over inner sheath and outer jacket with mechanical armour clamping cone. Designed for hazardous Zone 1, Zone 2 gas atmospheres and mining rigs.",
    voiceScript:
      "Inspecting the Ex-d Double Compression Cable Gland. Fabricated from precision CW614N brass with certified flameproof displacement seals and mechanical armour locking cones, providing IP68 protection for Zone 1 hazardous environments.",
    accentColor: "#ca8a04",
    hotspots: [
      { id: "entry", title: "Entry Thread / Locknut", spec: "Metric M25 x 1.5 / NPT Standard", pos: [0, 1.4, 0] },
      { id: "cone", title: "Armour Clamping Cone", spec: "360° Armor Earth Bond & Pullout Resistance", pos: [0, 0.3, 0.5] },
      { id: "seal", title: "Neoprene Compression Seal", spec: "IP68 Water & Dust Hermetic Seal", pos: [0, -0.6, 0.5] },
      { id: "body", title: "Hexagonal Outer Body", spec: "High-Torque Wrench Gripping Flats", pos: [0, -1.2, 0] },
    ],
  },
  {
    id: "solar",
    name: "TOPCon Bifacial Solar PV Module",
    category: "Solar & Clean Energy",
    tagline: "590W N-Type 16-BB Bifacial Dual-Glass Panel",
    badge: "IEC 61215 / IEC 61730 / BIS Approved",
    voltageRating: "Max System Voltage 1500V DC",
    ampCapacity: "Isc 14.12A / Imp 13.38A",
    tempRange: "-40°C to +85°C (-0.30%/°C Coeff)",
    standards: ["IEC 61215", "IEC 61730", "BIS (ALMM List I)", "UL 61730"],
    insulationClass: "Dual 2.0mm Semi-Tempered AR Glass",
    description:
      "Next-generation N-type tunnel oxide passivated contact (TOPCon) technology with up to 80% bifaciality factor, delivering ultra-high efficiency (22.8%) even under high ambient desert temperatures and low-light dawn/dusk conditions.",
    voiceScript:
      "Observing the Volamp 590-Watt TOPCon Bifacial Solar Module. Incorporating sixteen busbar N-Type half-cut cells encased between dual anti-reflective tempered glass panes for exceptional twenty-two point eight percent solar efficiency.",
    accentColor: "#0284c7",
    hotspots: [
      { id: "cells", title: "N-Type TOPCon Cells", spec: "Zero LID & Lower Degradation (<1% Year 1)", pos: [0, 0.8, 0.2] },
      { id: "busbars", title: "16 Micro-Busbars", spec: "Shorter Current Paths & Reduced Hotspot Risk", pos: [0, 0.2, 0.2] },
      { id: "frame", title: "Anodized Aluminum Frame", spec: "5400 Pa Snow Load / 2400 Pa Wind Load", pos: [0, -0.8, 0.3] },
      { id: "jbox", title: "IP68 Bypass Diode J-Box", spec: "Integrated Split MC4-EVO2 Leads", pos: [0, -1.3, -0.2] },
    ],
  },
  {
    id: "earthing",
    name: "UL-Listed Pure Copper Bonded Earth Electrode",
    category: "Earthing & Lightning Protection",
    tagline: "17.2mm Dia x 3m Length 254-Micron Molecular Copper Bond",
    badge: "UL 467 / IEEE 80 / IS 3043 Compliant",
    voltageRating: "Fault Current Dissipation >25kA (1 sec)",
    ampCapacity: "Earth Resistance Dissipation <1 Ohm",
    tempRange: "Sub-soil -40°C to +75°C",
    standards: ["UL 467", "IEEE 80", "IS 3043", "CPRI Tested"],
    insulationClass: "99.9% Electrolytic Copper 254µm Coating",
    description:
      "Manufactured with high tensile carbon steel core molecularly bonded with a 254-micron layer of electrolytic copper. Will not peel, crack, or flake when driven into rock strata, guaranteeing a maintenance-free 30+ year lifespan.",
    voiceScript:
      "Inspecting the UL-Listed Copper Bonded Earth Electrode. Fabricated with a high-tensile steel core molecularly encased in two hundred fifty-four microns of electrolytic copper for robust fault dissipation and thirty-year sub-soil durability.",
    accentColor: "#10b981",
    hotspots: [
      { id: "driving", title: "Chamfered Driving Head", spec: "Withstands Pneumatic Hammer Driving Force", pos: [0, 1.4, 0] },
      { id: "coating", title: "254-Micron Copper Bond", spec: "Electro-Plated Molecular Fusion to Steel", pos: [0, 0.4, 0.3] },
      { id: "core", title: "High-Tensile Steel Core", spec: "Tensile Strength >600 N/mm²", pos: [0, -0.4, 0.3] },
      { id: "point", title: "Pointed Chisel Tip", spec: "Rapid Penetration in Rocky and Sandy Soil", pos: [0, -1.4, 0] },
    ],
  },
];

export function VirtualShowroomLab({
  isOpen,
  onClose,
  initialCategory,
  onRequestQuote,
}: VirtualShowroomLabProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialCategory || "cables"
  );
  const [autoRotate, setAutoRotate] = useState(true);
  const [explodeLevel, setExplodeLevel] = useState(0); // 0 to 100
  const [wireframeMode, setWireframeMode] = useState(false);
  const [energyPulseActive, setEnergyPulseActive] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Three.js canvas refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // Group & Dynamic mesh references
  const modelGroupRef = useRef<any>(null);
  const studioFloorGroupRef = useRef<any>(null);
  const explodePartsRef = useRef<
    Array<{ mesh: any; origPos: THREE.Vector3; explodeDir: THREE.Vector3 }>
  >([]);
  const energyParticlesRef = useRef<any>(null);
  const scanlineRef = useRef<any>(null);

  // Interactive Orbit state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.25, y: 0.5 });
  const zoomRef = useRef(4.8);

  const selectedProduct =
    LAB_PRODUCTS.find((p) => p.id === selectedProductId) || LAB_PRODUCTS[0];

  // Sync initialCategory prop if opened with one
  useEffect(() => {
    if (initialCategory && LAB_PRODUCTS.some((p) => p.id === initialCategory)) {
      setSelectedProductId(initialCategory);
    }
  }, [initialCategory]);

  // Clean up speech synthesis on unmount or product change
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedProductId, isOpen]);

  // Audio Voice Explainer Handler
  const toggleVoiceExplainer = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (voicePlaying) {
      window.speechSynthesis.cancel();
      setVoicePlaying(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedProduct.voiceScript);
      utterance.rate = 1.0;
      utterance.pitch = 1.02;

      // Select natural English voice if present
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel"))
      );
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => setVoicePlaying(false);
      utterance.onerror = () => setVoicePlaying(false);

      window.speechSynthesis.speak(utterance);
      setVoicePlaying(true);
    }
  };

  // Keyboard shortcut listener for ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (qrModalOpen) setQrModalOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [qrModalOpen, onClose]);

  // Three.js Studio Scene Builder
  useEffect(() => {
    if (!isOpen) return;
    const container = mountRef.current;
    if (!container) return;

    // Reset container DOM
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060c14); // Deep space dark lab background

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.2, zoomRef.current);
    cameraRef.current = camera;

    // 3. WebGL Renderer with ACESFilmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Lighting Suite
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
    rimLight.position.set(-6, -3, -4);
    scene.add(rimLight);

    const underGlow = new THREE.PointLight(
      new THREE.Color(selectedProduct.accentColor),
      4.5,
      12
    );
    underGlow.position.set(0, -1.8, 0);
    scene.add(underGlow);

    // 5. Industrial Lab Studio Stage Floor
    const floorGroup = new THREE.Group();
    studioFloorGroupRef.current = floorGroup;
    scene.add(floorGroup);

    // Circular Illuminated Pedestal Platform
    const pedestalGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.25, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0f1b29,
      roughness: 0.35,
      metalness: 0.85,
    });
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestalMesh.position.y = -1.9;
    pedestalMesh.receiveShadow = true;
    floorGroup.add(pedestalMesh);

    // Glowing Neon Ring rim on Pedestal
    const ringGeo = new THREE.TorusGeometry(2.35, 0.04, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(selectedProduct.accentColor),
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.78;
    floorGroup.add(ringMesh);

    // Studio Circular Hologram Tech Grid Floor
    const gridHelper = new THREE.GridHelper(14, 28, 0x1e3a5f, 0x0c2033);
    gridHelper.position.y = -1.92;
    floorGroup.add(gridHelper);

    // Rotating Outer Radar Circle
    const outerReticleGeo = new THREE.RingGeometry(3.2, 3.25, 64);
    const outerReticleMat = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const outerReticleMesh = new THREE.Mesh(outerReticleGeo, outerReticleMat);
    outerReticleMesh.rotation.x = Math.PI / 2;
    outerReticleMesh.position.y = -1.9;
    floorGroup.add(outerReticleMesh);

    // 6. Laser CT Scanline Plane
    const scanlineGeo = new THREE.PlaneGeometry(3.6, 0.04);
    const scanlineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(selectedProduct.accentColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const scanlineMesh = new THREE.Mesh(scanlineGeo, scanlineMat);
    scanlineMesh.position.set(0, 0, 1.2);
    scanlineRef.current = scanlineMesh;
    scene.add(scanlineMesh);

    // 7. Assemble 3D Product Anatomy
    const modelGroup = new THREE.Group();
    modelGroupRef.current = modelGroup;
    scene.add(modelGroup);

    explodePartsRef.current = [];

    // Helper: Register exploded parts for smooth kinematic animation
    const registerExplode = (
      mesh: any,
      dir: [number, number, number],
      origPos?: [number, number, number]
    ) => {
      const orig = origPos
        ? new THREE.Vector3(...origPos)
        : mesh.position.clone();
      explodePartsRef.current.push({
        mesh,
        origPos: orig,
        explodeDir: new THREE.Vector3(...dir),
      });
    };

    // Shared High-Spec Materials
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xca6f28,
      metalness: 0.94,
      roughness: 0.18,
    });
    const tinMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.22,
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xdeb841,
      metalness: 0.88,
      roughness: 0.24,
    });
    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.35,
      roughness: 0.45,
    });

    // Procedural Assembly according to Selected Product
    if (selectedProductId === "cables") {
      // Outer Sheath (Cylinder)
      const outerSheathGeo = new THREE.CylinderGeometry(0.95, 0.95, 2.0, 32);
      const outerSheathMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.65,
      });
      const outerSheath = new THREE.Mesh(outerSheathGeo, outerSheathMat);
      outerSheath.position.y = -0.5;
      modelGroup.add(outerSheath);
      registerExplode(outerSheath, [0, -0.6, 0]);

      // Steel Wire Armoring Ring
      const armourGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.8, 32, 1, true);
      const armourMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.92,
        roughness: 0.25,
        wireframe: true,
      });
      const armour = new THREE.Mesh(armourGeo, armourMat);
      armour.position.y = 0.4;
      modelGroup.add(armour);
      registerExplode(armour, [0, -0.2, 0.4]);

      // 4 Color-Coded Insulated Cores (Red, Yellow, Blue, Black)
      const coreColors = [0xef4444, 0xeab308, 0x3b82f6, 0x1e293b];
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

      angles.forEach((angle, idx) => {
        const radius = 0.42;
        const cx = Math.cos(angle) * radius;
        const cz = Math.sin(angle) * radius;

        // XLPE Insulation Core
        const coreGeo = new THREE.CylinderGeometry(0.24, 0.24, 1.8, 24);
        const coreMat = new THREE.MeshStandardMaterial({
          color: coreColors[idx],
          roughness: 0.35,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(cx, 0.4, cz);
        modelGroup.add(coreMesh);
        registerExplode(
          coreMesh,
          [Math.cos(angle) * 0.9, 0.3, Math.sin(angle) * 0.9],
          [cx, 0.4, cz]
        );

        // Pure Copper Conductor protruding from top
        const condGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16);
        const condMesh = new THREE.Mesh(condGeo, copperMat);
        condMesh.position.set(cx, 1.45, cz);
        modelGroup.add(condMesh);
        registerExplode(
          condMesh,
          [Math.cos(angle) * 1.3, 0.8, Math.sin(angle) * 1.3],
          [cx, 1.45, cz]
        );
      });
    } else if (selectedProductId === "switchgear") {
      // Main MCB Chassis Box
      const bodyGeo = new THREE.BoxGeometry(1.6, 2.4, 1.2);
      const bodyMesh = new THREE.Mesh(bodyGeo, darkChassisMat);
      modelGroup.add(bodyMesh);
      registerExplode(bodyMesh, [0, 0, 0]);

      // White Faceplate
      const faceGeo = new THREE.BoxGeometry(1.4, 1.8, 0.3);
      const faceMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        roughness: 0.2,
      });
      const faceMesh = new THREE.Mesh(faceGeo, faceMat);
      faceMesh.position.set(0, 0, 0.65);
      modelGroup.add(faceMesh);
      registerExplode(faceMesh, [0, 0, 0.8]);

      // 3 Circuit Toggle Switches (Red/Black)
      for (let i = -1; i <= 1; i++) {
        const toggleGeo = new THREE.BoxGeometry(0.24, 0.6, 0.4);
        const toggleMat = new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          roughness: 0.3,
        });
        const toggleMesh = new THREE.Mesh(toggleGeo, toggleMat);
        toggleMesh.position.set(i * 0.42, 0.2, 0.85);
        toggleMesh.rotation.x = -0.3;
        modelGroup.add(toggleMesh);
        registerExplode(toggleMesh, [i * 0.2, 0.4, 1.2]);
      }

      // Top Terminal Screws (Brass)
      for (let i = -1; i <= 1; i++) {
        const screwGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 16);
        const screw = new THREE.Mesh(screwGeo, brassMat);
        screw.position.set(i * 0.45, 1.25, 0);
        modelGroup.add(screw);
        registerExplode(screw, [i * 0.3, 0.8, 0]);
      }

      // Live LED Status Indicator (Green)
      const ledGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const led = new THREE.Mesh(ledGeo, ledMat);
      led.position.set(0.5, 0.7, 0.82);
      modelGroup.add(led);
      registerExplode(led, [0.4, 0.6, 1.0]);
    } else if (selectedProductId === "lugs") {
      // Flat Contact Palm
      const palmGeo = new THREE.BoxGeometry(0.9, 1.4, 0.16);
      const palm = new THREE.Mesh(palmGeo, tinMat);
      palm.position.set(0, 0.7, 0);
      modelGroup.add(palm);
      registerExplode(palm, [0, 0.6, 0]);

      // Center Stud Ring Hole
      const holeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.22, 24);
      const holeMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.9,
      });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.rotation.x = Math.PI / 2;
      hole.position.set(0, 0.85, 0);
      modelGroup.add(hole);
      registerExplode(hole, [0, 0.6, 0.2]);

      // Tubular Crimp Barrel
      const barrelGeo = new THREE.CylinderGeometry(0.36, 0.36, 1.5, 32);
      const barrel = new THREE.Mesh(barrelGeo, copperMat);
      barrel.position.set(0, -0.65, 0);
      modelGroup.add(barrel);
      registerExplode(barrel, [0, -0.7, 0]);

      // Inspection Window Slot
      const inspectGeo = new THREE.BoxGeometry(0.18, 0.25, 0.4);
      const inspectMesh = new THREE.Mesh(inspectGeo, darkChassisMat);
      inspectMesh.position.set(0, -0.05, 0.18);
      modelGroup.add(inspectMesh);
      registerExplode(inspectMesh, [0, 0, 0.6]);
    } else if (selectedProductId === "glands") {
      // Main Brass Hexagon Body
      const glandBodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.9, 6);
      const glandBody = new THREE.Mesh(glandBodyGeo, brassMat);
      modelGroup.add(glandBody);
      registerExplode(glandBody, [0, 0, 0]);

      // Top Entry Thread (Threaded Rings)
      const threadGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 24);
      const thread = new THREE.Mesh(threadGeo, brassMat);
      thread.position.set(0, 0.85, 0);
      modelGroup.add(thread);
      registerExplode(thread, [0, 0.8, 0]);

      // Rubber Neoprene Compression Gasket (Black)
      const gasketGeo = new THREE.TorusGeometry(0.48, 0.1, 16, 32);
      const gasketMat = new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.8,
      });
      const gasket = new THREE.Mesh(gasketGeo, gasketMat);
      gasket.rotation.x = Math.PI / 2;
      gasket.position.set(0, 0.42, 0);
      modelGroup.add(gasket);
      registerExplode(gasket, [0, 0.4, 0.5]);

      // Compression Lock Nut
      const nutGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 6);
      const nut = new THREE.Mesh(nutGeo, brassMat);
      nut.position.set(0, -0.7, 0);
      modelGroup.add(nut);
      registerExplode(nut, [0, -0.8, 0]);
    } else if (selectedProductId === "solar") {
      // Dual-Glass Solar Panel Base
      const panelGeo = new THREE.BoxGeometry(2.1, 2.7, 0.08);
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x091c33,
        roughness: 0.15,
        metalness: 0.8,
      });
      const panelMesh = new THREE.Mesh(panelGeo, panelMat);
      modelGroup.add(panelMesh);
      registerExplode(panelMesh, [0, 0, -0.3]);

      // Anodized Aluminum Outer Frame
      const frameGeo = new THREE.BoxGeometry(2.2, 2.8, 0.12);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.95,
        roughness: 0.25,
        wireframe: true,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      modelGroup.add(frameMesh);
      registerExplode(frameMesh, [0, 0, 0]);

      // 16 Micro-Busbars Grid
      const busbarGeo = new THREE.PlaneGeometry(1.9, 2.5, 4, 16);
      const busbarMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.65,
      });
      const busbarMesh = new THREE.Mesh(busbarGeo, busbarMat);
      busbarMesh.position.z = 0.06;
      modelGroup.add(busbarMesh);
      registerExplode(busbarMesh, [0, 0, 0.6]);
    } else if (selectedProductId === "earthing") {
      // High Tensile Steel Core + Thick Copper Bond Shaft
      const rodGeo = new THREE.CylinderGeometry(0.18, 0.18, 3.2, 32);
      const rodMesh = new THREE.Mesh(rodGeo, copperMat);
      modelGroup.add(rodMesh);
      registerExplode(rodMesh, [0, 0, 0]);

      // Chamfered Driving Head
      const headGeo = new THREE.CylinderGeometry(0.24, 0.18, 0.35, 32);
      const headMesh = new THREE.Mesh(headGeo, tinMat);
      headMesh.position.y = 1.6;
      modelGroup.add(headMesh);
      registerExplode(headMesh, [0, 0.6, 0]);

      // Chisel Ground Penetration Point
      const tipGeo = new THREE.ConeGeometry(0.18, 0.45, 32);
      const tipMesh = new THREE.Mesh(tipGeo, copperMat);
      tipMesh.rotation.x = Math.PI;
      tipMesh.position.y = -1.75;
      modelGroup.add(tipMesh);
      registerExplode(tipMesh, [0, -0.6, 0]);
    }

    // 8. Add Live Energy Current Pulse Particle System
    const particleCount = 75;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const radius = 0.6 + Math.random() * 0.9;
      particlePositions[i * 3] = Math.cos(theta) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      particlePositions[i * 3 + 2] = Math.sin(theta) * radius;
      particleSpeeds.push(0.015 + Math.random() * 0.025);
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color(selectedProduct.accentColor),
      size: 0.065,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const energyPoints = new THREE.Points(particleGeo, particleMat);
    energyParticlesRef.current = energyPoints;
    scene.add(energyPoints);

    // 9. Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Main Animation Loop
    let clock = 0;
    let targetExplode = explodeLevel / 100;
    let currentExplode = 0;

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.018;

      // Smooth Explode Interpolation
      targetExplode = explodeLevel / 100;
      currentExplode += (targetExplode - currentExplode) * 0.08;

      explodePartsRef.current.forEach(({ mesh, origPos, explodeDir }) => {
        mesh.position.x = origPos.x + explodeDir.x * currentExplode * 1.5;
        mesh.position.y = origPos.y + explodeDir.y * currentExplode * 1.5;
        mesh.position.z = origPos.z + explodeDir.z * currentExplode * 1.5;
      });

      // Turntable Auto-Rotate or Interactive Drag
      if (modelGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          rotationRef.current.y += 0.007;
        }
        modelGroupRef.current.rotation.y = rotationRef.current.y;
        modelGroupRef.current.rotation.x = rotationRef.current.x;
      }

      // Studio radar floor rotation
      if (studioFloorGroupRef.current) {
        studioFloorGroupRef.current.rotation.y -= 0.003;
      }

      // Laser scanline sweeping up & down
      if (scanlineRef.current) {
        scanlineRef.current.position.y = Math.sin(clock * 1.5) * 1.3;
      }

      // Energy electron particle flow
      if (energyParticlesRef.current && energyPulseActive) {
        const posAttr = energyParticlesRef.current.geometry.attributes.position;
        const arr = posAttr.array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 1] += particleSpeeds[i];
          if (arr[i * 3 + 1] > 1.8) {
            arr[i * 3 + 1] = -1.8;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Smooth Camera Zoom
      if (cameraRef.current) {
        cameraRef.current.position.z +=
          (zoomRef.current - cameraRef.current.position.z) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount or product switch
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer) renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [isOpen, selectedProductId, autoRotate, energyPulseActive]);

  // Dynamic Wireframe Toggle
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child: any) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m: any) => (m.wireframe = wireframeMode));
        } else {
          child.material.wireframe = wireframeMode;
        }
      }
    });
  }, [wireframeMode]);

  // Mouse & Touch Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    rotationRef.current.y += deltaX * 0.009;
    rotationRef.current.x = Math.max(
      -0.6,
      Math.min(0.8, rotationRef.current.x + deltaY * 0.009)
    );

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    zoomRef.current = Math.max(2.8, Math.min(7.5, zoomRef.current + e.deltaY * 0.003));
  };

  const resetView = () => {
    rotationRef.current = { x: 0.25, y: 0.5 };
    zoomRef.current = 4.8;
    setExplodeLevel(0);
    setActiveHotspot(null);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? "h-screen rounded-none" : "max-w-7xl h-[92vh] rounded-3xl"
        } bg-[#060c14] border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-white`}
      >
        {/* Top Spatial Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
              <Scan className="size-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  VOLAMP 3D VIRTUAL SHOWROOM LAB
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                  <Radio className="size-2.5 animate-ping text-sky-400" /> WebGL 3D + Spatial AR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive Digital Twin Inspection & Engineering Telemetry
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* AI Voice Explainer Button */}
            <button
              type="button"
              onClick={toggleVoiceExplainer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                voicePlaying
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30 animate-pulse font-bold"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700"
              }`}
              title="Listen to AI Engineering Audio Briefing"
            >
              {voicePlaying ? (
                <>
                  <VolumeX className="size-3.5" />
                  <span className="hidden sm:inline">Stop Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="size-3.5 text-amber-400" />
                  <span className="hidden sm:inline">AI Voice Explainer</span>
                </>
              )}
            </button>

            {/* Launch Camera AR QR Code */}
            <button
              type="button"
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Scan with phone for real-world AR"
            >
              <QrCode className="size-3.5" />
              <span className="hidden sm:inline">Launch AR Camera</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 cursor-pointer transition-colors"
              title="Close Virtual Showroom"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Product Pedestal Category Switcher Bar */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto no-scrollbar z-20 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden md:inline">
            Exhibition Pedestals:
          </span>
          {LAB_PRODUCTS.map((prod) => {
            const isActive = prod.id === selectedProductId;
            return (
              <button
                key={prod.id}
                type="button"
                onClick={() => {
                  setSelectedProductId(prod.id);
                  setExplodeLevel(0);
                  setActiveHotspot(null);
                  if (typeof window !== "undefined" && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                  setVoicePlaying(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isActive
                    ? "bg-sky-500/15 border-sky-400 text-white shadow-sm font-bold"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: prod.accentColor }}
                />
                <span>{prod.name}</span>
              </button>
            );
          })}
        </div>

        {/* Central Workspace: 3D Stage + HUD Telemetry Overlay */}
        <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main 3D Canvas Area */}
          <div
            ref={mountRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing select-none"
          />

          {/* Floating On-Canvas 3D HUD Controls (Left Bottom) */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl max-w-[calc(100%-2rem)]">
            {/* Turntable Auto-Rotate */}
            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                autoRotate
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <RotateCcw className={`size-3.5 ${autoRotate ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">360° Orbit</span>
            </button>

            {/* CAD Wireframe Mode */}
            <button
              type="button"
              onClick={() => setWireframeMode(!wireframeMode)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                wireframeMode
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <Cpu className="size-3.5" />
              <span className="hidden sm:inline">CAD Wireframe</span>
            </button>

            {/* Live Current Pulse Flow */}
            <button
              type="button"
              onClick={() => setEnergyPulseActive(!energyPulseActive)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                energyPulseActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              <Zap className="size-3.5" />
              <span className="hidden sm:inline">Current Pulse</span>
            </button>

            {/* Exploded Anatomy Slider */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800">
              <Layers className="size-3.5 text-sky-400" />
              <span className="text-[11px] text-slate-400 font-medium">Explode:</span>
              <input
                type="range"
                min="0"
                max="100"
                value={explodeLevel}
                onChange={(e) => setExplodeLevel(Number(e.target.value))}
                className="w-20 sm:w-28 accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-sky-400 w-7 text-right">
                {explodeLevel}%
              </span>
            </div>

            {/* Reset View */}
            <button
              type="button"
              onClick={resetView}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 transition-all cursor-pointer"
              title="Reset 3D Camera & Explode View"
            >
              Reset
            </button>
          </div>

          {/* Right Sidebar: Engineering Telemetry HUD & RFQ Action */}
          <div className="w-full lg:w-96 bg-slate-950/90 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-slate-800/80 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-20">
            <div>
              {/* Badge & Title */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  {selectedProduct.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {selectedProduct.category}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug mb-1">
                {selectedProduct.name}
              </h3>
              <p className="text-xs text-sky-300 font-medium mb-3">
                {selectedProduct.tagline}
              </p>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {selectedProduct.description}
              </p>

              {/* Engineering Telemetry Table */}
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/90 p-3 mb-4 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                  <Activity className="size-3 text-sky-400" /> Technical Parameters
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Voltage Grade</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedProduct.voltageRating}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Current Rating</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedProduct.ampCapacity}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Temperature Class</span>
                  <span className="font-semibold text-white font-mono">
                    {selectedProduct.tempRange}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Insulation / Material</span>
                  <span className="font-semibold text-sky-300 font-mono text-right text-[11px]">
                    {selectedProduct.insulationClass}
                  </span>
                </div>
              </div>

              {/* Hotspot Inspection Points */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Click Anatomy Points to Inspect:
                </div>
                {selectedProduct.hotspots.map((hs) => {
                  const isCurrent = activeHotspot === hs.id;
                  return (
                    <button
                      key={hs.id}
                      type="button"
                      onClick={() => {
                        setActiveHotspot(isCurrent ? null : hs.id);
                        setExplodeLevel(45);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? "bg-sky-500/15 border-sky-400 text-white font-bold"
                          : "bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-sky-400" />
                          {hs.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {hs.spec}
                        </div>
                      </div>
                      <ChevronRight
                        className={`size-4 text-slate-500 transition-transform ${
                          isCurrent ? "rotate-90 text-sky-400" : ""
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Compliance Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedProduct.standards.map((std) => (
                  <span
                    key={std}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1"
                  >
                    <ShieldCheck className="size-2.5 text-emerald-400" /> {std}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom RFQ & Inquiry Button */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <Button
                onClick={() => {
                  if (onRequestQuote) {
                    onRequestQuote(selectedProduct.category, selectedProduct.name);
                  }
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-sky-500/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Request Commercial Quotation (RFQ)</span>
                <ArrowRight className="size-4" />
              </Button>
              <p className="text-[10px] text-slate-500 text-center">
                Instant contractor discounts & manufacturer test certificates included.
              </p>
            </div>
          </div>
        </div>

        {/* Camera AR QR Code Modal */}
        {qrModalOpen && (
          <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700 p-6 text-center shadow-2xl">
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="size-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center mx-auto mb-3">
                <QrCode className="size-6" />
              </div>

              <h3 className="text-base font-extrabold text-white mb-1">
                Scan with Phone for Real-World AR
              </h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Aim your iPhone or Android camera at the QR code to project this{" "}
                <span className="text-sky-300 font-semibold">{selectedProduct.name}</span> in
                true 1:1 scale on your work desk or site floor.
              </p>

              {/* Futuristic QR Display */}
              <div className="size-48 mx-auto p-3 rounded-2xl bg-white flex items-center justify-center shadow-lg mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? `${window.location.origin}/products?ar=${selectedProduct.id}`
                      : "https://volamp.in"
                  )}`}
                  alt="AR QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-400" /> Compatible with WebXR, iOS QuickLook & Chrome Android
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
