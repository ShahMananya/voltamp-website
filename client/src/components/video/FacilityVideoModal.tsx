import React, { useEffect, useRef, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, ShieldCheck, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacilityVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoSrc?: string;
  title?: string;
}

export default function FacilityVideoModal({
  isOpen,
  onClose,
  initialVideoSrc = "/videos/volamp-reel.mp4",
  title = "VOLAMP Central Fulfillment & Operations Hub",
}: FacilityVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<"standard" | "hd">(
    initialVideoSrc.includes("showcase-hq") ? "hd" : "standard"
  );

  const videoSources = {
    standard: "/videos/volamp-operations-hero.mp4",
    hd: "/videos/volamp-operations-hero.mp4",
  };

  const currentSrc = videoSources[selectedQuality];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Autoplay with audio may require mute initially
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
      setIsPlaying(true);
    }
  }, [isOpen, selectedQuality]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Verified Facility
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="size-3 text-amber-500 shrink-0" />
                <span>Aslali Central Logistics & Khadia HQ · Ahmedabad, Gujarat</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Resolution Selector Pill */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedQuality("standard")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedQuality === "standard"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Fast Stream (3MB)
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuality("hd")}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedQuality === "hd"
                    ? "bg-amber-500 text-slate-950 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Full HD (Original)
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close video player"
            >
              <X className="size-4.5" />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src={currentSrc}
            controls
            playsInline
            autoPlay
            loop
            muted={isMuted}
            className="w-full h-full object-contain max-h-[68vh]"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Quick Floating Play / Mute Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-10">
            <button
              type="button"
              onClick={togglePlay}
              className="text-white hover:text-amber-400 p-1 cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="text-white hover:text-amber-400 p-1 cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={handleFullscreen}
              className="text-white hover:text-amber-400 p-1 cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>

        {/* Footer Commercial Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-900 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Direct Factory Drum Unloading & Daily Dispatch</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/919512365582?text=Hello%20Volamp%20team,%20I%20just%20watched%20your%20depot%20video%20tour%20and%20would%20like%20to%20discuss%20our%20project%20cable%20requirements."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp Supply Desk</span>
            </a>
            <a
              href="tel:+919512365582"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-xs"
            >
              <Phone className="size-3.5" />
              <span>Call 9512365582</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
