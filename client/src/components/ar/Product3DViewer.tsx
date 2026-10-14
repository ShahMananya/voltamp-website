import React, { useEffect, useRef, useState, useMemo } from "react";
// @ts-ignore
import * as THREE from "three";
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Box,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
  Camera,
  Sun,
  Info,
  ChevronRight,
  Sliders,
  Check,
  X,
  QrCode,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product3DViewerProps {
  product: {
    productId?: string;
    name: string;
    brand?: string;
    category?: string;
    subcategory?: string;
    size?: string;
    material?: string;
    specifications?: any;
    price?: string;
  };
  onClose?: () => void;
  isModal?: boolean;
}

interface Hotspot {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
}

export function Product3DViewer({ product, onClose, isModal = false }: Product3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const groupRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Interaction state
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [explodeLevel, setExplodeLevel] = useState(0); // 0 to 100
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [arModalOpen, setArModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Mouse drag orbit controls
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.3, y: 0.5 });
  const zoomRef = useRef(5);

  const categoryLower = (product.category || "").toLowerCase();
  const nameLower = product.name.toLowerCase();

  const isCable =
    categoryLower.includes("cable") ||
    categoryLower.includes("wire") ||
    nameLower.includes("cable") ||
    nameLower.includes("wire");

  const isSwitchgear =
    categoryLower.includes("switchgear") ||
    nameLower.includes("contactor") ||
    nameLower.includes("mcb") ||
    nameLower.includes("mccb") ||
    nameLower.includes("relay");

  // Determine hotspots based on electrical specs
  const hotspots: Hotspot[] = useMemo(() => {
    if (isCable) {
      return [
        {
          id: "core",
          title: "Electrolytic Copper Conductor",
          description: "99.97% pure oxygen-free high conductivity (OFHC) multi-strand copper compliant with IS 8130 Class 2/5.",
          position: [0, 0, 1.8],
        },
        {
          id: "insulation",
          title: "Cross-Linked XLPE Insulation",
          description: "High-grade heat resistant insulation rated up to 90°C continuous operating temperature and 250°C short-circuit.",
          position: [0, 0.45, 0.8],
        },
        {
          id: "armour",
          title: "Galvanized Steel Wire Armour (GSWA)",
          description: "High tensile mechanical crush and rodent protection compliant with IS 3975 for direct underground burial.",
          position: [0, 0.75, -0.4],
        },
        {
          id: "sheath",
          title: "Heavy-Duty Outer Sheath (FRLS)",
          description: "Flame Retardant Low Smoke zero-halogen polymer jacket protecting against UV, moisture, oils, and chemical ingress.",
          position: [0, 1.05, -1.5],
        },
      ];
    } else if (isSwitchgear) {
      return [
        {
          id: "terminals",
          title: "Silver Alloy Power Terminals",
          description: "Heavy-duty box clamp terminals supporting captive screws for high vibration industrial panels.",
          position: [0, 1.2, 0.5],
        },
        {
          id: "contacts",
          title: "3-Pole High Breaking Contacts",
          description: "Silver nickel oxide contact tips with arc-quenching chute rated up to AC-3 motor duty cycles.",
          position: [0, 0, 0.8],
        },
        {
          id: "din",
          title: "Standard 35mm DIN Rail Mount",
          description: "Spring-loaded snap-on mechanism for tool-free installation on standard electrical distribution backplates.",
          position: [0, -1.2, -0.6],
        },
      ];
    } else {
      return [
        {
          id: "housing",
          title: "Industrial Grade Enclosure",
          description: "High impact, IP-rated industrial chassis engineered for thermal dissipation and electrical isolation.",
          position: [0, 0.8, 0.8],
        },
        {
          id: "terminal",
          title: "Direct Termination Block",
          description: "Vibration-proof terminal connections tested for maximum continuous current carrying capacity.",
          position: [0, -0.6, 0.8],
        },
      ];
    }
  }, [isCable, isSwitchgear]);

  // Three.js Scene Setup & Model Generation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Slate-900 high contrast

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.5, zoomRef.current);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren(renderer.domElement);

    // 4. Lighting Suite
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5); // Cool blue rim light
    dirLight2.position.set(-5, -3, -4);
    scene.add(dirLight2);

    const goldRimLight = new THREE.DirectionalLight(0xf59e0b, 1.2); // Warm copper rim light
    goldRimLight.position.set(4, -4, -3);
    scene.add(goldRimLight);

    // Subtle reflective grid floor
    const grid = new THREE.GridHelper(10, 20, 0x1e293b, 0x1e293b);
    grid.position.y = -1.8;
    scene.add(grid);

    // 5. Build 3D Model Group
    const modelGroup = new THREE.Group();
    groupRef.current = modelGroup;
    scene.add(modelGroup);

    layersRef.current = [];

    if (isCable) {
      buildCable3DModel(modelGroup, layersRef.current);
    } else if (isSwitchgear) {
      buildSwitchgear3DModel(modelGroup, layersRef.current);
    } else {
      buildGeneralIndustrial3DModel(modelGroup, layersRef.current);
    }

    // 6. Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current && !isHovered) {
        rotationRef.current.y += 0.006;
      }

      if (modelGroup) {
        modelGroup.rotation.x = rotationRef.current.x;
        modelGroup.rotation.y = rotationRef.current.y;
      }

      if (cameraRef.current) {
        cameraRef.current.position.z = zoomRef.current;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [isCable, isSwitchgear]);

  // Update wireframe property
  useEffect(() => {
    layersRef.current.forEach((mesh) => {
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m: any) => (m.wireframe = wireframe));
        } else {
          (mesh.material as any).wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Update Exploded Layers view
  useEffect(() => {
    const factor = explodeLevel / 100;
    layersRef.current.forEach((mesh) => {
      const explodeOffset = (mesh.userData?.explodeOffset || 0) * factor;
      mesh.position.z = (mesh.userData?.initialZ || 0) + explodeOffset;
    });
  }, [explodeLevel]);

  // Mouse & Touch Orbit Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;

    // Clamp vertical tilt
    rotationRef.current.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotationRef.current.x));

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    zoomRef.current = Math.max(2.5, Math.min(8.5, zoomRef.current + e.deltaY * 0.004));
  };

  // View Presets
  const setPreset = (type: "front" | "iso" | "cross" | "top") => {
    setAutoRotate(false);
    if (type === "front") {
      rotationRef.current = { x: 0, y: 0 };
    } else if (type === "iso") {
      rotationRef.current = { x: 0.35, y: 0.75 };
    } else if (type === "cross") {
      rotationRef.current = { x: 0, y: Math.PI / 2 };
    } else if (type === "top") {
      rotationRef.current = { x: Math.PI / 2, y: 0 };
    }
  };

  // Snapshot capture
  const handleSnapshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${product.name.replace(/\s+/g, "-")}-3D-Inspection.png`;
    link.href = dataUrl;
    link.click();
  };

  const livePageUrl = typeof window !== "undefined" ? window.location.href : "https://volampelektrikals.com";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    livePageUrl
  )}&bgcolor=ffffff&color=102a40`;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex flex-col select-none">
      {/* Top Controls Overlay Bar */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold font-mono flex items-center gap-1.5 backdrop-blur-md">
            <Box className="size-3.5 animate-pulse" /> 3D WebGL Engine
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium border border-slate-700/80 backdrop-blur-md">
            IS Verified Dimensions
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* View in AR Button */}
          <button
            type="button"
            onClick={() => setArModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-103"
          >
            <Smartphone className="size-3.5" />
            <span>View in AR</span>
          </button>

          {/* Close Modal Button if in modal */}
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDraggingRef.current = false;
        }}
        className="w-full h-full min-h-[360px] sm:min-h-[440px] cursor-grab active:cursor-grabbing relative flex-1 touch-none"
      />

      {/* Bottom Floating Toolbar */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 pointer-events-auto">
        {/* Presets and View Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-xl text-xs">
          <button
            type="button"
            onClick={() => setPreset("iso")}
            className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-[11px] cursor-pointer"
          >
            Isometric
          </button>
          <button
            type="button"
            onClick={() => setPreset("front")}
            className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-[11px] cursor-pointer"
          >
            Front
          </button>
          <button
            type="button"
            onClick={() => setPreset("cross")}
            className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold text-[11px] cursor-pointer"
          >
            Cross-Section
          </button>
          <div className="w-px h-4 bg-slate-700 mx-0.5" />
          <button
            type="button"
            onClick={() => setAutoRotate((prev) => !prev)}
            title={autoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              autoRotate ? "bg-sky-500/20 text-sky-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setWireframe((prev) => !prev)}
            title={wireframe ? "Solid Mesh" : "Wireframe CAD Mesh"}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              wireframe ? "bg-purple-500/20 text-purple-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <Compass className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSnapshot}
            title="Download 3D Snapshot PNG"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Camera className="size-3.5" />
          </button>
        </div>

        {/* Exploded Layers Slider (for multi-layer components like cables) */}
        {isCable && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-xl text-xs w-full sm:w-auto">
            <Layers className="size-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px] text-slate-300 font-semibold shrink-0">Explode Layers:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={explodeLevel}
              onChange={(e) => setExplodeLevel(Number(e.target.value))}
              className="w-24 sm:w-32 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="text-[10px] font-mono text-amber-300 w-7">{explodeLevel}%</span>
          </div>
        )}
      </div>

      {/* Interactive Layer Specs Drawer */}
      <div className="absolute top-14 right-3 z-20 flex flex-col gap-1.5 pointer-events-auto max-w-[200px] sm:max-w-[240px]">
        {hotspots.map((h, idx) => (
          <button
            key={h.id}
            type="button"
            onClick={() => setSelectedHotspot(selectedHotspot?.id === h.id ? null : h)}
            className={`px-2.5 py-1.5 rounded-xl border text-left text-xs transition-all cursor-pointer backdrop-blur-md ${
              selectedHotspot?.id === h.id
                ? "bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10"
                : "bg-slate-900/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/90 hover:text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] truncate flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-sky-400" />
                {h.title}
              </span>
              <ChevronRight
                className={`size-3 transition-transform ${selectedHotspot?.id === h.id ? "rotate-90 text-sky-400" : "text-slate-500"}`}
              />
            </div>
            {selectedHotspot?.id === h.id && (
              <p className="mt-1.5 text-[10px] text-slate-300 leading-relaxed font-normal border-t border-slate-700/60 pt-1">
                {h.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Touch Orbit Guide Hint */}
      <div className="absolute bottom-16 sm:bottom-14 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-60">
        <span className="px-2.5 py-1 rounded-full bg-black/60 text-slate-400 text-[10px] font-medium backdrop-blur-sm">
          Drag to rotate 360° • Scroll to zoom
        </span>
      </div>

      {/* WebAR Phone Camera / QR Code Modal */}
      {arModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 text-white shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setArModalOpen(false)}
              className="absolute top-4 right-4 size-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  View Product in Your Space (AR)
                </h3>
                <p className="text-xs text-slate-400">
                  Augmented Reality real-scale inspection on iOS & Android
                </p>
              </div>
            </div>

            {/* Mobile View Directly Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 space-y-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <h4 className="font-bold text-emerald-200">Instant Phone Camera AR</h4>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Point your camera at your factory floor, panel board, or conduit to see exact physical scale
                    and clearance before ordering.
                  </p>
                </div>
              </div>

              {/* Native WebXR Button on Mobile */}
              <a
                href={`intent://arvr.google.com/scene-viewer/1.0?file=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb&mode=ar_only#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Smartphone className="size-4" />
                <span>Launch Camera AR (Mobile)</span>
              </a>
            </div>

            {/* Desktop QR Code Scanner */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
              <div className="p-2 rounded-2xl bg-white shadow-md">
                <img src={qrCodeUrl} alt="AR QR Code" className="size-40 object-contain rounded-xl" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
                  <QrCode className="size-3.5 text-sky-400" /> Scan with iPhone or Android Camera
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  No app download needed. Works directly via Safari Quick Look and Chrome Scene Viewer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                Model: {product.productId || "VOLAMP-AR-3D"}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(livePageUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                {copiedLink ? <Check className="size-3.5 text-emerald-400" /> : null}
                <span>{copiedLink ? "Link Copied!" : "Copy AR Link"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3D Procedural Model Builders with Metallic Textures & Materials
// ============================================================================

/**
 * Builds a 3D Industrial Multi-Core Armoured Cable with layered cross-section.
 */
function buildCable3DModel(group: any, layerMeshes: any[]) {
  // 1. Central Copper Conductors (4 Cores: Red, Yellow, Blue, Black/Neutral)
  const coreRadius = 0.16;
  const coreLength = 3.6;
  const corePositions = [
    { x: -0.22, y: 0.22, color: 0xef4444 }, // Red Phase
    { x: 0.22, y: 0.22, color: 0xf59e0b },  // Yellow Phase
    { x: 0.22, y: -0.22, color: 0x3b82f6 }, // Blue Phase
    { x: -0.22, y: -0.22, color: 0x1f2937 },// Neutral / Black
  ];

  corePositions.forEach((cp, idx) => {
    // Copper wire strands bundle
    const copperGeom = new THREE.CylinderGeometry(coreRadius * 0.7, coreRadius * 0.7, coreLength + 0.4, 16);
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb87333, // True metallic copper
      metalness: 0.95,
      roughness: 0.18,
    });
    const copperMesh = new THREE.Mesh(copperGeom, copperMat);
    copperMesh.rotation.x = Math.PI / 2;
    copperMesh.position.set(cp.x, cp.y, 0.4);
    copperMesh.userData = { initialZ: 0.4, explodeOffset: 0.8 + idx * 0.15 };
    group.add(copperMesh);
    layerMeshes.push(copperMesh);

    // Color-coded XLPE Insulation Sheath for each core
    const insulGeom = new THREE.CylinderGeometry(coreRadius, coreRadius, coreLength, 16);
    const insulMat = new THREE.MeshStandardMaterial({
      color: cp.color,
      roughness: 0.4,
      metalness: 0.1,
    });
    const insulMesh = new THREE.Mesh(insulGeom, insulMat);
    insulMesh.rotation.x = Math.PI / 2;
    insulMesh.position.set(cp.x, cp.y, 0.1);
    insulMesh.userData = { initialZ: 0.1, explodeOffset: 0.5 };
    group.add(insulMesh);
    layerMeshes.push(insulMesh);
  });

  // 2. Inner Bedding Layer (PVC Extrusion)
  const beddingGeom = new THREE.CylinderGeometry(0.62, 0.62, coreLength - 0.5, 24);
  const beddingMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.15,
  });
  const beddingMesh = new THREE.Mesh(beddingGeom, beddingMat);
  beddingMesh.rotation.x = Math.PI / 2;
  beddingMesh.position.set(0, 0, -0.2);
  beddingMesh.userData = { initialZ: -0.2, explodeOffset: 0.1 };
  group.add(beddingMesh);
  layerMeshes.push(beddingMesh);

  // 3. Galvanized Steel Wire Armour Layer (Circular spiral cage)
  const armourCount = 18;
  const armourRadius = 0.72;
  for (let i = 0; i < armourCount; i++) {
    const angle = (i / armourCount) * Math.PI * 2;
    const ax = Math.cos(angle) * armourRadius;
    const ay = Math.sin(angle) * armourRadius;
    const wireGeom = new THREE.CylinderGeometry(0.045, 0.045, coreLength - 0.9, 12);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Galvanized Steel
      metalness: 0.9,
      roughness: 0.25,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    wireMesh.rotation.x = Math.PI / 2;
    wireMesh.position.set(ax, ay, -0.45);
    wireMesh.userData = { initialZ: -0.45, explodeOffset: -0.3 };
    group.add(wireMesh);
    layerMeshes.push(wireMesh);
  }

  // 4. Heavy-Duty PVC/XLPE Outer Sheath (Black embossed industrial jacket)
  const outerGeom = new THREE.CylinderGeometry(0.92, 0.92, coreLength - 1.4, 32);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // Deep industrial black/graphite
    roughness: 0.45,
    metalness: 0.2,
  });
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  outerMesh.rotation.x = Math.PI / 2;
  outerMesh.position.set(0, 0, -0.85);
  outerMesh.userData = { initialZ: -0.85, explodeOffset: -0.7 };
  group.add(outerMesh);
  layerMeshes.push(outerMesh);

  // Brand embossing ring (gold accent)
  const ringGeom = new THREE.TorusGeometry(0.93, 0.03, 16, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x1d73b7, // Volamp Blue
    metalness: 0.7,
    roughness: 0.2,
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  ringMesh.position.set(0, 0, -1.2);
  group.add(ringMesh);
}

/**
 * Builds a 3D Modular Power Contactor / Switchgear unit.
 */
function buildSwitchgear3DModel(group: any, layerMeshes: any[]) {
  // 1. Main Molded Phenolic Housing Box
  const bodyGeom = new THREE.BoxGeometry(1.6, 2.2, 1.4);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.2,
  });
  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.userData = { initialZ: 0, explodeOffset: 0 };
  group.add(bodyMesh);
  layerMeshes.push(bodyMesh);

  // 2. Terminal Blocks (Top and Bottom)
  const termGeom = new THREE.BoxGeometry(1.5, 0.4, 0.4);
  const termMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.4,
  });

  const topTerm = new THREE.Mesh(termGeom, termMat);
  topTerm.position.set(0, 1.15, 0.2);
  group.add(topTerm);

  const botTerm = new THREE.Mesh(termGeom, termMat);
  botTerm.position.set(0, -1.15, 0.2);
  group.add(botTerm);

  // Screw Lugs (Brass / Copper Screws)
  [-0.45, 0, 0.45].forEach((sx) => {
    const screwGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 16);
    const screwMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Brass screw
      metalness: 0.9,
      roughness: 0.2,
    });
    const s1 = new THREE.Mesh(screwGeom, screwMat);
    s1.position.set(sx, 1.25, 0.25);
    group.add(s1);

    const s2 = new THREE.Mesh(screwGeom, screwMat);
    s2.position.set(sx, -1.25, 0.25);
    group.add(s2);
  });

  // 3. Actuator Test Button (Orange / Red)
  const btnGeom = new THREE.BoxGeometry(0.4, 0.4, 0.3);
  const btnMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48, // Industrial Red
    roughness: 0.3,
  });
  const btnMesh = new THREE.Mesh(btnGeom, btnMat);
  btnMesh.position.set(0, 0.3, 0.8);
  btnMesh.userData = { initialZ: 0.8, explodeOffset: 0.5 };
  group.add(btnMesh);
  layerMeshes.push(btnMesh);

  // 4. DIN Rail Clip (Metal base)
  const dinGeom = new THREE.BoxGeometry(1.4, 1.8, 0.25);
  const dinMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.95,
    roughness: 0.15,
  });
  const dinMesh = new THREE.Mesh(dinGeom, dinMat);
  dinMesh.position.set(0, 0, -0.8);
  dinMesh.userData = { initialZ: -0.8, explodeOffset: -0.5 };
  group.add(dinMesh);
  layerMeshes.push(dinMesh);
}

/**
 * Builds a General 3D Industrial Component (Motor / Electrical Assembly).
 */
function buildGeneralIndustrial3DModel(group: any, layerMeshes: any[]) {
  // Motor Cylinder with fins
  const cylinderGeom = new THREE.CylinderGeometry(0.9, 0.9, 2.2, 32);
  const cylinderMat = new THREE.MeshStandardMaterial({
    color: 0x1d73b7,
    roughness: 0.3,
    metalness: 0.6,
  });
  const cylinderMesh = new THREE.Mesh(cylinderGeom, cylinderMat);
  cylinderMesh.rotation.z = Math.PI / 2;
  group.add(cylinderMesh);
  layerMeshes.push(cylinderMesh);

  // Shaft
  const shaftGeom = new THREE.CylinderGeometry(0.2, 0.2, 3.2, 16);
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.95,
    roughness: 0.1,
  });
  const shaftMesh = new THREE.Mesh(shaftGeom, shaftMat);
  shaftMesh.rotation.z = Math.PI / 2;
  group.add(shaftMesh);

  // Mounting Base
  const baseGeom = new THREE.BoxGeometry(2.0, 0.3, 1.6);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.5,
    roughness: 0.4,
  });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = -1.0;
  group.add(baseMesh);
}
