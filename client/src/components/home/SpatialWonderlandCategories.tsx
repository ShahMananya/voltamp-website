import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
// @ts-ignore
import * as THREE from "three";
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Zap,
  Layers,
} from "lucide-react";
import { CATEGORIES, type Category } from "@/data/categories";

interface SpatialWonderlandCategoriesProps {
  onNavigate: (slug: string) => void;
  onOpenARModal: (cat: any) => void;
  onOpenShowroomLab?: (catId: string) => void;
}

interface WonderlandCategoryItem {
  id: string;
  code: string;
  number: number;
  badgeTag: string;
  categoryName: string;
  slug: string;
  categoryRef: Category;
  color: string;
  accent: string;
  headline: string;
  subheadline: string;
  voltageSpec: string;
  standardSpec: string;
  materialSpec: string;
  productCount: number;
  featuredPills: string[];
  subcategories: Array<{ name: string; slug: string }>;
  image: string;
}

// Cross-browser safe rounded rectangle helper
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof (ctx as any).roundRect === "function") {
    (ctx as any).roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

export function SpatialWonderlandCategories({
  onNavigate,
  onOpenARModal,
  onOpenShowroomLab,
}: SpatialWonderlandCategoriesProps) {
  // Category data mappings from master data
  const cablesCat = CATEGORIES.find((c) => c.slug === "wire-cables") || CATEGORIES[0];
  const switchgearCat = CATEGORIES.find((c) => c.slug === "switch-gears") || CATEGORIES[1];
  const lugsCat = CATEGORIES.find((c) => c.slug === "lugs") || CATEGORIES[2];
  const conduitCat = CATEGORIES.find((c) => c.slug === "conduit") || CATEGORIES[3];
  const glandsCat = CATEGORIES.find((c) => c.slug === "glands") || CATEGORIES[4];
  const wiringCat = CATEGORIES.find((c) => c.slug === "wiring-device") || CATEGORIES[5];
  const earthingCat = CATEGORIES.find((c) => c.slug === "earthing-material") || CATEGORIES[6];
  const solarCat = CATEGORIES.find((c) => c.slug === "solar") || CATEGORIES[7];

  const items: WonderlandCategoryItem[] = useMemo(
    () => [
      {
        id: "cables",
        code: "01",
        number: 1,
        badgeTag: "POWER TRANSMISSION",
        categoryName: cablesCat.name,
        slug: cablesCat.slug,
        categoryRef: cablesCat,
        color: "#0284c7",
        accent: "#38bdf8",
        headline: "Brand and digital engineering working to create meaningful value for power and infrastructure.",
        subheadline: "LT/HT XLPE Armoured, Flexible FRLS Building Wires, Submersible & Screened Instrumentation Cables.",
        voltageSpec: "1.1kV - 33kV HT XLPE",
        standardSpec: "IS 7098 / IEC 60502 / CE",
        materialSpec: "99.97% Pure Electrolytic Copper",
        productCount: cablesCat.productCount,
        featuredPills: cablesCat.featuredPills,
        subcategories: cablesCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/cable-cross-section.jpg",
      },
      {
        id: "switchgear",
        code: "02",
        number: 2,
        badgeTag: "CIRCUIT PROTECTION",
        categoryName: switchgearCat.name,
        slug: switchgearCat.slug,
        categoryRef: switchgearCat,
        color: "#0284c7",
        accent: "#38bdf8",
        headline: "Intelligent circuit protection, instantaneous arc-quenching and low-voltage distribution boards.",
        subheadline: "10kA C-Curve MCBs, Molded Case Circuit Breakers (MCCB), ACBs, Power Contactors & Distribution Panels.",
        voltageSpec: "415V AC / 10kA Breaking",
        standardSpec: "IS/IEC 60898-1 / IEC 60947",
        materialSpec: "High Ag-Ni Contact Tip Alloys",
        productCount: switchgearCat.productCount,
        featuredPills: switchgearCat.featuredPills,
        subcategories: switchgearCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/switchgear.jpg",
      },
      {
        id: "lugs",
        code: "03",
        number: 3,
        badgeTag: "CRIMP TERMINALS",
        categoryName: lugsCat.name,
        slug: lugsCat.slug,
        categoryRef: lugsCat,
        color: "#ea580c",
        accent: "#fb923c",
        headline: "Pure electrolytic copper crimp terminals with zero-resistance busbar contact & electro-tin mirror plating.",
        subheadline: "Heavy-Duty Copper Tubular Lugs, Bi-metallic Friction-Welded Lugs, Pin & Ring Terminals.",
        voltageSpec: "High-Ampere Crimp Rated",
        standardSpec: "DIN 46235 / IS 8309",
        materialSpec: "100% ETP Copper + Tin Plating",
        productCount: lugsCat.productCount,
        featuredPills: lugsCat.featuredPills,
        subcategories: lugsCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/cable-lugs-macro.jpg",
      },
      {
        id: "conduit",
        code: "04",
        number: 4,
        badgeTag: "CONTAINMENT DUCT",
        categoryName: conduitCat.name,
        slug: conduitCat.slug,
        categoryRef: conduitCat,
        color: "#94a3b8",
        accent: "#cbd5e1",
        headline: "Flame-retardant rigid and corrugated electrical containment for severe thermal & chemical environments.",
        subheadline: "Heavy Mechanical Rigid PVC Conduit Pipes, GI Flexible Steel Ducts, Junction Boxes & Couplers.",
        voltageSpec: "Mechanical Barrier / IP68",
        standardSpec: "IS 9537 Part-3 / CE Certified",
        materialSpec: "High-Impact Self-Extinguishing PVC",
        productCount: conduitCat.productCount,
        featuredPills: conduitCat.featuredPills,
        subcategories: conduitCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/pvc-pipe.jpg",
      },
      {
        id: "glands",
        code: "05",
        number: 5,
        badgeTag: "HAZARDOUS SEALS",
        categoryName: glandsCat.name,
        slug: glandsCat.slug,
        categoryRef: glandsCat,
        color: "#ca8a04",
        accent: "#facc15",
        headline: "Certified flameproof brass double compression cable glands with hermetic gas and vapor containment.",
        subheadline: "Zone 1 & 2 Ex-d Flameproof Brass Glands, Weatherproof Cable Terminations & Polyamide Ex Seals.",
        voltageSpec: "Zone 1 Ex-d Flameproof / IP66",
        standardSpec: "IEC 60079-1 / BS 6121",
        materialSpec: "High-Tensile Brass CuZn39Pb3",
        productCount: glandsCat.productCount,
        featuredPills: glandsCat.featuredPills,
        subcategories: glandsCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/gland-exploded.jpg",
      },
      {
        id: "wiring",
        code: "06",
        number: 6,
        badgeTag: "MODULAR DEVICES",
        categoryName: wiringCat.name,
        slug: wiringCat.slug,
        categoryRef: wiringCat,
        color: "#8b5cf6",
        accent: "#a78bfa",
        headline: "Architectural luxury modular switches, child-safe shuttered sockets, and glowing neon rocker plates.",
        subheadline: "16A Modular Switch Plates, Dimmer Regulators, USB Fast Chargers & Heavy Metal Flush Boxes.",
        voltageSpec: "250V AC / 16A Modular Rating",
        standardSpec: "IS 3854 / RoHS Compliant",
        materialSpec: "UV-Stabilized Polycarbonate",
        productCount: wiringCat.productCount,
        featuredPills: wiringCat.featuredPills,
        subcategories: wiringCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/wiring-devices.jpg",
      },
      {
        id: "earthing",
        code: "07",
        number: 7,
        badgeTag: "GROUNDING GRID",
        categoryName: earthingCat.name,
        slug: earthingCat.slug,
        categoryRef: earthingCat,
        color: "#059669",
        accent: "#34d399",
        headline: "Molecularly bonded copper grounding electrodes and chemical compounds delivering 30+ year maintenance-free life.",
        subheadline: "254-Micron Copper Bonded Earth Rods, GI Earthing Strips, Backfill Soil Conductive Compounds & Lightning Spikes.",
        voltageSpec: "Fault Current Capacity >25kA",
        standardSpec: "IEEE 80 / IS 3043 / UL 467",
        materialSpec: "254-Micron Electrolytic Copper Bond",
        productCount: earthingCat.productCount,
        featuredPills: earthingCat.featuredPills,
        subcategories: earthingCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/earthing-rods.png",
      },
      {
        id: "solar",
        code: "08",
        number: 8,
        badgeTag: "CLEAN ENERGY PV",
        categoryName: solarCat.name,
        slug: solarCat.slug,
        categoryRef: solarCat,
        color: "#2563eb",
        accent: "#60a5fa",
        headline: "TOPCon bifacial photovoltaic cables, MC4 connectors, and high-efficiency utility-scale solar balance-of-system.",
        subheadline: "1500V DC Photovoltaic Double-Insulated Cables, MC4 Inline Connectors, Solar Array Junctions & String Inverters.",
        voltageSpec: "1500V DC Solar Rated (EN 50618)",
        standardSpec: "TUV 2PfG 1169 / IEC 62930",
        materialSpec: "Cross-Linked Halogen-Free XLPO",
        productCount: solarCat.productCount,
        featuredPills: solarCat.featuredPills,
        subcategories: solarCat.subcategories.slice(0, 5).map((s) => ({ name: s.name, slug: s.slug })),
        image: "/products/solar-panel.jpg",
      },
    ],
    [cablesCat, switchgearCat, lugsCat, conduitCat, glandsCat, wiringCat, earthingCat, solarCat]
  );

  // States
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"runway" | "showroom">("runway");
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [inspectedItem, setInspectedItem] = useState<WonderlandCategoryItem | null>(null);

  const canvasMountRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimationActiveRef = useRef(isAnimationActive);
  useEffect(() => {
    isAnimationActiveRef.current = isAnimationActive;
  }, [isAnimationActive]);

  const inspectedItemRef = useRef(inspectedItem);
  useEffect(() => {
    inspectedItemRef.current = inspectedItem;
  }, [inspectedItem]);

  // Virtual Continuous Scroll Trajectory Engine
  const runwaySpacing = 10.0;
  const maxRunwayZ = 0;
  const minRunwayZ = -(items.length - 1) * runwaySpacing;

  const currentScrollZRef = useRef(0);
  const targetScrollZRef = useRef(0);

  // Drag Refs
  const isDraggingRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);

  // Three.js State Ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    boards: Array<{ group: THREE.Group; mesh: THREE.Mesh; index: number }>;
    activeLight: THREE.PointLight;
    mouseX: number;
    mouseY: number;
    raycaster: THREE.Raycaster;
    mouseVec: THREE.Vector2;
    animFrame: number | null;
  } | null>(null);

  // Web Audio Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioGainRef = useRef<GainNode | null>(null);

  const activeItem = items[activeIndex];

  // Glide to specific category index
  const handleSelectIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= items.length) return;
      setActiveIndex(idx);
      targetScrollZRef.current = -idx * runwaySpacing;
      if (threeRef.current) {
        threeRef.current.activeLight.color.set(items[idx].color);
      }
      // If gallery section is partially scrolled out of view, keep it visible
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.top < -60 || rect.top > 140) {
          containerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    },
    [items, runwaySpacing]
  );

  const handleNext = () => handleSelectIndex((activeIndex + 1) % items.length);
  const handlePrev = () => handleSelectIndex((activeIndex - 1 + items.length) % items.length);

  // Keyboard navigation through corridor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")) return;
      if (e.key === "Escape") {
        if (inspectedItem) {
          setInspectedItem(null);
          return;
        }
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length, inspectedItem, activeIndex]);

  // Live Ahmedabad IST Clock (Matches "AMSTERDAM CET 1:55")
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synthesizer (Ambient 55Hz warm drone)
  const toggleAudio = useCallback(() => {
    if (!isAudioActive) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, ctx.currentTime);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(110.2, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(260, ctx.currentTime);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 1.2);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        audioCtxRef.current = ctx;
        audioGainRef.current = gain;
        setIsAudioActive(true);
      } catch (e) {
        console.warn("Web audio unavailable", e);
      }
    } else {
      if (audioGainRef.current && audioCtxRef.current) {
        audioGainRef.current.gain.linearRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4);
        setTimeout(() => {
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
          audioGainRef.current = null;
        }, 400);
      }
      setIsAudioActive(false);
    }
  }, [isAudioActive]);

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  // -------------------------------------------------------------
  // HIGH-DPI CANVAS TEXTURE GENERATOR
  // 1:1 match to Screenshot 1 (Board 1) & Screenshot 2 (Board 2 Electric Blue Insignia)
  // Guarantees zero black frames: always renders complete vector layout instantly!
  // -------------------------------------------------------------
  const createWonderlandCanvasTexture = useCallback(
    (item: WonderlandCategoryItem) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const renderCard = (imgObj?: HTMLImageElement) => {
        // ============================================================
        // BOARD 1 (Index 0): EXACT RECREATION OF WONDERLAND SCREENSHOT 1
        // ============================================================
        if (item.number === 1) {
          ctx.fillStyle = "#181719";
          ctx.fillRect(0, 0, 1024, 1024);

          ctx.strokeStyle = "#38373b";
          ctx.lineWidth = 4;
          ctx.strokeRect(20, 20, 984, 984);

          // Top Header: Orange 'V' icon badge + "WELCOME    TO    VOLAMP"
          ctx.fillStyle = "#ec6437";
          ctx.fillRect(60, 60, 48, 48);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 28px 'Space Grotesk', system-ui, sans-serif";
          ctx.fillText("V", 75, 95);

          ctx.fillStyle = "#9d958b";
          ctx.font = "bold 18px monospace";
          try { (ctx as any).letterSpacing = "6px"; } catch {}
          ctx.fillText("WELCOME", 200, 92);
          ctx.fillText("TO", 450, 92);
          ctx.fillStyle = "#ded6cb";
          ctx.fillText("VOLAMP", 680, 92);

          // Editorial Headline (Exact Wonderland typographic statement)
          ctx.fillStyle = "#ded6cb";
          ctx.font = "bold 44px 'Space Grotesk', 'Syne', system-ui, sans-serif";
          try { (ctx as any).letterSpacing = "-0.5px"; } catch {}
          ctx.fillText("Brand and digital", 60, 240);
          ctx.fillText("studio working to", 60, 305);
          ctx.fillText("create meaningful", 60, 370);
          ctx.fillText("value for people", 60, 435);
          ctx.fillText("and planet.", 60, 500);

          // Interactive Bullet Link: ● READ MORE / EXPLORE CATALOG
          ctx.fillStyle = "#ded6cb";
          ctx.beginPath();
          ctx.arc(72, 600, 7, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = "bold 22px 'Space Grotesk', system-ui, sans-serif";
          try { (ctx as any).letterSpacing = "2px"; } catch {}
          ctx.fillText("EXPLORE CATALOG", 95, 607);
          ctx.strokeStyle = "#ded6cb";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(95, 618);
          ctx.lineTo(320, 618);
          ctx.stroke();

          // Orange Monogram Watermark on bottom right
          ctx.fillStyle = "#ec6437";
          ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
          ctx.fillText("V·E", 880, 607);

          // Bottom Metadata Footer Strip
          ctx.strokeStyle = "#2f2e33";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(60, 880);
          ctx.lineTo(964, 880);
          ctx.stroke();

          ctx.fillStyle = "#78716c";
          ctx.font = "bold 15px monospace";
          try { (ctx as any).letterSpacing = "1px"; } catch {}
          ctx.fillText("VOLAMP CENTRAL STUDIO", 60, 930);
          ctx.fillText("16-25", 420, 930);
          ctx.fillText("AHMEDABAD HUB / 3,385+ READY SKUs", 620, 930);

          texture.needsUpdate = true;
          return;
        }

        // ============================================================
        // BOARD 2 (Index 1): EXACT RECREATION OF WONDERLAND SCREENSHOT 2
        // Glowing Electric Blue Chevron Insignia on Deep Blue Radial Gradient
        // ============================================================
        if (item.number === 2) {
          const blueGrad = ctx.createRadialGradient(512, 512, 80, 512, 512, 650);
          blueGrad.addColorStop(0, "#09225e");
          blueGrad.addColorStop(0.5, "#041135");
          blueGrad.addColorStop(1, "#020718");
          ctx.fillStyle = blueGrad;
          ctx.fillRect(0, 0, 1024, 1024);

          ctx.strokeStyle = "#0d2b63";
          ctx.lineWidth = 4;
          ctx.strokeRect(20, 20, 984, 984);

          // Draw the iconic Glowing Electric Blue Chevron Emblem
          ctx.save();
          const drawEmblemPath = () => {
            ctx.beginPath();
            ctx.moveTo(580, 310);
            ctx.lineTo(650, 430);
            ctx.quadraticCurveTo(630, 600, 560, 770);
            ctx.lineTo(460, 730);
            ctx.quadraticCurveTo(530, 560, 545, 450);
            ctx.closePath();
          };

          // 1. Wide Ambient Electric Blue Bloom Glow
          ctx.shadowColor = "#00c3ff";
          ctx.shadowBlur = 65;
          ctx.strokeStyle = "#0077ff";
          ctx.lineWidth = 32;
          drawEmblemPath();
          ctx.stroke();

          // 2. Mid Vibrant Cyan Stroke
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 30;
          ctx.strokeStyle = "#00d2ff";
          ctx.lineWidth = 18;
          drawEmblemPath();
          ctx.stroke();

          // 3. Crisp Inner Cyan Stroke
          ctx.shadowBlur = 10;
          ctx.strokeStyle = "#7dd3fc";
          ctx.lineWidth = 8;
          drawEmblemPath();
          ctx.stroke();

          // 4. White High-Voltage Electric Core
          ctx.shadowBlur = 4;
          ctx.shadowColor = "#ffffff";
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 3;
          drawEmblemPath();
          ctx.stroke();
          ctx.restore();

          // Subtle Technical Monospace Watermark
          ctx.fillStyle = "#38bdf8";
          ctx.font = "bold 16px monospace";
          try { (ctx as any).letterSpacing = "3px"; } catch {}
          ctx.fillText("02 · SWITCHGEARS & ARC PROTECTION · 10kA BREAKING", 120, 940);

          texture.needsUpdate = true;
          return;
        }

        // ============================================================
        // BOARDS 3 TO 8: EDITORIAL MONOLITHIC SHOWCASES
        // High-contrast, immediately legible, never pitch-black
        // ============================================================
        ctx.fillStyle = "#161518";
        ctx.fillRect(0, 0, 1024, 1024);

        if (imgObj && imgObj.complete && imgObj.naturalWidth > 0) {
          ctx.save();
          ctx.drawImage(imgObj, 40, 140, 944, 400);
          const imgGrad = ctx.createLinearGradient(0, 140, 0, 540);
          imgGrad.addColorStop(0, "rgba(22, 21, 24, 0.2)");
          imgGrad.addColorStop(0.7, "rgba(22, 21, 24, 0.75)");
          imgGrad.addColorStop(1, "rgba(22, 21, 24, 1.0)");
          ctx.fillStyle = imgGrad;
          ctx.fillRect(40, 140, 944, 400);
          ctx.restore();
        } else {
          // Dynamic tech gradient with category accent tint
          const dummyGrad = ctx.createLinearGradient(0, 140, 0, 540);
          dummyGrad.addColorStop(0, "rgba(45, 43, 52, 0.8)");
          dummyGrad.addColorStop(1, "rgba(22, 21, 24, 1.0)");
          ctx.fillStyle = dummyGrad;
          ctx.fillRect(40, 140, 944, 400);

          // Technical grid lines across placeholder
          ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
          ctx.lineWidth = 1;
          for (let gy = 160; gy < 520; gy += 40) {
            ctx.beginPath();
            ctx.moveTo(40, gy);
            ctx.lineTo(984, gy);
            ctx.stroke();
          }
        }

        // Outer Border
        ctx.strokeStyle = "#38373b";
        ctx.lineWidth = 4;
        ctx.strokeRect(20, 20, 984, 984);

        // Header Bar
        ctx.fillStyle = "#ec6437";
        ctx.fillRect(60, 60, 48, 48);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText("V", 75, 95);

        ctx.fillStyle = "#a8a29e";
        ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif";
        try { (ctx as any).letterSpacing = "4px"; } catch {}
        ctx.fillText("VOLAMP", 130, 92);

        ctx.fillStyle = "#ec6437";
        ctx.font = "bold 18px monospace";
        try { (ctx as any).letterSpacing = "2px"; } catch {}
        ctx.fillText(`MASTER SERIES · ${item.code}`, 700, 92);

        // Category Name Over Image
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 38px 'Space Grotesk', system-ui, sans-serif";
        try { (ctx as any).letterSpacing = "1px"; } catch {}
        ctx.fillText(item.categoryName, 60, 480);

        // Editorial Headline
        ctx.fillStyle = "#ded6cb";
        ctx.font = "bold 32px 'Space Grotesk', system-ui, sans-serif";
        try { (ctx as any).letterSpacing = "-0.3px"; } catch {}

        const words = item.headline.split(" ");
        let line = "";
        let y = 550;
        const maxLineW = 904;
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + " ";
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineW && i > 0) {
            ctx.fillText(line, 60, y);
            line = words[i] + " ";
            y += 46;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 60, y);

        // Engineering Specification Strip
        const specY = Math.max(y + 35, 690);
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fillRect(60, specY, 904, 100);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 2;
        ctx.strokeRect(60, specY, 904, 100);

        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 16px monospace";
        ctx.fillText("RATING / CAPACITY", 90, specY + 36);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText(item.voltageSpec, 90, specY + 74);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 16px monospace";
        ctx.fillText("CERTIFICATION", 420, specY + 36);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText(item.standardSpec, 420, specY + 74);

        ctx.fillStyle = "#34d399";
        ctx.font = "bold 16px monospace";
        ctx.fillText("MATERIAL PURITY", 740, specY + 36);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 22px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText("100% Electrolytic", 740, specY + 74);

        // Pill Button: ● EXPLORE CATEGORY ↗
        const btnY = specY + 130;
        ctx.fillStyle = "#ec6437";
        ctx.beginPath();
        drawRoundRect(ctx, 60, btnY, 340, 64, 32);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(100, btnY + 32, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px 'Space Grotesk', system-ui, sans-serif";
        ctx.fillText("EXPLORE CATEGORY", 125, btnY + 40);
        ctx.fillText("↗", 355, btnY + 40);

        // Footer Live Catalog Metadata
        ctx.fillStyle = "#78716c";
        ctx.font = "bold 17px monospace";
        ctx.fillText(`VOLAMP CENTRAL HUB · AHMEDABAD · 24H DISPATCH`, 60, 960);
        ctx.fillText(`${item.productCount.toLocaleString("en-IN")}+ READY SKUs`, 750, 960);

        texture.needsUpdate = true;
      };

      // 1. Initial complete synchronous render
      renderCard();

      // 2. Preload photograph asynchronously and re-render seamlessly
      if (item.number > 2) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => renderCard(img);
        img.onerror = () => renderCard();
        img.src = item.image;
      }

      return texture;
    },
    []
  );

  // -------------------------------------------------------------
  // THREE.JS 3D WONDERLAND VAULTED CORRIDOR ENGINE
  // Wide architectural runway perspective (solving the 80% viewport defect)
  // -------------------------------------------------------------
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || window.innerWidth || 1200;
    const height = mount.clientHeight || Math.round(window.innerHeight * 0.88) || 750;

    // 1. Scene & Deep Warm Atmosphere Fog (Matching Image 1 reference)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1d1713);
    scene.fog = new THREE.FogExp2(0x1c1612, 0.015);

    // 2. Camera Setup: 48° FoV for expansive architectural depth
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 140);
    camera.position.set(0.0, 1.62, 7.2);

    // 3. Renderer with ACES Tone Mapping & sRGB
    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.45;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    mount.replaceChildren(renderer.domElement);

    // 4. Lighting System: Warm ambient + warm hemisphere + overhead fill
    const ambientLight = new THREE.AmbientLight(0xffdfb8, 2.2);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x443020, 1.8);
    scene.add(hemiLight);

    const overheadDirectional = new THREE.DirectionalLight(0xfffaed, 2.2);
    overheadDirectional.position.set(2, 16, 4);
    scene.add(overheadDirectional);

    // Warm cove uplight along walls
    const leftWallLight = new THREE.DirectionalLight(0xff9900, 1.4);
    leftWallLight.position.set(-6.5, 0.5, -30);
    scene.add(leftWallLight);

    const rightWallLight = new THREE.DirectionalLight(0xff9900, 1.4);
    rightWallLight.position.set(6.5, 0.5, -30);
    scene.add(rightWallLight);

    const activePointLight = new THREE.PointLight(new THREE.Color(items[0].color), 3.0, 20);
    activePointLight.position.set(-3.2, 2.2, 0);
    scene.add(activePointLight);

    // -------------------------------------------------------------
    // 5. THE VAULTED ARCHED MASONRY TUNNEL CEILING & WALLS
    // Warm sandstone crypt with aged masonry blocks and mossy weathering
    // -------------------------------------------------------------
    const vaultRadius = 10.5;
    const vaultLength = 160;
    const vaultGeo = new THREE.CylinderGeometry(
      vaultRadius,
      vaultRadius,
      vaultLength,
      48,
      1,
      true,
      0,
      Math.PI
    );
    vaultGeo.rotateZ(Math.PI / 2);
    vaultGeo.rotateY(Math.PI / 2);

    const vaultCanvas = document.createElement("canvas");
    vaultCanvas.width = 1024;
    vaultCanvas.height = 1024;
    const vctx = vaultCanvas.getContext("2d");
    if (vctx) {
      // Warm earthen sandstone crypt base
      vctx.fillStyle = "#342c23";
      vctx.fillRect(0, 0, 1024, 1024);

      // Masonry stone blocks with natural stone variation
      const rows = 18;
      const cols = 9;
      const rowH = 1024 / rows;
      const colW = 1024 / cols;
      for (let r = 0; r < rows; r++) {
        const y = r * rowH;
        const offset = (r % 2) * (colW / 2);

        // Mortar joint
        vctx.strokeStyle = "#1a1510";
        vctx.lineWidth = 3;
        vctx.beginPath();
        vctx.moveTo(0, y);
        vctx.lineTo(1024, y);
        vctx.stroke();

        for (let c = -1; c <= cols + 1; c++) {
          const x = c * colW + offset;
          vctx.beginPath();
          vctx.moveTo(x, y);
          vctx.lineTo(x, y + rowH);
          vctx.stroke();

          // Stone block color variation: warm ochre, sandy brown, aged stone
          const hash = Math.sin(r * 4.3 + c * 7.1) * 10000;
          const rnd = hash - Math.floor(hash);
          const rVal = Math.floor(48 + rnd * 28);
          const gVal = Math.floor(40 + rnd * 24);
          const bVal = Math.floor(32 + rnd * 18);
          vctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
          vctx.fillRect(x + 2, y + 2, colW - 4, rowH - 4);
        }
      }

      // Organic stone weathering, damp vertical moss streaks & aged stains
      for (let s = 0; s < 45; s++) {
        const sx = (s * 73) % 1024;
        const sy = (s * 137) % 1024;
        const sr = 35 + (s % 30);
        const grad = vctx.createRadialGradient(sx, sy, 4, sx, sy, sr);
        if (s % 2 === 0) {
          grad.addColorStop(0, "rgba(35, 45, 25, 0.45)"); // mossy green
        } else {
          grad.addColorStop(0, "rgba(22, 16, 12, 0.55)"); // dark earth
        }
        grad.addColorStop(1, "transparent");
        vctx.fillStyle = grad;
        vctx.beginPath();
        vctx.arc(sx, sy, sr, 0, Math.PI * 2);
        vctx.fill();
      }
    }
    const vaultTex = new THREE.CanvasTexture(vaultCanvas);
    vaultTex.wrapS = THREE.RepeatWrapping;
    vaultTex.wrapT = THREE.RepeatWrapping;
    vaultTex.repeat.set(4, 14);
    vaultTex.colorSpace = THREE.SRGBColorSpace;

    const vaultMat = new THREE.MeshStandardMaterial({
      map: vaultTex,
      side: THREE.BackSide,
      roughness: 0.75,
      metalness: 0.12,
    });
    const vaultMesh = new THREE.Mesh(vaultGeo, vaultMat);
    vaultMesh.position.set(0, 0, -40);
    scene.add(vaultMesh);

    // -------------------------------------------------------------
    // 6. HIGH-GLOSS WET REFLECTIVE MIRROR FLOOR (Matching Image 1)
    // -------------------------------------------------------------
    const floorGeo = new THREE.PlaneGeometry(42, 170, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1614,
      roughness: 0.12,
      metalness: 0.85,
      transparent: true,
      opacity: 0.92,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -0.05, -40);
    scene.add(floorMesh);

    // -------------------------------------------------------------
    // 7. CLASSICAL FLUTED SANDSTONE COLUMNS WITH CLIMBING IVY
    // Warm sandstone pillars with stone plinths (Matching Image 1)
    // -------------------------------------------------------------
    const columnCount = 16;
    const columnSpacing = 7.5;
    const colPlinthGeo = new THREE.BoxGeometry(1.2, 0.5, 1.2);
    const colShaftGeo = new THREE.CylinderGeometry(0.42, 0.48, 7.4, 32);
    const colCapitalGeo = new THREE.BoxGeometry(1.15, 0.4, 1.15);
    const stoneColMat = new THREE.MeshStandardMaterial({
      color: 0x6e6254,
      roughness: 0.65,
      metalness: 0.15,
    });

    const ivyMat1 = new THREE.MeshStandardMaterial({
      color: 0x1e3318,
      roughness: 0.8,
      side: THREE.DoubleSide,
    });
    const ivyMat2 = new THREE.MeshStandardMaterial({
      color: 0x2b4a24,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const leafGeo = new THREE.PlaneGeometry(0.18, 0.22);

    // Overhead suspended golden glowing lanterns
    const ceilingLampGeo = new THREE.BoxGeometry(1.9, 0.18, 0.5);
    const ceilingLampMat = new THREE.MeshStandardMaterial({
      color: 0xffaa20,
      emissive: 0xff9900,
      emissiveIntensity: 4.5,
    });
    const cableGeo = new THREE.CylinderGeometry(0.015, 0.015, 2.6);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x0a090b });

    // Diagonal amber neon wall strips
    const diagNeonGeo = new THREE.BoxGeometry(0.05, 3.6, 0.05);
    const diagNeonMat = new THREE.MeshBasicMaterial({ color: 0xff9f1c });

    // Continuous floor cove uplights along wall bases
    const coveGeo = new THREE.BoxGeometry(0.06, 0.04, 160);
    const coveMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });

    const leftCove = new THREE.Mesh(coveGeo, coveMat);
    leftCove.position.set(-6.2, 0.04, -40);
    scene.add(leftCove);

    const rightCove = new THREE.Mesh(coveGeo, coveMat);
    rightCove.position.set(6.2, 0.04, -40);
    scene.add(rightCove);

    for (let i = 0; i < columnCount; i++) {
      const zPos = 10 - i * columnSpacing;

      const buildColumnWithIvy = (xPos: number, isRight: boolean) => {
        const colGroup = new THREE.Group();

        const plinth = new THREE.Mesh(colPlinthGeo, stoneColMat);
        plinth.position.set(0, 0.25, 0);
        colGroup.add(plinth);

        const shaft = new THREE.Mesh(colShaftGeo, stoneColMat);
        shaft.position.set(0, 3.95, 0);
        colGroup.add(shaft);

        const capital = new THREE.Mesh(colCapitalGeo, stoneColMat);
        capital.position.set(0, 7.85, 0);
        colGroup.add(capital);

        // Climbing Ivy wrapping tightly around lower 2.5m (Dense organic foliage matching Image 1)
        const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, 2.6, 6);
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.9 });
        const vineStem = new THREE.Mesh(stemGeo, stemMat);
        vineStem.position.set(isRight ? -0.46 : 0.46, 1.75, 0);
        vineStem.rotation.z = isRight ? 0.08 : -0.08;
        colGroup.add(vineStem);

        const leafCount = 42;
        for (let l = 0; l < leafCount; l++) {
          const t = l / leafCount;
          const leafY = 0.5 + t * 2.3;
          const angle = t * Math.PI * 4.2 + (isRight ? Math.PI : 0);
          const r = 0.49 + Math.random() * 0.03; // Hugs outside of fluted stone shaft
          const leaf = new THREE.Mesh(leafGeo, l % 3 === 0 ? ivyMat1 : ivyMat2);
          leaf.position.set(Math.cos(angle) * r, leafY, Math.sin(angle) * r);
          leaf.rotation.set(
            Math.random() * 0.4 - 0.2,
            -angle + Math.PI / 2,
            Math.random() * 0.5 - 0.25
          );
          colGroup.add(leaf);
        }

        colGroup.position.set(xPos, 0, zPos);
        return colGroup;
      };

      scene.add(buildColumnWithIvy(-6.2, false));
      scene.add(buildColumnWithIvy(6.2, true));

      // Overhead Suspended Glowing Amber Lantern on Centerline
      const lamp = new THREE.Mesh(ceilingLampGeo, ceilingLampMat);
      lamp.position.set(0, 7.0, zPos);
      scene.add(lamp);

      // Floor Reflection of Ceiling Lantern (Creates the glistening golden pools on wet floor)
      const lampReflect = new THREE.Mesh(ceilingLampGeo, ceilingLampMat);
      lampReflect.position.set(0, -7.0, zPos);
      scene.add(lampReflect);

      const leftCable = new THREE.Mesh(cableGeo, cableMat);
      leftCable.position.set(-0.6, 8.3, zPos);
      scene.add(leftCable);

      const rightCable = new THREE.Mesh(cableGeo, cableMat);
      rightCable.position.set(0.6, 8.3, zPos);
      scene.add(rightCable);

      // Warm overhead point light pool washing columns and floor
      const lampLight = new THREE.PointLight(0xff9911, 3.2, 18, 1.2);
      lampLight.position.set(0, 6.6, zPos);
      scene.add(lampLight);

      // Diagonal glowing neon wall strips between column bays
      if (i < columnCount - 1) {
        const bayZ = zPos - columnSpacing * 0.5;

        const leftDiag = new THREE.Mesh(diagNeonGeo, diagNeonMat);
        leftDiag.position.set(-6.8, 4.0, bayZ);
        leftDiag.rotation.z = -0.55;
        scene.add(leftDiag);

        const rightDiag = new THREE.Mesh(diagNeonGeo, diagNeonMat);
        rightDiag.position.set(6.8, 4.0, bayZ);
        rightDiag.rotation.z = 0.55;
        scene.add(rightDiag);
      }
    }

    // -------------------------------------------------------------
    // 8. ATMOSPHERIC SPARK PARTICLES
    // -------------------------------------------------------------
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePositions[p * 3] = (Math.random() - 0.5) * 16;
      particlePositions[p * 3 + 1] = Math.random() * 6.5;
      particlePositions[p * 3 + 2] = (Math.random() - 0.5) * 110 - 20;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffaa44,
      size: 0.04,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const sparkParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(sparkParticles);

    // -------------------------------------------------------------
    // 9. FREESTANDING 3D PRODUCT DISPLAYS
    // Placed on Left (x = -3.2) and Right (x = +3.2)
    // Angled naturally toward runway (matching Image 1)
    // -------------------------------------------------------------
    const boardGroups: Array<{ group: THREE.Group; mesh: THREE.Mesh; index: number }> = [];

    const neonFootMat = new THREE.MeshBasicMaterial({ color: 0xff8c00 });
    const neonFootGeo = new THREE.BoxGeometry(3.04, 0.04, 0.04);

    items.forEach((item, idx) => {
      const boardGroup = new THREE.Group();

      const isLeft = idx % 2 === 0;
      const xOffset = isLeft ? -3.2 : 3.2;
      const zOffset = -idx * runwaySpacing;

      // Board Dimensions: Width 2.8m, Height 2.8m
      const boardGeo = new THREE.PlaneGeometry(2.8, 2.8);
      const texture = createWonderlandCanvasTexture(item);
      const boardMat = new THREE.MeshBasicMaterial({
        map: texture,
        toneMapped: false,
      });

      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.set(0, 1.48, 0.02);
      boardGroup.add(boardMesh);

      // Back Enclosure Casing
      const casingGeo = new THREE.BoxGeometry(2.86, 2.86, 0.12);
      const casingMat = new THREE.MeshStandardMaterial({
        color: 0x161517,
        roughness: 0.45,
        metalness: 0.75,
      });
      const casing = new THREE.Mesh(casingGeo, casingMat);
      casing.position.set(0, 1.48, -0.06);
      boardGroup.add(casing);

      // Pedestal Base Stand
      const footGeo = new THREE.BoxGeometry(3.08, 0.08, 0.4);
      const footMat = new THREE.MeshStandardMaterial({
        color: 0x181719,
        roughness: 0.4,
        metalness: 0.6,
      });
      const foot = new THREE.Mesh(footGeo, footMat);
      foot.position.set(0, 0.04, 0);
      boardGroup.add(foot);

      // Glowing Amber Neon Strip Along Baseline Foot (Screenshot 1 & 2 signature)
      const neonFoot = new THREE.Mesh(neonFootGeo, neonFootMat);
      neonFoot.position.set(0, 0.06, 0.18);
      boardGroup.add(neonFoot);

      // WET FLOOR MIRROR REFLECTION OF BOARD
      const reflectGeo = new THREE.PlaneGeometry(2.8, 2.8);
      const reflectMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: idx === 1 ? 0.48 : 0.35,
        blending: THREE.AdditiveBlending,
      });
      const reflectMesh = new THREE.Mesh(reflectGeo, reflectMat);
      reflectMesh.scale.y = -1;
      reflectMesh.position.set(0, -1.48, 0.02);
      boardGroup.add(reflectMesh);

      // Floor Reflection of Glowing Foot Strip
      const reflectFoot = new THREE.Mesh(neonFootGeo, neonFootMat);
      reflectFoot.position.set(0, -0.06, 0.18);
      boardGroup.add(reflectFoot);

      boardGroup.position.set(xOffset, 0, zOffset);
      // Angle slightly toward central runway (Image 1 signature)
      boardGroup.rotation.y = isLeft ? 0.14 : -0.14;
      scene.add(boardGroup);

      boardGroups.push({ group: boardGroup, mesh: boardMesh, index: idx });
    });

    threeRef.current = {
      scene,
      camera,
      renderer,
      boards: boardGroups,
      activeLight: activePointLight,
      mouseX: 0,
      mouseY: 0,
      raycaster: new THREE.Raycaster(),
      mouseVec: new THREE.Vector2(),
      animFrame: null,
    };

    // -------------------------------------------------------------
    // RENDER LOOP & VIRTUAL CAMERA RUNWAY CONTROLLER
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      const state = threeRef.current;
      if (!state) return;

      const delta = clock.getDelta();

      // Particle drifting
      const positions = sparkParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= delta * 0.12;
        if (positions[i] < 0) positions[i] = 6.5;
      }
      sparkParticles.geometry.attributes.position.needsUpdate = true;

      // Smooth runway scroll momentum lerp
      if (isAnimationActiveRef.current) {
        currentScrollZRef.current += (targetScrollZRef.current - currentScrollZRef.current) * 0.08;

        const currentZ = currentScrollZRef.current;
        state.camera.position.z = currentZ + 7.5;
        state.camera.position.x = state.mouseX * 0.25;
        state.camera.position.y = 1.68 + state.mouseY * 0.12;

        // Look straight down the gallery runway toward the distant horizon
        state.camera.lookAt(state.mouseX * 0.3, 1.55, currentZ - 12.0);

        // Update active index based on current scroll position
        const nearestIndex = Math.min(
          items.length - 1,
          Math.max(0, Math.round(-currentZ / runwaySpacing))
        );
        setActiveIndex((prev) => (prev !== nearestIndex ? nearestIndex : prev));

        // Position active spotlight over the nearest exhibit
        const activeBoard = state.boards[nearestIndex];
        if (activeBoard) {
          state.activeLight.position.set(
            activeBoard.group.position.x,
            2.2,
            activeBoard.group.position.z
          );
        }
      }

      state.renderer.render(state.scene, state.camera);
      state.animFrame = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mount || !threeRef.current) return;
      const newW = mount.clientWidth || window.innerWidth;
      const newH = mount.clientHeight || Math.round(window.innerHeight * 0.88);
      if (newW > 0 && newH > 0) {
        threeRef.current.camera.aspect = newW / newH;
        threeRef.current.camera.updateProjectionMatrix();
        threeRef.current.renderer.setSize(newW, newH);
      }
    };
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mount);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (threeRef.current?.animFrame) {
        cancelAnimationFrame(threeRef.current.animFrame);
      }
      renderer.dispose();
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, [items, createWonderlandCanvasTexture, runwaySpacing]);

  // -------------------------------------------------------------
  // RAYCASTING & CLICK INTERACTIONS
  // -------------------------------------------------------------
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!threeRef.current || !canvasMountRef.current) return;
    const rect = canvasMountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const state = threeRef.current;
    state.mouseVec.set(x, y);
    state.raycaster.setFromCamera(state.mouseVec, state.camera);

    const boardMeshes = state.boards.map((b) => b.mesh);
    const intersects = state.raycaster.intersectObjects(boardMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const hitItem = state.boards.find((b) => b.mesh === hitMesh);
      if (hitItem) {
        if (hitItem.index === activeIndex) {
          // Open detail inspect overlay (matching user video 00:04 & 00:43)
          setInspectedItem(items[hitItem.index]);
        } else {
          // Glide camera smoothly to the clicked board
          handleSelectIndex(hitItem.index);
        }
      }
    }
  };

  // Mouse Parallax & Hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!threeRef.current || !canvasMountRef.current) return;
    const rect = canvasMountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    const state = threeRef.current;
    state.mouseX = x;
    state.mouseY = y;

    state.mouseVec.set(x, y);
    state.raycaster.setFromCamera(state.mouseVec, state.camera);
    const boardMeshes = state.boards.map((b) => b.mesh);
    const intersects = state.raycaster.intersectObjects(boardMeshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const hitItem = state.boards.find((b) => b.mesh === hitMesh);
      if (hitItem) setHoveredIndex(hitItem.index);
    } else {
      setHoveredIndex(null);
    }
  };

  // Native non-passive continuous virtual runway wheel listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      // If modal inspection popup is open, don't hijack wheel (let modal scroll its text)
      if (inspectedItemRef.current) return;

      const dy = e.deltaY;
      if (Math.abs(dy) < 0.1) return;

      const isScrollingDown = dy > 0;
      const isScrollingUp = dy < 0;

      const currentTargetZ = targetScrollZRef.current;
      const atStart = currentTargetZ >= maxRunwayZ - 0.2;
      const atEnd = currentTargetZ <= minRunwayZ + 0.2;

      // Allow natural outer page scrolling only when user scrolls past boundaries
      if ((isScrollingUp && atStart) || (isScrollingDown && atEnd)) {
        return; // Don't prevent default, allow page to scroll up/down
      }

      // Inside gallery runway: PREVENT DEFAULT so browser DOES NOT scroll the page!
      e.preventDefault();
      e.stopPropagation();

      // Normalize delta across browsers and devices
      let normalizedDy = dy;
      if (e.deltaMode === 1) normalizedDy *= 33; // line mode
      else if (e.deltaMode === 2) normalizedDy *= 300; // page mode

      // Responsive sensitivity: feels silky smooth like Wonderland Studio
      const scrollStep = normalizedDy * 0.015;
      targetScrollZRef.current = Math.max(
        minRunwayZ,
        Math.min(maxRunwayZ, targetScrollZRef.current - scrollStep)
      );
    };

    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onNativeWheel);
    };
  }, [minRunwayZ, maxRunwayZ]);

  // Mouse drag navigation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (inspectedItem) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input")) return;
    isDraggingRef.current = true;
    dragStartY.current = e.clientY;
    dragStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - dragStartY.current;
    const deltaX = e.clientX - dragStartX.current;
    isDraggingRef.current = false;
    if (Math.abs(deltaY) > 30) {
      targetScrollZRef.current = Math.max(
        minRunwayZ,
        Math.min(maxRunwayZ, targetScrollZRef.current + deltaY * 0.04)
      );
    } else if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) handleNext();
      else handlePrev();
    }
  };

  // Touch swipe
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (inspectedItem) return;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(delta) > 25) {
      targetScrollZRef.current = Math.max(
        minRunwayZ,
        Math.min(maxRunwayZ, targetScrollZRef.current + delta * 0.05)
      );
    }
    touchStartY.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#131215] text-[#ded6cb] border-y border-[#2e2d31] shadow-2xl overflow-hidden select-none transition-all duration-300 font-sans ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none h-screen w-screen"
          : "w-full h-[88vh] min-h-[740px] max-h-[950px] rounded-none"
      }`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ cursor: hoveredIndex !== null ? "pointer" : "grab" }}
    >
      {/* 1. THREE.JS 3D WONDERLAND CORRIDOR CANVAS */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full z-0" />

      {/* 2. TOP-LEFT WONDERLAND STUDIO BRAND & NUMBERED CHAPTERS (Exact Screenshot 1 & 2 HUD) */}
      <div className="absolute left-5 sm:left-8 top-5 sm:top-8 z-20 flex flex-col pointer-events-auto">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-widest text-[#ded6cb]">
            VOLAMP
          </h2>
          <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#9d958b] leading-tight">
            ELECTRICAL SUPPLY DESIGN<br />
            INC 1998 | BASED IN AHMEDABAD
          </p>
        </div>

        {/* Wonderland Studio Numbered Chapter Menu with Oval Pill Border on Active */}
        <div className="flex flex-col gap-1 mt-1 max-w-[240px]">
          {items.map((cat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div key={cat.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectIndex(idx);
                  }}
                  className={`text-left text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? "px-3 py-1 rounded-full border border-[#ded6cb] text-[#ded6cb] font-bold bg-white/5 shadow-xs"
                      : "text-[#8d857b] hover:text-[#ded6cb] px-3 py-1 rounded-full border border-transparent font-medium"
                  }`}
                >
                  <span className="text-[11px] font-mono">{cat.number}</span>
                  <span className="truncate">{cat.categoryName}</span>
                </button>
                {/* Indented 1.1 OVERVIEW subline under active chapter (Smooth transition, zero layout jumping) */}
                <div
                  className={`overflow-hidden transition-all duration-200 text-[10px] text-[#8d857b] font-mono pl-6 tracking-wider ${
                    isActive ? "max-h-5 opacity-100 pt-0.5" : "max-h-0 opacity-0 pt-0 pointer-events-none"
                  }`}
                >
                  {cat.number}.1 OVERVIEW
                </div>
              </div>
            );
          })}
        </div>

        {/* Animation & Time Ticker (Exact Wonderland HUD) */}
        <div className="mt-5 text-[11px] uppercase tracking-wider text-[#8d857b] font-mono space-y-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAnimationActive(!isAnimationActive);
            }}
            className="hover:text-[#ded6cb] cursor-pointer transition-colors block text-left"
          >
            ANIMATION {isAnimationActive ? "ON" : "OFF"}
          </button>
          <div>AHMEDABAD IST {currentTimeStr || "LIVE"}</div>
        </div>
      </div>

      {/* 3. TOP-RIGHT CONTROLS: Golden Spinning Asterisk Glyph (Exact Screenshot 1 & 2) */}
      <div className="absolute right-4 sm:right-8 top-4 sm:top-8 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-full border border-white/10 text-[11px] font-mono mr-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode("runway");
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              viewMode === "runway"
                ? "bg-[#ec6437] text-white font-bold shadow-md"
                : "text-[#8d857b] hover:text-[#ded6cb]"
            }`}
          >
            ✦ 3D RUNWAY
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setViewMode("showroom");
            }}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              viewMode === "showroom"
                ? "bg-[#ec6437] text-white font-bold shadow-md"
                : "text-[#8d857b] hover:text-[#ded6cb]"
            }`}
          >
            ☷ SHOWROOM
          </button>
        </div>

        {onOpenShowroomLab && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenShowroomLab(activeItem.id);
            }}
            className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#ec6437] text-white text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
            title="Inspect 360° AR Digital Twin"
          >
            <Zap className="size-3.5 text-amber-400" />
            <span className="hidden sm:inline">360° AR</span>
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFullscreen(!isFullscreen);
          }}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Spatial Mode"}
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>

        {/* THE SPINNING GOLDEN ASTERISK GLYPH (Screenshot 1 & 2 signature top-right element) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleAudio();
          }}
          className="relative p-1 rounded-full hover:bg-white/10 transition-transform active:scale-90 cursor-pointer text-yellow-400 group"
          title={isAudioActive ? "Mute Ambient Spatial Drone" : "Enable Ambient Spatial Drone (55Hz)"}
        >
          <span className="inline-block text-2xl font-bold leading-none animate-[spin_8s_linear_infinite] select-none text-[#eab308]">
            ✱
          </span>
          {isAudioActive && (
            <span className="absolute bottom-1 right-1 size-2 rounded-full bg-green-400 ring-2 ring-black" />
          )}
        </button>
      </div>

      {/* 4. BOTTOM CENTER "SCROLL TO DISCOVER" (Exact match to User Video 00:01) */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-6 sm:bottom-8 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-widest text-[#9d958b]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-[#ded6cb]"
            title="Previous Exhibit"
          >
            <ChevronLeft className="size-4" />
          </button>

          <span className="animate-pulse text-[#ded6cb] font-semibold text-[11px] tracking-widest">
            SCROLL TO DISCOVER · 0{activeIndex + 1} / 08
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-[#ded6cb]"
            title="Next Exhibit"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Minimal Progress Line */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectIndex(i);
              }}
              className={`h-1 rounded-full transition-all cursor-pointer ${
                i === activeIndex ? "w-6 bg-[#ec6437]" : "w-1.5 bg-[#484749] hover:bg-[#8d857b]"
              }`}
              title={`Jump to ${items[i].categoryName}`}
            />
          ))}
        </div>
      </div>

      {/* 5. ACTIVE CATEGORY QUICK EXPLORER STRIP (Bottom-Right, safe margins away from floating WhatsApp) */}
      <div className="absolute right-4 sm:right-24 bottom-4 sm:bottom-8 z-20 flex flex-col items-center sm:items-end gap-2.5 max-w-lg pointer-events-auto">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(activeItem.slug);
            }}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#ec6437] hover:bg-[#ff7d50] text-white font-bold text-xs uppercase tracking-wider shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explore {activeItem.categoryName}</span>
            <ArrowRight className="size-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setInspectedItem(activeItem);
            }}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            title="Inspect Specifications"
          >
            <Layers className="size-4 text-amber-400" />
            <span>Inspect</span>
          </button>
        </div>
      </div>

      {/* 6. DETAIL INSPECT SCREEN WITH <- BACK BUTTON (Exact match to User Video 00:05 & 00:43) */}
      {inspectedItem && (
        <div className="absolute inset-0 z-40 bg-[#131215]/96 backdrop-blur-2xl flex flex-col pointer-events-auto overflow-y-auto animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-12">
          {/* Top Bar with <- BACK and Golden Asterisk */}
          <div className="flex items-center justify-between mb-8 max-w-6xl w-full mx-auto">
            <button
              onClick={() => setInspectedItem(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 text-[#ded6cb] font-mono text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              <ChevronLeft className="size-4" />
              <span>BACK</span>
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#ec6437]">
                SERIES · {inspectedItem.code}
              </span>
              <button
                onClick={toggleAudio}
                className="text-yellow-400 hover:text-yellow-300 transition-transform active:scale-90 cursor-pointer"
                title="Toggle Ambient Audio"
              >
                <span className="inline-block text-2xl leading-none animate-[spin_8s_linear_infinite] select-none text-[#eab308]">
                  ✱
                </span>
              </button>
            </div>
          </div>

          {/* Inspect Body Content */}
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto">
            {/* Left: Showcase Hero Image */}
            <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl flex items-center justify-center min-h-[360px] max-h-[480px]">
              <img
                src={inspectedItem.image}
                alt={inspectedItem.categoryName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131215] via-transparent to-black/30" />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 border border-white/15 text-xs font-mono text-white uppercase tracking-wider">
                {inspectedItem.badgeTag}
              </span>
            </div>

            {/* Right: Technical Specifications & Actions */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#ec6437]">
                  VOLAMP INDUSTRIAL SPECIFICATION
                </span>
                <h2 className="text-3xl sm:text-5xl font-black text-[#ded6cb] uppercase tracking-tight mt-1 mb-2">
                  {inspectedItem.categoryName}
                </h2>
                <p className="text-sm sm:text-base text-[#b8b0a5] leading-relaxed">
                  {inspectedItem.headline}
                </p>
              </div>

              {/* Technical Specifications Table */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/5 text-xs font-mono">
                <div>
                  <span className="text-[#8d857b] block mb-1">VOLTAGE / CAPACITY</span>
                  <span className="text-white font-bold">{inspectedItem.voltageSpec}</span>
                </div>
                <div>
                  <span className="text-[#8d857b] block mb-1">CERTIFIED STANDARD</span>
                  <span className="text-white font-bold">{inspectedItem.standardSpec}</span>
                </div>
                <div>
                  <span className="text-[#8d857b] block mb-1">MATERIAL GRADE</span>
                  <span className="text-white font-bold">{inspectedItem.materialSpec}</span>
                </div>
                <div>
                  <span className="text-[#8d857b] block mb-1">DISPATCH READY</span>
                  <span className="text-[#ec6437] font-bold">
                    {inspectedItem.productCount.toLocaleString("en-IN")}+ SKUs
                  </span>
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <span className="text-[11px] font-mono text-[#8d857b] uppercase block mb-2">
                  SUBDIVISIONS & SYSTEMS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {inspectedItem.subcategories.map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => onNavigate(sub.slug)}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#ec6437] border border-white/10 hover:border-transparent text-xs text-[#ded6cb] hover:text-white transition-colors cursor-pointer"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate(inspectedItem.slug)}
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#ec6437] hover:bg-[#ff7d50] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open {inspectedItem.categoryName} Catalog</span>
                  <ArrowRight className="size-4" />
                </button>

                <button
                  onClick={() => {
                    if (onOpenShowroomLab) onOpenShowroomLab(inspectedItem.id);
                    else onOpenARModal(inspectedItem.categoryRef);
                  }}
                  className="py-3.5 px-5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="size-4 text-amber-400" />
                  <span>3D AR Twin</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. LUXURY SHOWROOM VIEW OVERLAY */}
      {viewMode === "showroom" && (
        <div className="absolute inset-0 z-30 bg-[#131215]/95 backdrop-blur-xl overflow-y-auto p-4 sm:p-10 pointer-events-auto">
          <div className="max-w-7xl mx-auto pt-16 pb-12">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-mono uppercase tracking-widest text-[#ec6437]">
                VOLAMP DIGITAL SPECIFICATION ROTUNDA
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#ded6cb] uppercase tracking-tight mt-1 mb-3">
                8 Master Industrial Categories
              </h2>
              <p className="text-xs sm:text-sm text-[#9d958b]">
                Select any series to inspect factory specifications, instant inventory, and certified industrial dispatches.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-[#1c1b1e] border border-[#2e2d31] hover:border-[#ec6437] rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group hover:-translate-y-1 shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden bg-black/40">
                    <img
                      src={cat.image}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1e] via-black/30 to-transparent" />
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/70 border border-white/15 text-[10px] font-mono text-[#ded6cb] uppercase">
                      SERIES {cat.code}
                    </span>
                    <span className="absolute bottom-3 left-3 text-lg font-bold text-white tracking-wide">
                      {cat.categoryName}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs text-[#b8b0a5] line-clamp-2 mb-3">
                      {cat.subheadline}
                    </p>

                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1.5 text-[11px] font-mono mb-4">
                      <div className="flex justify-between text-[#8d857b]">
                        <span>CAPACITY:</span>
                        <span className="text-[#ded6cb] font-semibold">{cat.voltageSpec}</span>
                      </div>
                      <div className="flex justify-between text-[#8d857b]">
                        <span>STANDARD:</span>
                        <span className="text-[#ded6cb] font-semibold">{cat.standardSpec}</span>
                      </div>
                      <div className="flex justify-between text-[#8d857b]">
                        <span>READY SKUs:</span>
                        <span className="text-[#ec6437] font-semibold">{cat.productCount.toLocaleString("en-IN")}+</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => onNavigate(cat.slug)}
                        className="flex-1 py-2.5 rounded-xl bg-[#ec6437] hover:bg-[#ff7d50] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Explore</span>
                        <ArrowRight className="size-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (onOpenShowroomLab) onOpenShowroomLab(cat.id);
                          else onOpenARModal(cat.categoryRef);
                        }}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-amber-400 transition-colors cursor-pointer"
                        title="3D Twin"
                      >
                        <Zap className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
