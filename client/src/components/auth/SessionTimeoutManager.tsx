import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Clock, ShieldAlert, LogOut, RefreshCw, AlertTriangle } from "lucide-react";

// Inactivity configuration: 30 minutes max inactivity, 2 minutes warning countdown
export const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes = 1,800,000 ms
export const WARNING_DURATION_MS = 2 * 60 * 1000;    // 2 minutes = 120,000 ms
export const LAST_ACTIVITY_KEY = "volamp_session_last_activity_ts";
const THROTTLE_MS = 3000; // Throttle user interaction updates to every 3 seconds

export function SessionTimeoutManager() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(120);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const lastThrottleRef = useRef<number>(0);

  // Helper to record activity timestamp in both memory and localStorage (synced across tabs)
  const recordActivity = useCallback(() => {
    const now = Date.now();
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    } catch {}
    setShowWarningModal(false);
  }, []);

  // Reset session timer (called when clicking "Stay Signed In" or on user actions)
  const handleExtendSession = () => {
    recordActivity();
    toast.success("Session Extended", {
      description: "Your session has been refreshed for another 30 minutes of activity.",
    });
  };

  // Immediate logout from warning modal
  const handleSignOutNow = async () => {
    setShowWarningModal(false);
    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      sessionStorage.removeItem("volamp_sales_team_session_active");
    } catch {}
    await logout();
    toast.info("Signed Out", {
      description: "You have signed out successfully.",
    });
  };

  // Main inactivity tracking effect
  useEffect(() => {
    if (!user) {
      setShowWarningModal(false);
      try {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      } catch {}
      return;
    }

    // Initialize timestamp if missing
    let currentStored = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!currentStored) {
      recordActivity();
    }

    // Throttled event handler for user interactions
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottleRef.current > THROTTLE_MS) {
        lastThrottleRef.current = now;
        try {
          localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
        } catch {}
      }
    };

    // Listen to user activity across window
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    events.forEach((ev) => window.addEventListener(ev, handleUserInteraction, { passive: true }));

    // Cross-tab synchronization via storage event
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        // Another tab reported activity - reset warning modal if open
        setShowWarningModal(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Heartbeat check every 1 second
    const interval = setInterval(() => {
      const storedTs = localStorage.getItem(LAST_ACTIVITY_KEY);
      const lastActive = storedTs ? parseInt(storedTs, 10) : Date.now();
      const now = Date.now();
      const elapsed = now - lastActive;
      const remainingMs = INACTIVITY_TIMEOUT_MS - elapsed;

      if (remainingMs <= 0) {
        // Session expired: Perform automatic logout
        setShowWarningModal(false);
        try {
          localStorage.removeItem(LAST_ACTIVITY_KEY);
          sessionStorage.removeItem("volamp_sales_team_session_active");
        } catch {}
        
        logout().catch(() => {});
        
        toast.warning("Session Expired", {
          description: "You were signed out due to 30 minutes of inactivity for your security.",
          duration: 7000,
        });

        // If on a protected portal, redirect to homepage and trigger login modal
        const currentPath = window.location.pathname;
        if (currentPath.includes("portal")) {
          setLocation("/");
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("volamp:open-auth", { detail: { accountType: "customer" } }));
          }, 400);
        }
      } else if (remainingMs <= WARNING_DURATION_MS) {
        // Within the 2-minute warning window: show modal countdown
        setShowWarningModal(true);
        setSecondsRemaining(Math.max(1, Math.ceil(remainingMs / 1000)));
      } else {
        setShowWarningModal(false);
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserInteraction));
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user, logout, recordActivity, setLocation]);

  if (!user || !showWarningModal) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const progressPercent = Math.max(0, Math.min(100, (secondsRemaining / 120) * 100));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inactivity-warning-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#180608] rounded-2xl border-2 border-[#c56718]/40 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#c56718]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header with warning icon and title */}
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Clock className="size-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 id="inactivity-warning-title" className="font-extrabold text-lg text-[#4d1217] dark:text-white">
                Inactivity Warning
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                30 Min Limit
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Account: <span className="font-semibold text-stone-700 dark:text-stone-200">{user.email}</span>
            </p>
          </div>
        </div>

        {/* Main Countdown Display */}
        <div className="p-4 rounded-xl bg-[#faf5ef] dark:bg-[#200a0d] border border-[#ebd7c7] dark:border-[#3a1014] text-center space-y-2">
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            You have been inactive for nearly 30 minutes. To protect your commercial quotes, orders, and security, your session will automatically end in:
          </p>
          <div className="text-3xl font-black font-mono tracking-wider text-[#c56718] dark:text-amber-400 py-1">
            {formattedCountdown}
          </div>
          {/* Progress bar */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-[#c56718] h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-400">
            Clicking anywhere or selecting "Stay Signed In" will reset your 30-minute session.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleExtendSession}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#c56718] to-[#994d12] hover:from-[#b45309] hover:to-[#7c3d0e] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 group"
          >
            <RefreshCw className="size-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span>Stay Signed In (Extend 30m)</span>
          </button>
          <button
            type="button"
            onClick={handleSignOutNow}
            className="py-3 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
