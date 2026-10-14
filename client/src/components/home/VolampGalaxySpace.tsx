import React, { useEffect, useRef, useState, useMemo } from "react";
// @ts-ignore
import * as THREE from "three";
import {
  X,
  RotateCcw,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Activity,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Radio,
  Sliders,
  Globe,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VolampGalaxySpaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory?: (categorySlug: string) => void;
  onOpenShowroomLab?: (categoryId: string) => void;
}

interface PlanetData {
  id: string;
  name: string;
  category: string;
  slug: string;
  distance: number; // orbital radius from Volamp Sun
  speed: number; // orbital rotation speed
  size: number;
  color: number;
  glowColor: string;
  voltageRating: string;
  specSummary: string;
  itemsCount: string;
}

const GALAXY_PLANETS: PlanetData[] = [
  {
    id: "cables",
    name: "Power Cables Planet",
    category: "Wires & Power Cables",
    slug: "wire-cables",
    distance: 4.8,
    speed: 0.7,
    size: 0.55,
    color: 0x0284c7,
    glowColor: "#0284c7",
    voltageRating: "1.1kV - 33kV HT",
    specSummary: "Electrolytic 99.97% OFHC Copper / XLPE / Armoured",
    itemsCount: "1,200+ Products",
  },
  {
    id: "switchgear",
    name: "Switchgear Citadel",
    category: "Switchgear & Power Protection",
    slug: "switch-gears",
    distance: 6.6,
    speed: 0.55,
    size: 0.52,
    color: 0x10b981,
    glowColor: "#10b981",
    voltageRating: "415V AC / 10kA Breaking",
    specSummary: "MCBs, RCCBs, Contactors & Distribution Panels",
    itemsCount: "480+ Products",
  },
  {
    id: "lugs",
    name: "Terminals & Lugs Asteroid",
    category: "Lugs & Terminations",
    slug: "lugs",
    distance: 8.4,
    speed: 0.44,
    size: 0.46,
    color: 0xea580c,
    glowColor: "#ea580c",
    voltageRating: "Heavy-Duty Crimp",
    specSummary: "Pure ETP Tinned Copper Ring & Pin Terminals",
    itemsCount: "350+ Products",
  },
  {
    id: "conduit",
    name: "Conduit Sphere",
    category: "Conduit & Enclosures",
    slug: "conduit",
    distance: 10.2,
    speed: 0.36,
    size: 0.48,
    color: 0x64748b,
    glowColor: "#64748b",
    voltageRating: "Mechanical Barrier",
    specSummary: "LMS/HMS PVC & Corrugated Flexible Tubes",
    itemsCount: "190+ Products",
  },
  {
    id: "glands",
    name: "Industrial Glands Station",
    category: "Cable Accessories & Glands",
    slug: "glands",
    distance: 12.0,
    speed: 0.3,
    size: 0.5,
    color: 0xca8a04,
    glowColor: "#ca8a04",
    voltageRating: "Zone 1 Ex-d Flameproof",
    specSummary: "CW614N Brass Double Compression IP68 Glands",
    itemsCount: "220+ Products",
  },
  {
    id: "wiring",
    name: "Wiring Devices Orbit",
    category: "Wiring Devices & Switches",
    slug: "wiring-device",
    distance: 13.8,
    speed: 0.25,
    size: 0.48,
    color: 0x6366f1,
    glowColor: "#6366f1",
    voltageRating: "250V AC / 16A Modular",
    specSummary: "Architectural Modular Wall Switches & Sockets",
    itemsCount: "410+ Products",
  },
  {
    id: "earthing",
    name: "Grounding Earth Core",
    category: "Earthing & Protection",
    slug: "earthing-material",
    distance: 15.6,
    speed: 0.21,
    size: 0.52,
    color: 0x059669,
    glowColor: "#059669",
    voltageRating: "Fault Dissipation >25kA",
    specSummary: "UL-Listed Pure Copper Bonded Earth Electrodes",
    itemsCount: "160+ Products",
  },
  {
    id: "solar",
    name: "Solar Clean Energy Haven",
    category: "Solar & Clean Energy",
    slug: "solar",
    distance: 17.5,
    speed: 0.17,
    size: 0.58,
    color: 0x38bdf8,
    glowColor: "#38bdf8",
    voltageRating: "1500V DC Photovoltaic",
    specSummary: "TOPCon Bifacial Solar Modules & Grid Inverters",
    itemsCount: "375+ Products",
  },
];

