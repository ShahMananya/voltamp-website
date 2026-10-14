import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Plus,
  Trash2,
  ArrowRight,
  Check,
  Languages,
  X,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export interface ConfirmedVoiceProduct {
  id: string;
  productId?: string;
  name: string;
  brand?: string;
  specification?: string;
  unitPrice?: number;
  quantity: number;
}

interface VoiceOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAddItems: (items: ConfirmedVoiceProduct[]) => void;
}

type LanguageOption = {
  code: "en-IN" | "hi-IN" | "gu-IN";
  label: string;
  nativeLabel: string;
};

const LANGUAGES: LanguageOption[] = [
  { code: "en-IN", label: "English", nativeLabel: "English (India)" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिन्दी (Hindi)" },
  { code: "gu-IN", label: "Gujarati", nativeLabel: "ગુજરાતી (Gujarati)" },
];

const SAMPLE_PROMPTS = [
  "10 pieces of Polycab 1.5 sq mm single-core unarmoured copper cable, 5 pieces of Polycab 2.5 sq mm cable, and 2 LK power contactors 3 pole 9 amp",
  "50 meters of Finolex 4 sq mm 3 core armoured copper cable and 4 Schneider 32A MCB",
  "100 meters 16 sq mm 4 core aluminium cable and 10 brass cable glands",
];

export function VoiceOrderDialog({
  isOpen,
  onClose,
  onConfirmAddItems,
}: VoiceOrderDialogProps) {
  const [selectedLang, setSelectedLang] = useState<"en-IN" | "hi-IN" | "gu-IN">("en-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Review & matching state
  const [step, setStep] = useState<"record" | "review">("record");
  const [recognizedItems, setRecognizedItems] = useState<
    Array<{
      id: string;
      originalSegment: string;
      quantity: number;
      brand?: string;
      size?: string;
      selectedProductId?: string;
      selectedName: string;
      selectedBrand?: string;
      selectedPrice?: number;
      candidates: Array<{
        productId: string;
        sku: string;
        name: string;
        brand: string;
        price: string;
        numericPrice: number;
      }>;
      confidence: "high" | "medium" | "low" | "none";
      warning?: string;
    }>
  >([]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const parseVoiceMutation = trpc.quickOrder.parseVoice.useMutation();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setStep("record");
      setTranscript("");
      setInterimText("");
      setSpeechError(null);
      setRecordingSeconds(0);
      setIsRecording(false);
    } else {
      stopRecording();
    }
  }, [isOpen]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    setSpeechError(null);
    setInterimText("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Web Speech API is not supported in this browser. You can type or paste your product requirements below."
      );
      toast.error("Browser speech recognition not available. Please type your requirements.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening... Speak your electrical requirements clearly.", { duration: 2500 });
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscriptChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscriptChunk += item[0].transcript + " ";
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalTranscriptChunk) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalTranscriptChunk.trim()}` : finalTranscriptChunk.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission was denied. Please allow microphone access in your browser settings.");
        } else if (event.error === "no-speech") {
          // No speech detected yet, continue listening
        } else {
          setSpeechError(`Speech recognition message: ${event.error}. You can also type requirements directly.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      setSpeechError("Could not access microphone. Please check permissions or type manually.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore if already stopped
      }
      recognitionRef.current = null;
    }
    setIsRecording(false);
    if (interimText) {
      setTranscript((prev) => (prev ? `${prev.trim()} ${interimText.trim()}` : interimText.trim()));
      setInterimText("");
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Process transcript with AI matching backend
  const handleProcessTranscript = async (textToProcess?: string) => {
    const rawText = (textToProcess ?? transcript).trim();
    if (!rawText) {
      toast.error("Please speak or enter your product requirements first.");
      return;
    }

    stopRecording();

    try {
      const response = await parseVoiceMutation.mutateAsync({
        transcript: rawText,
        language: selectedLang,
      });

      if (!response.items || response.items.length === 0) {
        toast.warning("No electrical products could be identified. Try speaking brand and sizes, e.g. '10 pieces of Polycab 1.5 sq mm cable'.");
        return;
      }

      const formatted = response.items.map((item) => ({
        id: item.id,
        originalSegment: item.originalSegment,
        quantity: item.detectedQuantity || 1,
        brand: item.detectedBrand,
        size: item.detectedSize,
        selectedProductId: item.matchedProduct?.productId,
        selectedName: item.matchedProduct?.name || item.cleanedQuery || item.originalSegment,
        selectedBrand: item.matchedProduct?.brand || item.detectedBrand,
        selectedPrice: item.matchedProduct?.numericPrice,
        candidates: item.candidates || [],
        confidence: item.confidence,
        warning: item.warning,
      }));

      setRecognizedItems(formatted);
      setStep("review");
      toast.success(`Recognized ${formatted.length} product requirement${formatted.length === 1 ? "" : "s"}!`);
    } catch (err: any) {
      toast.error("Error recognizing voice order: " + (err.message || "Please try again"));
    }
  };

  const handleCandidateSelect = (index: number, productId: string) => {
    setRecognizedItems((prev) => {
      const updated = [...prev];
      const item = updated[index];
      const match = item.candidates.find((c) => c.productId === productId);
      if (match) {
        item.selectedProductId = match.productId;
        item.selectedName = match.name;
        item.selectedBrand = match.brand;
        item.selectedPrice = match.numericPrice;
        item.confidence = "high";
        item.warning = undefined;
      }
      return updated;
    });
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    setRecognizedItems((prev) => {
      const updated = [...prev];
      updated[index].quantity = Math.max(1, newQty);
      return updated;
    });
  };

  const handleUpdateItemName = (index: number, newName: string) => {
    setRecognizedItems((prev) => {
      const updated = [...prev];
      updated[index].selectedName = newName;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setRecognizedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddNewItem = () => {
    setRecognizedItems((prev) => [
      ...prev,
      {
        id: `manual-item-${Date.now()}`,
        originalSegment: "Manual Spoken Item",
        quantity: 1,
        selectedName: "",
        candidates: [],
        confidence: "medium",
      },
    ]);
  };

  const handleConfirmAndAdd = () => {
    const validItems: ConfirmedVoiceProduct[] = recognizedItems
      .filter((item) => item.selectedName.trim().length > 0 && item.quantity >= 1)
      .map((item) => ({
        id: `row-voice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: item.selectedProductId,
        name: item.selectedName.trim(),
        brand: item.selectedBrand,
        unitPrice: item.selectedPrice,
        quantity: item.quantity,
      }));

    if (validItems.length === 0) {
      toast.error("Please ensure at least one product has a name and quantity.");
      return;
    }

    onConfirmAddItems(validItems);
    toast.success(`Successfully added ${validItems.length} products to Requisition List!`);
    onClose();
  };

  if (!isOpen) return null;

  const dialogContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0b1320] text-slate-100 border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0f172a]/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#c56718] to-amber-600 text-white shadow-md">
              <Mic className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  AI Voice Quick Order
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                  Live Recognition
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Speak your electrical product requirements to automatically identify & match catalog SKUs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === "record" ? (
            <div className="space-y-5">
              {/* LANGUAGE PICKER BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Languages className="size-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Speech Language:</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        selectedLang === lang.code
                          ? "bg-[#c56718] text-white shadow-sm"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      {lang.nativeLabel}
                    </button>
                  ))}
                </div>
              </div>

              {/* PULSING RECORDING STUDIO */}
              <div className="flex flex-col items-center justify-center py-7 px-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div
                  className={`absolute w-48 h-48 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
                    isRecording ? "bg-amber-500/25 opacity-100" : "bg-blue-600/10 opacity-40"
                  }`}
                />

                {/* Animated Mic Button */}
                <div className="relative mb-4">
                  {isRecording && (
                    <>
                      <span className="absolute -inset-3 rounded-full bg-amber-500/20 animate-ping" />
                      <span className="absolute -inset-6 rounded-full bg-amber-500/10 animate-pulse" />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleToggleRecording}
                    className={`relative size-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white scale-105 shadow-red-500/30"
                        : "bg-gradient-to-tr from-[#c56718] to-amber-500 hover:from-[#b45309] hover:to-amber-600 text-white shadow-amber-500/25 hover:scale-105 active:scale-95"
                    }`}
                  >
                    {isRecording ? <MicOff className="size-8 animate-pulse" /> : <Mic className="size-8" />}
                  </button>
                </div>

                {/* Recording Status & Waves */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <span
                      className={`size-2.5 rounded-full ${
                        isRecording ? "bg-red-500 animate-ping" : "bg-emerald-500"
                      }`}
                    />
                    <h4 className="text-sm font-bold text-white">
                      {isRecording ? "Listening to your voice..." : "Click microphone to start speaking"}
                    </h4>
                  </div>
                  {isRecording && (
                    <p className="text-xs font-mono text-amber-400">
                      Recording: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </p>
                  )}
                </div>

                {/* Sound wave visualizer bars when recording */}
                {isRecording && (
                  <div className="flex items-center gap-1.5 mt-4 h-6">
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse h-4" />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse h-6 delay-75" />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse h-3 delay-150" />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse h-5 delay-100" />
                    <span className="w-1 bg-amber-400 rounded-full animate-pulse h-2" />
                  </div>
                )}
              </div>

              {/* TRANSCRIPT TEXT AREA */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Volume2 className="size-3.5 text-amber-400" />
                    Live Spoken Transcript / Text Requirements:
                  </label>
                  {transcript && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranscript("");
                        setInterimText("");
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={interimText ? `${transcript} ${interimText}` : transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="E.g. I need 10 pieces of Polycab 1.5 sq mm single-core unarmoured copper cable, 5 pieces of Polycab 2.5 sq mm cable, and 2 LK power contactors 3 pole 9 amp..."
                    className="w-full text-xs font-medium rounded-xl p-3 bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                  />
                  {interimText && (
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-amber-400 font-mono italic animate-pulse">
                      typing speech...
                    </span>
                  )}
                </div>
              </div>

              {speechError && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Microphone Notice:</span>
                    <span>{speechError}</span>
                  </div>
                </div>
              )}

              {/* EXAMPLE PROMPTS */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Examples (Click to test):
                </span>
                <div className="space-y-1.5">
                  {SAMPLE_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(prompt);
                        handleProcessTranscript(prompt);
                      }}
                      className="w-full text-left text-[11px] text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 p-2.5 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate pr-2 italic">"{prompt}"</span>
                      <ArrowRight className="size-3 text-slate-500 group-hover:text-amber-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: VERIFICATION & SELECTION TABLE */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                  <span>
                    AI matched <strong>{recognizedItems.length}</strong> items against the live 3,385+ product catalog.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("record")}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  Re-speak
                </button>
              </div>

              {/* RECOGNIZED PRODUCT CARDS */}
              <div className="space-y-3">
                {recognizedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm"
                  >
                    {/* Upper row: Spoken requirement & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                          Item #{index + 1}
                        </span>
                        <span className="text-[11px] text-slate-400 italic truncate max-w-xs">
                          Spoken: "{item.originalSegment}"
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.confidence === "high" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="size-2.5" /> Exact Match
                          </span>
                        ) : item.confidence === "medium" ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertCircle className="size-2.5" /> Choose SKU
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                            <HelpCircle className="size-2.5" /> Manual Entry
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle row: Catalog Product & Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px_40px] gap-2.5 items-center">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Product Name & Catalog SKU
                        </label>
                        <Input
                          value={item.selectedName}
                          onChange={(e) => handleUpdateItemName(index, e.target.value)}
                          placeholder="Product Name"
                          className="text-xs h-9 bg-slate-950 border-slate-700 text-white font-medium"
                        />
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {item.selectedProductId && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {item.selectedProductId}
                            </span>
                          )}
                          {item.selectedBrand && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              {item.selectedBrand}
                            </span>
                          )}
                          {item.selectedPrice && item.selectedPrice > 0 ? (
                            <span className="text-[10px] text-slate-400 font-medium ml-auto">
                              ₹{item.selectedPrice.toLocaleString("en-IN")}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Quantity stepper */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Quantity
                        </label>
                        <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 overflow-hidden h-9">
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, item.quantity - 1)}
                            className="px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors h-full flex items-center justify-center font-bold text-sm cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(index, parseInt(e.target.value, 10) || 1)}
                            className="w-full text-center text-xs font-bold bg-transparent text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(index, item.quantity + 1)}
                            className="px-2.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors h-full flex items-center justify-center font-bold text-sm cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove item button */}
                      <div className="flex items-center justify-end sm:justify-center pt-4 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Remove this item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Disambiguation: If multiple candidates matched, show selector */}
                    {item.candidates && item.candidates.length > 1 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <label className="text-[10px] font-bold text-amber-400 block mb-1 flex items-center gap-1">
                          <AlertCircle className="size-3" />
                          Multiple products matched - Select correct catalog item:
                        </label>
                        <select
                          value={item.selectedProductId || ""}
                          onChange={(e) => handleCandidateSelect(index, e.target.value)}
                          className="w-full text-xs bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          {item.candidates.map((cand) => (
                            <option key={cand.productId} value={cand.productId}>
                              [{cand.productId}] {cand.brand} - {cand.name} ({cand.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add another item manually button */}
              <button
                type="button"
                onClick={handleAddNewItem}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>+ Add Another Product</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between gap-3">
          {step === "record" ? (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleProcessTranscript()}
                disabled={parseVoiceMutation.isPending || (!transcript.trim() && !interimText.trim())}
                className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold h-9 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {parseVoiceMutation.isPending ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Matching Products...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>Process & Match Products</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep("record")}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Speech
              </Button>
              <Button
                type="button"
                onClick={handleConfirmAndAdd}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                <Check className="size-4" />
                <span>Add {recognizedItems.length} Products to Quick Order</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(dialogContent, document.body);
  }

  return dialogContent;
}
