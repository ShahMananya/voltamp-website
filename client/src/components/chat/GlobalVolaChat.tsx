import React, { useState, useEffect } from "react";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { Sparkles, X } from "lucide-react";

export default function GlobalVolaChat() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("surface") === "chat";
    }
    return false;
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are VOLA, Senior Technical Advisor & Commercial Engineering Lead at VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad HQ). You have complete mastery of all 3,385+ products, 10 business segments, contractor discounts (40% OFF across catalog), 60-year 4-generation heritage, and nationwide dispatch.",
    },
    {
      role: "assistant",
      content:
        "⚡ **VOLA here — Senior Technical & Supply Desk Lead at Volamp Elektrikals.**\n\nI have complete access to all 3,385+ certified products across Wires & Cables, Switchgear, Lugs, Conduits, Glands, Earthing, and Solar, as well as live contractor discounts (40% OFF across our catalog) and our 10 business segments.\n\nAsk me for live factory prices, contractor discounts, cable sizing calculations, our 60-year story, or tell me what to dispatch to your site!",
    },
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages((current) => [...current, { role: "assistant", content: response }]);
    },
    onError: () => {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "Could not fetch that answer right now. Connect directly with our Ahmedabad supply desk on WhatsApp or call **+91 95123 65582** for immediate dispatch assistance.",
        },
      ]);
    },
  });

  const handleSend = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleToggle = () => setIsOpen((prev) => !prev);

    window.addEventListener("volamp:open-chat", handleOpen);
    window.addEventListener("volamp:toggle-chat", handleToggle);

    return () => {
      window.removeEventListener("volamp:open-chat", handleOpen);
      window.removeEventListener("volamp:toggle-chat", handleToggle);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="VOLAMP Technical Supply Desk Assistant"
      className="fixed right-4 sm:right-6 bottom-24 sm:bottom-26 z-50 w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-140px)] rounded-2xl border border-[#ebd7c7] dark:border-slate-800 bg-white dark:bg-[#0f172a] shadow-[0_20px_50px_rgba(16,42,64,0.24)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      {/* Chat Window Head */}
      <div className="bg-gradient-to-r from-[#4d1217] via-[#5c161d] to-[#6b2024] text-white px-4 py-3 flex items-center justify-between border-b border-[#822a31] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-[#f2b84b] uppercase">
                VOLAMP SUPPLY DESK
              </span>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <strong className="text-xs font-semibold text-white font-['Plus_Jakarta_Sans',sans-serif] block leading-tight">
              VOLA · Orders, Pricing & Engineering Lead
            </strong>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(false)}
          className="size-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close Vola chat"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-[#0f172a]">
        <AIChatBox
          messages={messages}
          onSendMessage={handleSend}
          isLoading={chatMutation.isPending}
          height="100%"
          className="rounded-none border-0 shadow-none h-full"
          placeholder="Ask about products, contractor discounts, sizing or say 'I want to order'..."
          suggestedPrompts={[
            "What contractor discounts do you offer?",
            "Show me 4 sqmm copper armoured cables with live price",
            "Explain your 10 business segments",
            "Tell me Volamp's 4-generation 60-year story",
            "Calculate cable size for 45 kW load",
            "I want to place an order for my site",
          ]}
        />
      </div>
    </aside>
  );
}