export function VolampGalaxySpace({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenShowroomLab,
}: VolampGalaxySpaceProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interaction & UI State
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [orbitalSpeedMultiplier, setOrbitalSpeedMultiplier] = useState(1.0);
  const [electricCurrentLoad, setElectricCurrentLoad] = useState(320); // Amperes
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraMode, setCameraMode] = useState<"orbit" | "focus">("orbit");

  // Three.js instances
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const planetsGroupRef = useRef<any[]>([]);
  const currentBeamsRef = useRef<any[]>([]);
  const sunMeshRef = useRef<any>(null);
  const sunCoronaRef = useRef<any>(null);

  // Orbit controls state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ yaw: 0.35, pitch: 0.55 });
  const cameraDistRef = useRef(24);
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Web Audio Synthesizer: Cosmic Sound Effects
  const playSynthesizedSound = (type: "warp" | "beep" | "pulse") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "warp") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(780, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.65);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (type === "beep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "pulse") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(95, now);
        osc.frequency.linearRampToValueAtTime(190, now + 0.2);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  // Keyboard Escape Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Main Three.js Galaxy Simulator
  useEffect(() => {
    if (!isOpen) return;
    const container = mountRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 650;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x030712); // Deep Cosmic Void

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);
    camera.position.set(0, 14, 24);
    cameraRef.current = camera;

    // 3. Renderer with Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. Lighting Suite
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    // Bright Omnidirectional Solar Core Light
    const sunPointLight = new THREE.PointLight(0xffd700, 4.5, 60);
    sunPointLight.position.set(0, 0, 0);
    scene.add(sunPointLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(10, 20, 15);
    scene.add(rimLight);

    // 5. Cosmic Starfield (1,600 Twinkling Stars)
    const starCount = 1600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const isBlue = Math.random() > 0.6;
      starColors[i * 3] = isBlue ? 0.6 : 1.0;
      starColors[i * 3 + 1] = isBlue ? 0.8 : 0.9;
      starColors[i * 3 + 2] = 1.0;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. VOLAMP CENTRAL SUN / ENERGY CORE
    const sunGroup = new THREE.Group();
    scene.add(sunGroup);

    // Core Solar Sphere
    const sunGeo = new THREE.SphereGeometry(1.65, 36, 36);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.2,
      roughness: 0.2,
      metalness: 0.1,
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMeshRef.current = sunMesh;
    sunGroup.add(sunMesh);

    // Outer Pulsing Solar Corona Halo
    const coronaGeo = new THREE.SphereGeometry(2.0, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunCoronaRef.current = coronaMesh;
    sunGroup.add(coronaMesh);

    // Central Spinning Energy Torus Rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(2.3, 0.04, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    ring1.rotation.x = Math.PI / 3;
    sunGroup.add(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.5, 0.03, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    ring2.rotation.y = Math.PI / 4;
    sunGroup.add(ring2);

    // 7. ORBITING PLANETS & LIVE ELECTRICAL CURRENT LIGHTNING BEAMS
    planetsGroupRef.current = [];
    currentBeamsRef.current = [];

    GALAXY_PLANETS.forEach((planetData, index) => {
      // A. Orbital Circle Path Guide
      const orbitGeo = new THREE.RingGeometry(
        planetData.distance - 0.02,
        planetData.distance + 0.02,
        96
      );
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x1e3a5f,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const orbitMesh = new THREE.Mesh(orbitGeo, orbitMat);
      orbitMesh.rotation.x = Math.PI / 2;
      scene.add(orbitMesh);

      // B. Planet Node Group (carries sphere + 3D miniature)
      const planetPivot = new THREE.Group();
      scene.add(planetPivot);

      const planetMeshGroup = new THREE.Group();
      planetMeshGroup.position.x = planetData.distance;
      planetPivot.add(planetMeshGroup);

      // Planet Physical Sphere
      const pSphereGeo = new THREE.SphereGeometry(planetData.size, 24, 24);
      const pSphereMat = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.4,
        metalness: 0.6,
        emissive: planetData.color,
        emissiveIntensity: 0.35,
      });
      const pSphere = new THREE.Mesh(pSphereGeo, pSphereMat);
      planetMeshGroup.add(pSphere);

      // Planet Atmospheric Atmosphere Glow Ring
      const atmoGeo = new THREE.RingGeometry(
        planetData.size * 1.25,
        planetData.size * 1.35,
        32
      );
      const atmoMat = new THREE.MeshBasicMaterial({
        color: planetData.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
      atmoMesh.rotation.x = Math.PI / 2;
      planetMeshGroup.add(atmoMesh);

      // Store reference with initial phase offset
      const phaseOffset = (index / GALAXY_PLANETS.length) * Math.PI * 2;
      planetsGroupRef.current.push({
        data: planetData,
        pivot: planetPivot,
        meshGroup: planetMeshGroup,
        phase: phaseOffset,
        currentPos: new THREE.Vector3(),
      });

      // C. Live Electrical Current Line from Sun to Planet
      const beamGeo = new THREE.BufferGeometry();
      const beamPoints = new Float32Array(15 * 3); // 15 points per lightning beam
      beamGeo.setAttribute("position", new THREE.BufferAttribute(beamPoints, 3));

      const beamMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(planetData.glowColor),
        transparent: true,
        opacity: 0.65,
        linewidth: 2,
      });
      const beamLine = new THREE.Line(beamGeo, beamMat);
      scene.add(beamLine);

      // Flowing electron particle along the beam
      const electronGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const electronMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const electronMesh = new THREE.Mesh(electronGeo, electronMat);
      scene.add(electronMesh);

      currentBeamsRef.current.push({
        line: beamLine,
        electron: electronMesh,
        planetIndex: index,
        electronProgress: Math.random(),
      });
    });

    // 8. Mouse / Touch Orbit Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMouseRef.current.x;
      const dy = e.clientY - prevMouseRef.current.y;

      cameraAngleRef.current.yaw += dx * 0.007;
      cameraAngleRef.current.pitch = Math.max(
        0.1,
        Math.min(1.4, cameraAngleRef.current.pitch + dy * 0.007)
      );

      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraDistRef.current = Math.max(
        6,
        Math.min(42, cameraDistRef.current + e.deltaY * 0.02)
      );
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    dom.addEventListener("wheel", handleWheel);

    // 9. Resize Listener
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
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.016;

      const currentMultiplier = (electricCurrentLoad / 300) * orbitalSpeedMultiplier;

      // Pulse Volamp Sun Core
      if (sunMeshRef.current) {
        const pulse = 1 + Math.sin(clock * 3) * 0.04;
        sunMeshRef.current.scale.set(pulse, pulse, pulse);
        sunMeshRef.current.rotation.y += 0.004;
      }
      if (sunCoronaRef.current) {
        sunCoronaRef.current.rotation.z -= 0.006;
        sunCoronaRef.current.rotation.y += 0.005;
      }

      // Rotate Stars slowly
      starField.rotation.y += 0.0003;

      // Update Orbiting Planets
      planetsGroupRef.current.forEach((item) => {
        item.phase += item.data.speed * 0.01 * currentMultiplier;
        item.pivot.rotation.y = item.phase;
        item.meshGroup.rotation.y += 0.02;

        // Calculate world coordinates for current lightning beams
        const worldPos = new THREE.Vector3();
        item.meshGroup.getWorldPosition(worldPos);
        item.currentPos.copy(worldPos);
      });

      // Update Live Electrical Lightning Beams
      currentBeamsRef.current.forEach((beam) => {
        const planetItem = planetsGroupRef.current[beam.planetIndex];
        const targetPos = planetItem.currentPos;
        const posAttr = beam.line.geometry.attributes.position;
        const arr = posAttr.array;

        // Generate dynamic jagged lightning arc between Sun (0,0,0) and Planet
        const segments = 14;
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const jitter = (Math.random() - 0.5) * 0.12 * (electricCurrentLoad / 200);

          arr[i * 3] = targetPos.x * t + jitter;
          arr[i * 3 + 1] = targetPos.y * t + jitter;
          arr[i * 3 + 2] = targetPos.z * t + jitter;
        }
        posAttr.needsUpdate = true;

        // Flowing electron packet animation
        beam.electronProgress += 0.018 * currentMultiplier;
        if (beam.electronProgress > 1) beam.electronProgress = 0;
        const eT = beam.electronProgress;
        beam.electron.position.set(
          targetPos.x * eT,
          targetPos.y * eT,
          targetPos.z * eT
        );
      });

      // Camera Positioning (Orbit vs Hyperspace Warp to Selected Planet)
      if (cameraMode === "focus" && targetCameraPosRef.current) {
        camera.position.lerp(targetCameraPosRef.current, 0.06);
        camera.lookAt(0, 0, 0);
      } else {
        const yaw = cameraAngleRef.current.yaw;
        const pitch = cameraAngleRef.current.pitch;
        const dist = cameraDistRef.current;

        const cx = dist * Math.sin(pitch) * Math.sin(yaw);
        const cy = dist * Math.cos(pitch);
        const cz = dist * Math.sin(pitch) * Math.cos(yaw);

        camera.position.set(cx, cy, cz);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      dom.removeEventListener("mousedown", handleMouseDown);
      dom.removeEventListener("wheel", handleWheel);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (renderer) renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, [isOpen, orbitalSpeedMultiplier, electricCurrentLoad, cameraMode]);

  // Warp Camera to Selected Planet
  const warpToPlanet = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setCameraMode("focus");
    playSynthesizedSound("warp");

    const planetItem = planetsGroupRef.current.find((p) => p.data.id === planet.id);
    if (planetItem) {
      const pPos = planetItem.currentPos;
      targetCameraPosRef.current = new THREE.Vector3(
        pPos.x * 0.75,
        pPos.y + 2.5,
        pPos.z * 0.75 + 4
      );
    }
  };

  const resetCamera = () => {
    setSelectedPlanet(null);
    setCameraMode("orbit");
    cameraDistRef.current = 24;
    cameraAngleRef.current = { yaw: 0.35, pitch: 0.55 };
    targetCameraPosRef.current = null;
    playSynthesizedSound("beep");
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? "h-screen rounded-none" : "max-w-7xl h-[92vh] rounded-3xl"
        } bg-[#030712] border border-sky-500/30 shadow-2xl flex flex-col overflow-hidden text-white`}
      >
        {/* Top Space Flight HUD Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-sky-900/40 bg-slate-950/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-amber-500 to-sky-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Sparkles className="size-5 text-slate-950 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  VOLAMP ELECTRICAL GALAXY 3D
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
                  Sun Core & 8 Orbiting Planetary Systems
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Interactive Celestial Space Flight · Click Any Planet to Warp & Inspect
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playSynthesizedSound("beep");
              }}
              className={`p-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                soundEnabled
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
              }`}
              title="Toggle Synthesized Cosmic Audio"
            >
              {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>

            {/* Reset Camera to Solar System Overview */}
            <button
              type="button"
              onClick={resetCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Orbit Bar: Planetary Quick Warp Pills */}
        <div className="px-3 sm:px-6 py-2.5 bg-slate-950/90 border-b border-sky-950/40 overflow-x-auto no-scrollbar z-20 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 hidden lg:inline">
            Planetary Orbits:
          </span>
          {GALAXY_PLANETS.map((planet) => {
            const isSelected = selectedPlanet?.id === planet.id;
            return (
              <button
                key={planet.id}
                type="button"
                onClick={() => warpToPlanet(planet)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-sky-500/20 border-sky-400 text-white shadow-md font-bold scale-105"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: planet.glowColor }}
                />
                <span>{planet.name.replace(" Planet", "").replace(" Citadel", "").replace(" Sphere", "")}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Cosmic Viewport Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <div
            ref={mountRef}
            className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          />

          {/* Bottom Left Space Flight Telemetry & Current Flux Controls */}
          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-sky-900/40 shadow-2xl max-w-[calc(100%-2rem)]">
            {/* Live Electrical Current Load Controller */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Zap className="size-3.5 text-amber-400 animate-pulse" />
              <span className="text-[11px] text-slate-300 font-medium">Current Flux:</span>
              <input
                type="range"
                min="50"
                max="800"
                value={electricCurrentLoad}
                onChange={(e) => setElectricCurrentLoad(Number(e.target.value))}
                className="w-24 sm:w-32 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-amber-400 w-12 text-right font-bold">
                {electricCurrentLoad} A
              </span>
            </div>

            {/* Orbit Velocity Slider */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <Activity className="size-3.5 text-sky-400" />
              <span className="text-[11px] text-slate-300 font-medium">Orbit Speed:</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={orbitalSpeedMultiplier}
                onChange={(e) => setOrbitalSpeedMultiplier(Number(e.target.value))}
                className="w-18 accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[11px] font-mono text-sky-400 w-7 text-right">
                {orbitalSpeedMultiplier.toFixed(1)}x
              </span>
            </div>

            {/* Interactive Drag Hint */}
            <div className="text-[10px] text-slate-400 px-2 font-mono hidden md:inline">
              🖱️ Drag 360° to Orbit · Scroll to Zoom
            </div>
          </div>

          {/* Right Floating Planet Telemetry Card (When Planet is Selected) */}
          {selectedPlanet && (
            <div className="absolute top-4 right-4 z-20 w-80 sm:w-96 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-sky-500/40 shadow-2xl p-4 sm:p-5 text-white animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    backgroundColor: `${selectedPlanet.glowColor}25`,
                    borderColor: `${selectedPlanet.glowColor}60`,
                    color: selectedPlanet.glowColor,
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border"
                >
                  {selectedPlanet.category}
                </span>
                <button
                  type="button"
                  onClick={resetCamera}
                  className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug mb-1">
                {selectedPlanet.name}
              </h3>
              <p className="text-xs text-slate-300 mb-3">{selectedPlanet.specSummary}</p>

              {/* Real-time Telemetry Data */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-2.5 space-y-1.5 text-xs font-mono mb-4">
                <div className="flex justify-between py-0.5 border-b border-slate-800 text-slate-400">
                  <span>Rating / Grade:</span>
                  <span className="text-sky-300 font-semibold">{selectedPlanet.voltageRating}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800 text-slate-400">
                  <span>Catalog Depth:</span>
                  <span className="text-emerald-400 font-semibold">{selectedPlanet.itemsCount}</span>
                </div>
                <div className="flex justify-between py-0.5 text-slate-400">
                  <span>Simulated Current:</span>
                  <span className="text-amber-400 font-semibold">{electricCurrentLoad} A Continuous</span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="flex flex-col gap-2">
                {onOpenShowroomLab && (
                  <Button
                    onClick={() => {
                      onOpenShowroomLab(selectedPlanet.id);
                      onClose();
                    }}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold h-10 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md shadow-sky-500/20"
                  >
                    <Layers className="size-3.5" />
                    <span>Inspect 3D Digital Twin (Lab & AR)</span>
                  </Button>
                )}

                {onSelectCategory && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      onSelectCategory(selectedPlanet.slug);
                      onClose();
                    }}
                    className="w-full border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs h-9 rounded-xl cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Browse {selectedPlanet.name} Products</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
