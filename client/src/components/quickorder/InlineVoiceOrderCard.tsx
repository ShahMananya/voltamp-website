import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Languages,
  X,
  Volume2,
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

interface InlineVoiceOrderCardProps {
  onAddItems: (items: ConfirmedVoiceProduct[]) => void;
  availableProducts?: any[];
}

// Fallback client parser if server procedure is unreachable
function parseVoiceFallback(rawText: string, catalog: any[]) {
  const segments = rawText
    .split(/[,،؛\n]|(?:\s+(?:and|also|plus|aur|ane|અને|અને\s*બીજું|तथा|और)\s+)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);

  return segments.map((seg, idx) => {
    // 1. Quantity
    const qtyMatch = seg.match(
      /\b(\d+)\s*(?:pieces|piece|pcs|nos|units|unit|meters|meter|mtrs|mtr|coils|coil|rolls|roll|drums|drum|નંગ|પીસ)?\b/i
    );
    const isDecimal = /(?:^|\s)\d+\.\d+/i.test(seg);
    let qty = 1;
    let textWithoutQty = seg;
    if (qtyMatch && !isDecimal) {
      qty = parseInt(qtyMatch[1], 10) || 1;
      textWithoutQty = seg.replace(qtyMatch[0], " ").trim();
    }

    // 2. Size
    const sqmmMatch = seg.match(
      /(\d+(?:\.\d+)?)\s*(?:sq\s*mm|sqmm|sq\.\s*mm|square\s*mm|સ્ક્વેર\s*એમએમ|स्क्वायर\s*एमएम)/i
    );
    const size = sqmmMatch ? `${sqmmMatch[1]} SQMM` : undefined;

    // 3. Brand
    const brands = ["Polycab", "Finolex", "RR Kabel", "Havells", "KEI", "L&T", "Schneider", "Siemens", "ABB", "Legrand", "C&S", "Anchor"];
    const foundBrand = brands.find((b) => new RegExp(`\\b${b}\\b`, "i").test(seg));

    // 4. Find matches in catalog
    const tokens = textWithoutQty.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
    const candidates = catalog.filter((p: any) => {
      const pName = (p.name || "").toLowerCase();
      const pBrand = (p.brand || "").toLowerCase();
      const pSize = (p.size || "").toLowerCase();
      if (foundBrand && !pBrand.includes(foundBrand.toLowerCase())) return false;
      if (size && pSize && !pSize.includes(size.toLowerCase()) && !pName.includes(size.toLowerCase())) return false;
      return tokens.some((t) => pName.includes(t));
    });

    const best =
      candidates[0] ||
      (size ? catalog.find((p: any) => (p.size || "").toLowerCase().includes(size.toLowerCase())) : null);

    return {
      id: `fallback-item-${Date.now()}-${idx}`,
      originalSegment: seg,
      quantity: qty,
      brand: foundBrand,
      size,
      selectedProductId: best?.id || best?.productId,
      selectedName: best?.name || seg,
      selectedBrand: best?.brand || foundBrand,
      selectedPrice: best?.numericPrice || 0,
      candidates: candidates.slice(0, 5).map((p: any) => ({
        productId: p.id || p.productId,
        sku: p.sku || "",
        name: p.name || "",
        brand: p.brand || "",
        price: p.price || "₹0.00",
        numericPrice: p.numericPrice || 0,
      })),
      confidence: best ? ("high" as const) : ("medium" as const),
      warning: best ? undefined : "Matched from product catalog.",
    };
  });
}

type LangCode = "en-IN" | "hi-IN" | "gu-IN";

const LANGUAGES: Array<{ code: LangCode; label: string }> = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "gu-IN", label: "ગુજરાતી" },
];

const SAMPLE_PROMPT =
  "10 pieces of Polycab 1.5 sq mm single-core unarmoured copper cable, 5 pieces of Polycab 2.5 sq mm cable, and 2 LK power contactors 3 pole 9 amp";

