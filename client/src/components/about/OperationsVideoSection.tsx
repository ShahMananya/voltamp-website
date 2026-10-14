import React, { useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, ShieldCheck, Truck, Warehouse, CheckCircle2, MapPin, Sparkles, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OperationsVideoSectionProps {
  onOpenModalTour?: () => void;
}

export default function OperationsVideoSection({ onOpenModalTour }: OperationsVideoSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [quality, setQuality] = useState<"standard" | "hd">("standard");

  const videoSrc = quality === "standard" ? "/videos/volamp-reel.mp4" : "/videos/volamp-showcase-hq.mp4";

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
    <section id="operations" className="about-section about-operations py-16 bg-slate-950 text-white relative overflow-hidden border-y border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="about-container relative z-10">
        <div className="about-section-heading mb-10">
          <div>
            <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-block mb-3">
              02 · PHYSICAL INFRASTRUCTURE & DISPATCH
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Inside Volamp's Central
              <br />
              <em className="text-amber-400 not-italic font-['Instrument_Serif',serif] text-3xl sm:text-4xl md:text-5xl">
                Fulfillment & Logistics Hub.
              </em>
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mt-3 leading-relaxed">
              Step inside our Aslali mega-depot and Khadia corporate operations. Watch how master cable drums are received directly from primary manufacturers, verified for 100% conductor purity, cut to precise project lengths, and loaded onto heavy freight fleets for pan-India site delivery.
            </p>
          </div>
        </div>

        {/* 2-Column Theater Display: Video Left, Operational Pillars Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Video Viewport (Col 1-7) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl group">
              <div className="relative aspect-video w-full">
                <video
                  ref={videoRef}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-300">
                    <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live Operations Video</span>
                  </div>

                  <div className="pointer-events-auto flex items-center p-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setQuality("standard")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        quality === "standard" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Fast (3MB)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuality("hd")}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                        quality === "hd" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      HD
                    </button>
                  </div>
                </div>

                {/* Bottom Video Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="hover:text-amber-400 transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                      <span className="hidden sm:inline">{isMuted ? "Muted" : "Audio On"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenModalTour && (
                      <button
                        type="button"
                        onClick={onOpenModalTour}
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors cursor-pointer"
                      >
                        Cinema Mode ↗
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleFullscreen}
                      className="hover:text-amber-400 transition-colors cursor-pointer p-0.5"
                      title="Fullscreen"
                    >
                      <Maximize2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Pillars & Metrics (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Warehouse className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Central Mega-Fulfillment Hub</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    Over 100,000 sq. ft. of heavy cable drum holding facilities in Aslali, Ahmedabad, ready to service large-scale industrial orders without lead-time bottlenecks.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 transition-colors shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Pre-Dispatch MTC & Testing</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    Every consignment is accompanied by verified Material Test Certificates (MTC), conductor resistance reports, and tamper-evident drum sealing.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="size-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Truck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">12–48 Hour Pan-India Corridors</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-snug">
                    Dedicated daily freight logistics reaching project sites across Gujarat, Maharashtra, Rajasthan, MP, and all 28 states with live GPS dispatch tracking.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/919512365582?text=Hello%20Volamp%20team,%20I%20would%20like%20to%20schedule%20a%20technical%20depot%20visit%20at%20your%20Ahmedabad%20warehouse."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
              >
                <MessageCircle className="size-4" />
                <span>Schedule Depot Visit</span>
              </a>

              <a
                href="tel:+919512365582"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition-all border border-slate-700"
              >
                <Phone className="size-3.5" />
                <span>Call Supply Desk</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
