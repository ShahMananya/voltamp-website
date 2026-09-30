import React from "react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import LogisticsDashboardView from "@/components/track/LogisticsDashboardView";

export default function TrackPage() {
  // Parse order ID from URL query if present (e.g. /track?id=639081 or /track?id=ORD-IND-5412)
  const initialParam =
    new URLSearchParams(window.location.search).get("id") ||
    new URLSearchParams(window.location.search).get("order") ||
    "";

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] flex flex-col font-sans">
      {/* Universal Clean Header */}
      <UniversalHeader currentPage="track" />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col overflow-hidden p-2 sm:p-4 lg:p-6 pb-6">
        <div className="flex-1 w-full h-full min-h-[720px]">
          <LogisticsDashboardView initialOrderId={initialParam} isModal={false} />
        </div>
      </main>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