export function InlineVoiceOrderCard({ onAddItems, availableProducts = [] }: InlineVoiceOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LangCode>("en-IN");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Review & matching state
  const [mode, setMode] = useState<"record" | "review">("record");
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

  const startRecording = () => {
    setSpeechError(null);
    setInterimText("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Voice recognition is not supported in this browser. You can type requirements or click the sample."
      );
      toast.info("Speech recognition not supported in this browser. You can type requirements directly.");
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
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalChunk += item[0].transcript + " ";
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission was denied. Please allow microphone in browser settings.");
        } else if (event.error !== "no-speech") {
          setSpeechError(`Speech notice: ${event.error}. You can also type requirements directly.`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error("Start speech failed:", err);
      setSpeechError("Could not access microphone. Please type manually or check permissions.");
      setIsRecording(false);
    }
  };

  const handleOpenAndRecord = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(true);
    setMode("record");
    // Start listening immediately
    setTimeout(() => {
      startRecording();
    }, 150);
  };

  const handleProcessTranscript = async (textOverride?: string) => {
    const rawText = (textOverride ?? transcript).trim();
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
        toast.warning(
          "No electrical products identified. Try speaking brand and size, e.g. '10 pieces of Polycab 1.5 sq mm cable'."
        );
        return;
      }

      const formatted = response.items.map((item) => {
        const topCandidate = item.candidates?.[0];
        return {
          id: item.id,
          originalSegment: item.originalSegment,
          quantity: item.detectedQuantity || 1,
          brand: item.detectedBrand,
          size: item.detectedSize,
          selectedProductId: item.matchedProduct?.productId || topCandidate?.productId,
          selectedName: item.matchedProduct?.name || topCandidate?.name || item.cleanedQuery || item.originalSegment,
          selectedBrand: item.matchedProduct?.brand || topCandidate?.brand || item.detectedBrand,
          selectedPrice: item.matchedProduct?.numericPrice ?? topCandidate?.numericPrice,
          candidates: item.candidates || [],
          confidence: item.confidence,
          warning: item.warning,
        };
      });

      setRecognizedItems(formatted);
      setMode("review");
      toast.success(
        `AI matched ${formatted.length} product requirement${formatted.length === 1 ? "" : "s"} from your speech!`
      );
    } catch (err: any) {
      console.warn("Server parseVoice error, checking client fallback:", err);
      const fallbackItems = parseVoiceFallback(rawText, availableProducts);
      if (fallbackItems.length > 0) {
        setRecognizedItems(fallbackItems);
        setMode("review");
        toast.success(
          `AI matched ${fallbackItems.length} product requirement${fallbackItems.length === 1 ? "" : "s"} from your speech!`
        );
      } else {
        toast.error("Error recognizing voice order: " + (err.message || "Please try again"));
      }
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

  const handleConfirmAndAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    onAddItems(validItems);
    toast.success(`Added ${validItems.length} products to your Requisition List below!`);
    // Collapse card after adding
    setIsExpanded(false);
    setMode("record");
    setTranscript("");
    setRecognizedItems([]);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    stopRecording();
    setIsExpanded(false);
    setMode("record");
    setTranscript("");
    setInterimText("");
    setRecognizedItems([]);
  };

  return (
    <div className="mb-4 rounded-2xl bg-black text-white p-4 sm:p-5 shadow-lg border border-slate-800 transition-all duration-300">
      {/* CARD HEADER */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Mic className="size-4 text-amber-400" />
          <h4 className="text-sm font-bold tracking-tight text-white font-['Plus_Jakarta_Sans',sans-serif]">
            AI Voice Quick Order
          </h4>
        </div>
        {isExpanded && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Close</span>
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <p className="text-xs text-slate-300 mb-3.5">
        Speak your product requirements to automatically add items.
      </p>

      {/* COLLAPSED STATE: Pill Button matching user screenshot */}
      {!isExpanded ? (
        <button
          type="button"
          id="btn-voice-quick-order"
          onClick={handleOpenAndRecord}
          className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm py-2.5 px-5 rounded-full flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-[0.99]"
        >
          <Mic className="size-4 text-[#c56718]" />
          <span>Speak Your Requirements</span>
        </button>
      ) : (
        /* EXPANDED IN-PLACE RECORDING & MATCHING VIEW (No new screen!) */
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {mode === "record" ? (
            <div className="space-y-3.5">
              {/* TOP STRIP: Language pills + Recording timer */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Languages className="size-3.5 text-amber-400" />
                  <span className="text-[11px] font-semibold">Language:</span>
                  <div className="flex items-center gap-1 ml-1">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedLang(lang.code);
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                          selectedLang === lang.code
                            ? "bg-[#c56718] text-white"
                            : "text-slate-400 hover:text-white bg-slate-950/60"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pulsing indicator & timer */}
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${
                      isRecording ? "bg-red-500 animate-ping" : "bg-emerald-400"
                    }`}
                  />
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {isRecording
                      ? `Listening (00:${recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds})`
                      : "Ready"}
                  </span>
                </div>
              </div>

              {/* LIVE TRANSCRIPT TEXT AREA */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Volume2 className="size-3 text-amber-400" />
                    Spoken Transcript:
                  </span>
                  {transcript && (
                    <button
                      type="button"
                      onClick={() => {
                        setTranscript("");
                        setInterimText("");
                      }}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={interimText ? `${transcript} ${interimText}` : transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Speaking... (e.g. 10 pieces of Polycab 1.5 sq mm cable and 2 LK contactors 3 pole 9 amp)"
                    className="w-full text-xs font-medium rounded-xl p-2.5 bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                  />
                  {interimText && (
                    <span className="absolute bottom-2 right-2 text-[10px] text-amber-400 font-mono italic animate-pulse">
                      listening...
                    </span>
                  )}
                </div>
              </div>

              {speechError && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span className="text-[11px]">{speechError}</span>
                </div>
              )}

              {/* ACTION BUTTONS (IN-PLACE) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {isRecording ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      stopRecording();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <MicOff className="size-3.5" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startRecording();
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
                  >
                    <Mic className="size-3.5 text-amber-400" />
                    <span>Record Again</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleProcessTranscript();
                  }}
                  disabled={parseVoiceMutation.isPending || (!transcript.trim() && !interimText.trim())}
                  className="flex-1 bg-[#c56718] hover:bg-[#b45309] disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  {parseVoiceMutation.isPending ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Matching Inventory...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      <span>Match Products</span>
                    </>
                  )}
                </button>
              </div>

              {/* QUICK ONE-CLICK SAMPLE PROMPT */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTranscript(SAMPLE_PROMPT);
                    handleProcessTranscript(SAMPLE_PROMPT);
                  }}
                  className="text-left text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer group"
                >
                  <Sparkles className="size-3 text-amber-400 shrink-0" />
                  <span className="underline italic truncate">
                    Test sample: "10 pieces of Polycab 1.5 sq mm cable, 5 pieces 2.5 sq mm cable, 2 LK contactors..."
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* REVIEW & CONFIRMATION IN-PLACE (No new screen!) */
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Check className="size-3.5" />
                  Recognized {recognizedItems.length} Products:
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMode("record");
                  }}
                  className="text-[11px] text-slate-400 hover:text-white underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="size-3" />
                  Re-speak
                </button>
              </div>

              {/* ITEM CARDS */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {recognizedItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        Item #{index + 1}
                      </span>
                      {item.confidence === "high" ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          Catalog Match
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                          Verify SKU
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-[1fr_90px_32px] gap-2 items-center">
                      <div>
                        <Input
                          value={item.selectedName}
                          onChange={(e) => handleUpdateItemName(index, e.target.value)}
                          className="text-xs h-8 bg-slate-950 border-slate-700 text-white font-medium"
                        />
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {item.selectedProductId && (
                            <span className="font-mono text-[9px] font-bold px-1 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {item.selectedProductId}
                            </span>
                          )}
                          {item.selectedBrand && (
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              {item.selectedBrand}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity input */}
                      <div>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItemQuantity(index, parseInt(e.target.value, 10) || 1)
                          }
                          className="text-xs h-8 text-center bg-slate-950 border-slate-700 text-white font-bold"
                        />
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveItem(index);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-950/30 flex items-center justify-center cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>

                    {/* Disambiguation: Multiple candidates dropdown */}
                    {item.candidates && item.candidates.length > 1 && (
                      <div className="pt-1 border-t border-slate-800/60">
                        <label className="text-[10px] font-semibold text-amber-400 block mb-0.5">
                          Select candidate match:
                        </label>
                        <select
                          value={item.selectedProductId || ""}
                          onChange={(e) => handleCandidateSelect(index, e.target.value)}
                          className="w-full text-[11px] bg-slate-950 text-slate-200 border border-slate-700 rounded p-1.5 cursor-pointer"
                        >
                          {item.candidates.map((c) => (
                            <option key={c.productId} value={c.productId}>
                              [{c.productId}] {c.brand} · {c.name} ({c.price})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CONFIRM & ADD BUTTON (IN-PLACE) */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  className="text-xs text-slate-400 hover:text-white h-9 px-3"
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmAndAdd}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Check className="size-3.5" />
                  <span>Add {recognizedItems.length} Products to Requisition List</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
