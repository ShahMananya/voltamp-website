import React, { useState, useMemo } from "react";
import {
  Bot,
  Calculator,
  MessageSquare,
  Send,
  X,
  Sparkles,
  Zap,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AiElectricalViewerAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  activeModelName: string;
  activeModelSlug: string;
  onNavigateCategory: (slug: string) => void;
  onOpenARModal?: (item: any) => void;
}

export function AiElectricalViewerAssistant({
  isOpen,
  onClose,
  activeModelName,
  activeModelSlug,
  onNavigateCategory,
  onOpenARModal,
}: AiElectricalViewerAssistantProps) {
  const [activeTab, setActiveTab] = useState<"sizer" | "chat">("sizer");

  // --- SIZER INPUTS ---
  const [powerKw, setPowerKw] = useState<number>(55);
  const [powerUnit, setPowerUnit] = useState<"kW" | "HP">("kW");
  const [distanceMeters, setDistanceMeters] = useState<number>(80);
  const [voltage, setVoltage] = useState<number>(415);
  const [conductorMaterial, setConductorMaterial] = useState<"Al" | "Cu">("Al");
  const [copiedQuote, setCopiedQuote] = useState(false);

  // --- AI CHAT STATE ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `⚡ **VOLA AI Electrical Assistant connected to 3D CAD Engine.**\n\nI am currently analyzing: **${activeModelName}**.\n\nYou can ask me technical questions regarding:\n- Sizing cables, lugs, and glands for any motor or distribution board\n- Understanding certified standards (IS 7098, DIN 46235, BS 6121, IEC 60947)\n- Derating factors, voltage drop compliance, and short-circuit withstand\n\nOr switch to the **Live Cable Sizer** tab for instant engineering calculations!`,
    },
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Our central engineering desk is processing high volume right now. For emergency technical sizing or immediate dispatch from Ahmedabad HQ, call **+91 95123 65582** or reach us on WhatsApp.",
        },
      ]);
    },
  });

  const handleSendChat = (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    const newMsgs: Message[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(newMsgs);
    setChatInput("");

    chatMutation.mutate({
      messages: [
        {
          role: "system",
          content: `You are VOLA, Senior Electrical Engineering Lead at VOLAMP ELEKTRIKALS. You specialize in industrial cables (XLPE armoured, PVC flexible), pure copper lugs (DIN 46235), naval brass double-compression glands (BS 6121), MCCB switchgears, and IS/IEC standards. Currently, the user is inspecting the 3D model: "${activeModelName}". Provide crisp, accurate electrical engineering answers with component ratings, standards, and formula insights.`,
        },
        ...newMsgs.filter((m) => m.role !== "system"),
      ],
    });
  };

  // --- REAL-TIME ELECTRICAL SIZING ENGINE ---
  const sizingResult = useMemo(() => {
    const kw = powerUnit === "HP" ? powerKw * 0.7457 : powerKw;
    const pf = 0.85;
    const efficiency = 0.9;

    // Full Load Current
    const current =
      voltage === 415
        ? (kw * 1000) / (Math.sqrt(3) * 415 * pf * efficiency)
        : (kw * 1000) / (230 * pf * efficiency);

    // Aluminium Cable Table (IS 7098 Part 1 in Air/Tray at 40°C)
    const alCables = [
      { sqmm: 16, amp: 53, r: 2.45 },
      { sqmm: 25, amp: 70, r: 1.54 },
      { sqmm: 35, amp: 86, r: 1.11 },
      { sqmm: 50, amp: 110, r: 0.822 },
      { sqmm: 70, amp: 140, r: 0.568 },
      { sqmm: 95, amp: 175, r: 0.411 },
      { sqmm: 120, amp: 205, r: 0.325 },
      { sqmm: 150, amp: 235, r: 0.265 },
      { sqmm: 185, amp: 275, r: 0.211 },
      { sqmm: 240, amp: 330, r: 0.162 },
      { sqmm: 300, amp: 385, r: 0.13 },
      { sqmm: 400, amp: 450, r: 0.102 },
    ];

    // Copper Cable Table (IS 7098 Part 1 in Air/Tray at 40°C)
    const cuCables = [
      { sqmm: 6, amp: 42, r: 3.69 },
      { sqmm: 10, amp: 58, r: 2.23 },
      { sqmm: 16, amp: 76, r: 1.41 },
      { sqmm: 25, amp: 101, r: 0.87 },
      { sqmm: 35, amp: 125, r: 0.627 },
      { sqmm: 50, amp: 155, r: 0.463 },
      { sqmm: 70, amp: 200, r: 0.321 },
      { sqmm: 95, amp: 250, r: 0.232 },
      { sqmm: 120, amp: 295, r: 0.184 },
      { sqmm: 150, amp: 340, r: 0.15 },
      { sqmm: 185, amp: 395, r: 0.119 },
      { sqmm: 240, amp: 475, r: 0.091 },
    ];

    const table = conductorMaterial === "Al" ? alCables : cuCables;

    // Pick cable based on ampacity with safety margin
    let selected = table[table.length - 1];
    for (const item of table) {
      if (item.amp >= current * 1.15) {
        selected = item;
        break;
      }
    }

    // Voltage Drop: Vd = sqrt(3) * I * (L/1000) * (R * cos_phi + X * sin_phi)
    const x = 0.08; // Typical reactance in ohm/km
    const sinPhi = Math.sin(Math.acos(pf));
    const dropVolts =
      voltage === 415
        ? Math.sqrt(3) * current * (distanceMeters / 1000) * (selected.r * pf + x * sinPhi)
        : 2 * current * (distanceMeters / 1000) * (selected.r * pf + x * sinPhi);

    const dropPercent = (dropVolts / voltage) * 100;

    // Matching Hardware Mapping
    let lugSpec = "DIN 46235 M12 Pure Copper Heavy-Duty Tubular Lug";
    let glandSpec = "Double Compression Brass Gland CZ121 Size 04 (M32)";
    let mccbRating = "160A 36kA 3-Pole MCCB";
    let trayWidth = "150mm x 50mm Perforated GI Tray";

    if (selected.sqmm <= 25) {
      lugSpec = `DIN 46235 M8 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 01 (M20)";
      mccbRating = `${Math.ceil(current * 1.35 / 10) * 10 || 40}A 25kA MCCB`;
      trayWidth = "100mm x 50mm Perforated GI Tray";
    } else if (selected.sqmm <= 50) {
      lugSpec = `DIN 46235 M10 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 02 (M25)";
      mccbRating = `${Math.max(63, Math.ceil(current * 1.3 / 10) * 10)}A 25kA MCCB`;
      trayWidth = "150mm x 50mm Perforated GI Tray";
    } else if (selected.sqmm <= 95) {
      lugSpec = `DIN 46235 M12 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 04 (M32)";
      mccbRating = `${Math.max(125, Math.ceil(current * 1.25 / 10) * 10)}A 36kA MCCB`;
      trayWidth = "200mm x 50mm Perforated GI Tray";
    } else if (selected.sqmm <= 150) {
      lugSpec = `DIN 46235 M12 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 05 (M40)";
      mccbRating = "250A 36kA 3-Pole MCCB";
      trayWidth = "300mm x 50mm Perforated GI Tray";
    } else if (selected.sqmm <= 240) {
      lugSpec = `DIN 46235 M14 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 06 (M50)";
      mccbRating = "400A 36kA 3-Pole MCCB";
      trayWidth = "450mm x 50mm Perforated GI Tray";
    } else {
      lugSpec = `DIN 46235 M16 Pure Copper Lug (${selected.sqmm} sq.mm)`;
      glandSpec = "Double Compression Brass Gland Size 07 (M63)";
      mccbRating = "630A 50kA 3-Pole MCCB";
      trayWidth = "600mm x 50mm Perforated GI Tray";
    }

    return {
      current: current.toFixed(1),
      cableSize: `${conductorMaterial === "Al" ? "3.5C" : "4C"} x ${selected.sqmm} sq.mm ${
        conductorMaterial === "Al" ? "Aluminium" : "Copper"
      } XLPE Armoured Cable`,
      sqmm: selected.sqmm,
      dropPercent: dropPercent.toFixed(2),
      dropVolts: dropVolts.toFixed(1),
      isCompliant: dropPercent <= 3.0,
      lugSpec,
      glandSpec,
      mccbRating,
      trayWidth,
    };
  }, [powerKw, powerUnit, distanceMeters, voltage, conductorMaterial]);

  const handleCopyQuote = () => {
    const text = `VOLAMP SIZED ELECTRICAL PACKAGE
- Application Load: ${powerKw} ${powerUnit} (${sizingResult.current}A FLC @ ${voltage}V)
- Cable Run: ${distanceMeters} Meters
- Cable: ${sizingResult.cableSize} (Voltage Drop: ${sizingResult.dropPercent}% / ${sizingResult.dropVolts}V)
- Termination Lugs: ${sizingResult.lugSpec}
- Glands: ${sizingResult.glandSpec}
- Incomer Breaker: ${sizingResult.mccbRating}
- Cable Tray: ${sizingResult.trayWidth}
Standards: IS 7098 (Part 1) / DIN 46235 / BS 6121 / IS 1255
Ahmedabad Hub Ready Stock`;

    navigator.clipboard?.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl h-[92vh] max-h-[820px] bg-[#0c101a] border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/40 via-[#0e1422] to-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Bot className="size-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider uppercase text-white">
                  VOLA AI ELECTRICAL ASSISTANT
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE CAD DESK
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate max-w-[320px]">
                Active Context: {activeModelName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all cursor-pointer"
            title="Close Assistant"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex border-b border-white/10 bg-black/40 p-1.5 gap-1.5 font-mono text-xs">
          <button
            onClick={() => setActiveTab("sizer")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold cursor-pointer ${
              activeTab === "sizer"
                ? "bg-gradient-to-r from-[#ec6437] to-[#d94819] text-white shadow-lg shadow-[#ec6437]/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Calculator className="size-3.5" />
            <span>AI CABLE SIZER & HARDWARE</span>
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold cursor-pointer ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="size-3.5" />
            <span>AI TECHNICAL Q&A</span>
          </button>
        </div>

        {/* TAB 1: AI CABLE SIZER & HARDWARE SELECTOR */}
        {activeTab === "sizer" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs font-sans">
            {/* Quick Presets Bar */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Sparkles className="size-3 text-amber-400" />
                Select Standard Industrial Load:
              </span>
              <div className="flex items-center gap-1">
                {[15, 37, 55, 90, 160].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setPowerKw(kw)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      powerKw === kw
                        ? "bg-[#ec6437] text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {kw} kW
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/10">
              {/* Load Input */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium flex items-center justify-between">
                  <span>Connected Load</span>
                  <button
                    onClick={() => setPowerUnit(powerUnit === "kW" ? "HP" : "kW")}
                    className="text-[#ec6437] font-mono font-bold underline cursor-pointer"
                  >
                    Switch to {powerUnit === "kW" ? "HP" : "kW"}
                  </button>
                </label>
                <div className="flex items-center gap-2 bg-[#121826] px-3 py-2 rounded-xl border border-white/15">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={powerKw}
                    onChange={(e) => setPowerKw(Number(e.target.value) || 1)}
                    className="w-full bg-transparent font-bold font-mono text-white text-sm focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono font-bold">{powerUnit}</span>
                </div>
              </div>

              {/* Run Distance */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Run Distance (Meters)</label>
                <div className="flex items-center gap-2 bg-[#121826] px-3 py-2 rounded-xl border border-white/15">
                  <input
                    type="number"
                    min={5}
                    max={1000}
                    value={distanceMeters}
                    onChange={(e) => setDistanceMeters(Number(e.target.value) || 5)}
                    className="w-full bg-transparent font-bold font-mono text-white text-sm focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono font-bold">Mtrs</span>
                </div>
              </div>

              {/* Conductor Material */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">Conductor Material</label>
                <div className="grid grid-cols-2 gap-1 bg-[#121826] p-1 rounded-xl border border-white/15 text-[11px] font-mono">
                  <button
                    onClick={() => setConductorMaterial("Al")}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      conductorMaterial === "Al" ? "bg-blue-600 text-white" : "text-slate-400"
                    }`}
                  >
                    Aluminium
                  </button>
                  <button
                    onClick={() => setConductorMaterial("Cu")}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      conductorMaterial === "Cu" ? "bg-[#ec6437] text-white" : "text-slate-400"
                    }`}
                  >
                    Copper
                  </button>
                </div>
              </div>

              {/* Supply Voltage */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-medium">System Voltage</label>
                <div className="grid grid-cols-2 gap-1 bg-[#121826] p-1 rounded-xl border border-white/15 text-[11px] font-mono">
                  <button
                    onClick={() => setVoltage(415)}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      voltage === 415 ? "bg-amber-600 text-white" : "text-slate-400"
                    }`}
                  >
                    415V 3Ø
                  </button>
                  <button
                    onClick={() => setVoltage(230)}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      voltage === 230 ? "bg-amber-600 text-white" : "text-slate-400"
                    }`}
                  >
                    230V 1Ø
                  </button>
                </div>
              </div>
            </div>

            {/* AI SIZING CALCULATION RESULT CARD */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121a2c] via-[#0e1422] to-black border border-emerald-500/30 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                    AI SIZED SPECIFICATION (IS 7098 / IS 1255)
                  </span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">
                  FLC: <span className="text-white font-bold">{sizingResult.current} A</span>
                </span>
              </div>

              {/* Recommended Cable Card */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">RECOMMENDED MAIN CABLE</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      sizingResult.isCompliant
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {sizingResult.isCompliant ? (
                      <CheckCircle2 className="size-3" />
                    ) : (
                      <AlertTriangle className="size-3" />
                    )}
                    <span>{sizingResult.dropPercent}% DROP ({sizingResult.dropVolts}V)</span>
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white leading-snug">
                  {sizingResult.cableSize}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  Continuous rating with thermal-aging margin for cable tray installation.
                </p>
              </div>

              {/* Matching Hardware Package Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[10px]">CRIMP TERMINAL LUG:</span>
                  <span className="font-bold text-[#ec6437] block leading-tight">
                    {sizingResult.lugSpec}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[10px]">CABLE GLAND:</span>
                  <span className="font-bold text-amber-400 block leading-tight">
                    {sizingResult.glandSpec}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[10px]">INCOMER MCCB BREAKER:</span>
                  <span className="font-bold text-blue-400 block leading-tight">
                    {sizingResult.mccbRating}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[10px]">PERFORATED CABLE TRAY:</span>
                  <span className="font-bold text-slate-200 block leading-tight">
                    {sizingResult.trayWidth}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleCopyQuote}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  {copiedQuote ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  <span>{copiedQuote ? "COPIED TO CLIPBOARD" : "COPY SIZING SPEC SHEET"}</span>
                </button>
                <button
                  onClick={() => onNavigateCategory("wire-cables")}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>BROWSE INVENTORY</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI TECHNICAL CHAT */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-[#ec6437] text-white rounded-br-sm"
                        : "bg-black/60 border border-white/15 text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
                  <div className="size-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                    <Bot className="size-3.5 animate-pulse" />
                  </div>
                  <span>VOLA AI is computing electrical formulas...</span>
                </div>
              )}
            </div>

            {/* Quick Questions Chips */}
            <div className="px-4 py-2 border-t border-white/10 bg-black/30 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-mono">
              <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Ask:</span>
              {[
                "Why use double-compression glands?",
                "How to calculate cable derating in tray?",
                "Copper vs Aluminium cable comparison",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendChat(q)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white shrink-0 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 border-t border-white/15 bg-[#0a0e18] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder={`Ask VOLA about ${activeModelName} or cable calculations...`}
                className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={chatMutation.isPending || !chatInput.trim()}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
