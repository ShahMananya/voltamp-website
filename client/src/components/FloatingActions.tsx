import React, { useState } from "react";

export interface FloatingActionsProps {
  onOpenChat: () => void;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export default function FloatingActions({
  onOpenChat,
  whatsappNumber = "919512365582",
  whatsappMessage = "Hello Volamp, I would like to enquire about electrical supply and quotations.",
}: FloatingActionsProps) {
  const [hoveredButton, setHoveredButton] = useState<"whatsapp" | "chat" | null>(null);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <aside
      aria-label="Quick contact and chat options"
      className="fixed right-5 bottom-6 z-50 flex flex-col items-center gap-3.5 select-none print:hidden pointer-events-auto"
    >
      {/* 1. WhatsApp Circular Floating Button (Top) */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip on Hover */}
        <div
          role="tooltip"
          className={`absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0b1f33] text-white text-xs font-semibold whitespace-nowrap shadow-lg transition-all duration-200 pointer-events-none ${
            hoveredButton === "whatsapp"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          <span>Chat on WhatsApp</span>
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0b1f33]" />
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with Volamp on WhatsApp (+91 95123 65582)"
          onMouseEnter={() => setHoveredButton("whatsapp")}
          onMouseLeave={() => setHoveredButton(null)}
          className="group relative flex items-center justify-center w-12 h-12 md:w-[50px] md:h-[50px] rounded-full bg-[#25D366] text-white shadow-[0_4px_16px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_24px_rgba(37,211,102,0.65)] hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#25D366]/40"
        >
          {/* Subtle Ping Animation Ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 group-hover:animate-ping pointer-events-none" />

          {/* Official WhatsApp Icon */}
          <svg
            viewBox="0 0 32 32"
            className="w-7 h-7 fill-white drop-shadow-xs relative z-10"
            aria-hidden="true"
          >
            <path d="M16 2a13.9 13.9 0 0 0-11.9 21.2L2 30l7-1.8A13.9 13.9 0 1 0 16 2zm0 25.5c-2.3 0-4.5-.6-6.4-1.7l-.5-.3-4.7 1.2 1.3-4.6-.3-.5A11.5 11.5 0 1 1 16 27.5zm6.3-8.6c-.3-.2-2-.1-2.3-.1-.3 0-.6.1-.8.4-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.7.1-.4-.2-1.6-.6-3-1.9-1.1-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.1-.8.1-.2.3-.4.5-.6.2-.2.3-.4.4-.6.1-.2.1-.4 0-.6-.1-.2-.8-2-1.1-2.7-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .4-.4.4-1.4 1.4-1.4 3.4 0 2 1.5 4 1.7 4.3.2.3 2.9 4.4 7 6.2 1 .4 1.8.7 2.4.9 1 .3 1.9.3 2.6.2.8-.1 2.5-1 2.8-2 .4-.9.4-1.8.3-2 0-.2-.2-.3-.5-.5z" />
          </svg>
        </a>
      </div>

      {/* 2. Blue Circular Chat Button (Bottom) */}
      <div className="relative flex items-center justify-end">
        {/* Tooltip on Hover */}
        <div
          role="tooltip"
          className={`absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[#0b1f33] text-white text-xs font-semibold whitespace-nowrap shadow-lg transition-all duration-200 pointer-events-none ${
            hoveredButton === "chat"
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-2 pointer-events-none"
          }`}
        >
          <span>Ask Vola AI</span>
          <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-[#0b1f33]" />
        </div>

        <button
          type="button"
          onClick={onOpenChat}
          aria-label="Ask Vola AI · Instant Help & Quotations"
          onMouseEnter={() => setHoveredButton("chat")}
          onMouseLeave={() => setHoveredButton(null)}
          className="group relative flex items-center justify-center w-12 h-12 md:w-[50px] md:h-[50px] rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-[0_4px_16px_rgba(37,99,235,0.45)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.65)] hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-3 focus:ring-[#2563EB]/40 border-none"
        >
          {/* Exact Speech Bubble Icon with 3 Dots from Reference Picture */}
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-white drop-shadow-xs relative z-10"
            fill="none"
            aria-hidden="true"
          >
            {/* Outlined Speech Bubble with Pointer at Bottom-Left */}
            <path
              d="M20 3.5H4C2.9 3.5 2 4.4 2 5.5v9c0 1.1.9 2 2 2h2v4l4.5-4H20c1.1 0 2-.9 2-2v-9c0-1.1-.9-2-2-2z"
              stroke="white"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Three Centered Dots */}
            <circle cx="8" cy="10" r="1.15" fill="white" />
            <circle cx="12" cy="10" r="1.15" fill="white" />
            <circle cx="16" cy="10" r="1.15" fill="white" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
