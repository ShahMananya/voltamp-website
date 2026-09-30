import React from "react";

export interface EnquireSideTabProps {
  onOpen: () => void;
}

export default function EnquireSideTab({ onOpen }: EnquireSideTabProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Enquire Now - Quick Project Supply & RFQ"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-2.5 py-3.5 px-2 bg-gradient-to-b from-[#c56718] to-[#a84d0f] hover:from-[#d97706] hover:to-[#b45309] text-white shadow-[-4px_6px_20px_rgba(197,103,24,0.4)] rounded-l-xl transition-all duration-200 cursor-pointer group hover:-translate-x-1 select-none focus:outline-none focus:ring-2 focus:ring-[#c56718]/50 print:hidden"
      style={{
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2), -3px 0 12px rgba(197, 103, 24, 0.45)",
      }}
    >
      {/* Vertical Text: Enquire Now */}
      <span
        className="text-[12px] font-bold tracking-wide uppercase select-none text-white drop-shadow-xs"
        style={{
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        Enquire Now
      </span>

      {/* Speech Bubble / Enquiry Icon at Bottom */}
      <div className="w-5 h-5 rounded-full bg-white/20 group-hover:bg-white/30 flex items-center justify-center transition-colors shrink-0">
        <svg
          viewBox="0 0 24 24"
          className="w-3.5 h-3.5 fill-white"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.84 7.04-.15.93-.65 2.5-1.74 3.66 0 0 2.22-.18 4.2-1.42.54.14 1.11.22 1.7.22 5.52 0 10-4.03 10-9s-4.48-9-10-9zm-3 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
        </svg>
      </div>
    </button>
  );
}
