import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import LogisticsDashboardView from "./LogisticsDashboardView";

interface TrackOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialOrderId?: string;
}

export function TrackOrderModal({
  open,
  onOpenChange,
  initialOrderId = "ORD-IND-5412",
}: TrackOrderModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl xl:max-w-6xl w-full p-0 gap-0 rounded-2xl border-0 bg-transparent shadow-2xl overflow-y-auto max-h-[94vh]">
        <DialogTitle className="sr-only">Live Logistics & Consignment Tracking</DialogTitle>
        <div className="w-full overflow-hidden">
          <LogisticsDashboardView
            initialOrderId={initialOrderId}
            onClose={() => onOpenChange(false)}
            isModal={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
