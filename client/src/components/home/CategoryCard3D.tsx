import React, { useState, useRef } from "react";
import { ArrowRight, Box, Smartphone, Sparkles, Eye } from "lucide-react";
import { Category3DHologram } from "./Category3DHologram";

interface CategoryCard3DProps {
  cat: {
    name: string;
    slug: string;
    detail: string;
    image?: string;
    featuredPills: string[];
    productCount?: number;
  };
  global3DMode: boolean;
  onNavigate: (slug: string) => void;
  onOpenARModal: (cat: any) => void;
}

const CATEGORY_THEMES: Record<
  string,
  {
    gradient: string;
    glow: string;
    accent: string;
    border: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  "wire-cables": {
    gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
    glow: "rgba(14, 165, 233, 0.25)",
    accent: "#0ea5e9",
    border: "group-hover:border-sky-400",
    badgeBg: "bg-sky-500/10",
    badgeText: "text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  "switch-gears": {
    gradient: "from-amber-500/15 via-orange-500/5 to-transparent",
    glow: "rgba(245, 158, 11, 0.25)",
    accent: "#f59e0b",
    border: "group-hover:border-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  lugs: {
    gradient: "from-orange-500/15 via-red-500/5 to-transparent",
    glow: "rgba(234, 88, 12, 0.25)",
    accent: "#ea580c",
    border: "group-hover:border-orange-400",
    badgeBg: "bg-orange-500/10",
    badgeText: "text-orange-600 dark:text-orange-400 border-orange-500/20",
  },
  conduit: {
    gradient: "from-indigo-500/15 via-slate-500/5 to-transparent",
    glow: "rgba(99, 102, 241, 0.25)",
    accent: "#6366f1",
    border: "group-hover:border-indigo-400",
    badgeBg: "bg-indigo-500/10",
    badgeText: "text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  glands: {
    gradient: "from-yellow-500/15 via-amber-500/5 to-transparent",
    glow: "rgba(234, 179, 8, 0.25)",
    accent: "#eab308",
    border: "group-hover:border-yellow-400",
    badgeBg: "bg-yellow-500/10",
    badgeText: "text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  },
  "wiring-device": {
    gradient: "from-rose-500/15 via-red-500/5 to-transparent",
    glow: "rgba(244, 63, 94, 0.25)",
    accent: "#f43f5e",
    border: "group-hover:border-rose-400",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  "earthing-material": {
    gradient: "from-emerald-500/15 via-teal-500/5 to-transparent",
    glow: "rgba(16, 185, 129, 0.25)",
    accent: "#10b981",
    border: "group-hover:border-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  solar: {
    gradient: "from-blue-600/15 via-sky-500/5 to-transparent",
    glow: "rgba(37, 99, 235, 0.25)",
    accent: "#2563eb",
    border: "group-hover:border-blue-400",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
};

export function CategoryCard3D({
  cat,
  global3DMode,
  onNavigate,
  onOpenARModal,
}: CategoryCard3DProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const theme =
    CATEGORY_THEMES[cat.slug] || {
      gradient: "from-sky-500/15 via-blue-500/5 to-transparent",
      glow: "rgba(14, 165, 233, 0.25)",
      accent: "#0ea5e9",
      border: "group-hover:border-sky-400",
      badgeBg: "bg-sky-500/10",
      badgeText: "text-sky-600 dark:text-sky-400 border-sky-500/20",
    };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Normalized coordinates (-1 to 1)
    const normX = (x - 0.5) * 2;
    const normY = (y - 0.5) * 2;

    setMousePos({ x: normX, y: normY });
    // Subtle 3D Card Tilt
    setTilt({
      rotateX: -normY * 6,
      rotateY: normX * 6,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const show3D = global3DMode || isHovered;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onNavigate(cat.slug)}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-6px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="group relative flex flex-col bg-white dark:bg-[#0c1827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 text-left cursor-pointer shadow-xs hover:shadow-2xl transition-all duration-300 overflow-hidden select-none"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
      />

      {/* Futuristic Floating Holographic Chamber */}
      <div className="relative w-full h-38 sm:h-44 rounded-xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-[#08121f] border border-slate-200/70 dark:border-slate-800/60 flex items-center justify-center mb-3 group-hover:border-slate-300 dark:group-hover:border-slate-700 transition-all">
        {/* Ambient Radial Spotlight */}
        <div
          style={{
            background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)`,
          }}
          className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />

        {/* Cyber Hologram Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08] bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

        {/* 3D Hologram vs 2D Photo Display */}
        {show3D ? (
          <div className="absolute inset-0 animate-in fade-in duration-300">
            <Category3DHologram
              categoryName={cat.name}
              isHovered={isHovered}
              mousePos={mousePos}
              accentColor={theme.accent}
            />
          </div>
        ) : (
          <img
            src={cat.image || "/products/cables.jpg"}
            alt={cat.name}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/products/cables.jpg";
            }}
            className="max-h-28 sm:max-h-32 max-w-[85%] object-contain filter drop-shadow-md group-hover:scale-108 transition-transform duration-500 pointer-events-none"
          />
        )}

        {/* Top Badges: Hologram Active Indicator */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs flex items-center gap-1">
            <span
              style={{ backgroundColor: theme.accent }}
              className="size-1.5 rounded-full animate-pulse"
            />
            {show3D ? "3D HOLO" : "3D READY"}
          </span>
        </div>

        {/* "View in AR" Quick Launch Pill */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenARModal(cat);
          }}
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 dark:bg-slate-900/80 dark:hover:bg-sky-500 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/20 transition-all cursor-pointer opacity-90 group-hover:opacity-100 group-hover:scale-105 shadow-sm"
          title="Launch 3D & WebAR Inspection in Your Space"
        >
          <Smartphone className="size-3 text-sky-400 group-hover:text-white" />
          <span>Launch AR</span>
        </button>

        {/* Bottom Interactive Hover Prompt */}
        <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span>{show3D ? "Drag to Orbit 360°" : "Hover for 3D"}</span>
          <span className="font-bold text-sky-500">WebGL 3D</span>
        </div>
      </div>

      {/* Card Info & Typography */}
      <div className="space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <strong className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#1d73b7] dark:group-hover:text-sky-400 transition-colors tracking-tight">
              {cat.name}
            </strong>
            <div className="size-6 sm:size-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-[#1d73b7] group-hover:text-white dark:group-hover:bg-sky-500 transition-all shrink-0">
              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {cat.detail}
          </p>
        </div>

        {/* Feature Tag Pills */}
        <div className="flex flex-wrap gap-1 pt-1">
          {cat.featuredPills.slice(0, 3).map((pill) => (
            <span
              key={pill}
              className="px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200/50 dark:border-slate-700/50"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
