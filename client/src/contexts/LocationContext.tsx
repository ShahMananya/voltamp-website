import React, { createContext, useContext, useEffect, useState } from "react";

export const DEFAULT_LOCATION = "Ahmedabad · Gujarat · India";

export interface LocationContextType {
  location: string;
  country: string;
  setLocation: (newLocation: string) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  welcomeLocation: string | null;
  setWelcomeLocation: (loc: string | null) => void;
  openLocationPicker: () => void;
  isDetecting: boolean;
  autoDetectLocation: () => Promise<string>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = "volamp_user_location";
const SESSION_WELCOME_KEY = "volamp_welcome_dismissed";

export function formatLocationName(
  city?: string,
  subdivision?: string,
  country?: string,
  countryCode?: string
): string {
  if (!city && !country) return DEFAULT_LOCATION;
  const safeCity = city || subdivision || "Your City";
  const isIndia = countryCode === "IN" || country?.toLowerCase().includes("india");

  if (isIndia) {
    return subdivision && subdivision !== safeCity
      ? `${safeCity} · ${subdivision} · India`
      : `${safeCity} · India`;
  }

  let countryClean = country || "Global";
  const codeUpper = countryCode?.toUpperCase();
  if (codeUpper === "US" || countryClean.includes("United States")) countryClean = "USA";
  else if (codeUpper === "GB" || countryClean.includes("United Kingdom")) countryClean = "UK";
  else if (codeUpper === "AE" || countryClean.includes("United Arab Emirates")) countryClean = "UAE";

  if (subdivision && subdivision !== safeCity && !subdivision.includes(countryClean)) {
    return `${safeCity} · ${subdivision} · ${countryClean}`;
  }
  return `${safeCity} · ${countryClean}`;
}

export function extractCountryFromLocation(loc: string): string {
  if (!loc || !loc.trim()) return "India";
  const lower = loc.toLowerCase();
  if (
    lower.includes("india") ||
    lower.includes("gujarat") ||
    lower.includes("maharashtra") ||
    lower.includes("delhi") ||
    lower.includes("karnataka") ||
    lower.includes("tamil nadu") ||
    lower.includes("telangana") ||
    lower.includes("west bengal") ||
    lower.includes("rajasthan") ||
    lower.includes("madhya pradesh") ||
    lower.includes("punjab") ||
    lower.includes("haryana")
  ) {
    return "India";
  }
  if (lower.includes("usa") || lower.includes("united states") || lower.includes("america")) return "USA";
  if (lower.includes("uae") || lower.includes("emirates") || lower.includes("dubai") || lower.includes("abu dhabi")) return "UAE";
  if (lower.includes("uk") || lower.includes("united kingdom") || lower.includes("england") || lower.includes("britain")) return "UK";
  if (lower.includes("germany") || lower.includes("frankfurt") || lower.includes("berlin")) return "Germany";
  if (lower.includes("canada") || lower.includes("toronto")) return "Canada";
  if (lower.includes("australia") || lower.includes("sydney") || lower.includes("melbourne")) return "Australia";
  if (lower.includes("singapore")) return "Singapore";
  if (lower.includes("saudi") || lower.includes("riyadh")) return "Saudi Arabia";
  if (lower.includes("qatar") || lower.includes("doha")) return "Qatar";
  if (lower.includes("japan") || lower.includes("tokyo")) return "Japan";
  if (lower.includes("france") || lower.includes("paris")) return "France";
  if (lower.includes("brazil") || lower.includes("são paulo") || lower.includes("sao paulo")) return "Brazil";
  if (lower.includes("kenya") || lower.includes("nairobi")) return "Kenya";
  if (lower.includes("south africa") || lower.includes("johannesburg")) return "South Africa";

  const segments = loc.split(/[·,.]/).map((s) => s.trim()).filter(Boolean);
  if (segments.length > 1) {
    return segments[segments.length - 1];
  }
  return segments[0] || "Global";
}

export async function detectVisitorLocation(): Promise<string> {
  // Strategy 1: BigDataCloud Reverse Geocode Client (fast IP-based, no API key needed, CORS enabled)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(
      "https://api.bigdatacloud.net/data/reverse-geocode-client",
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality;
      const subdivision = data.principalSubdivision;
      const country = data.countryName;
      const code = data.countryCode;
      if (city || subdivision || country) {
        return formatLocationName(city, subdivision, country, code);
      }
    }
  } catch {
    // Strategy 1 failed, fall through to Strategy 2
  }

  // Strategy 2: ipwho.is (fast global IP geolocation fallback)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch("https://ipwho.is/", { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success !== false && (data.city || data.country)) {
        return formatLocationName(data.city, data.region, data.country, data.country_code);
      }
    }
  } catch {
    // Strategy 2 failed
  }

  return DEFAULT_LOCATION;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) return stored.trim();
    }
    return DEFAULT_LOCATION;
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [welcomeLocation, setWelcomeLocation] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);

  const setLocation = (newLocation: string) => {
    const cleaned = newLocation.trim() || DEFAULT_LOCATION;
    setLocationState(cleaned);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, cleaned);
    }
  };

  const openLocationPicker = () => {
    setIsLocationModalOpen(true);
  };

  const autoDetectLocation = async (): Promise<string> => {
    setIsDetecting(true);
    try {
      const detected = await detectVisitorLocation();
      setLocation(detected);
      return detected;
    } finally {
      setIsDetecting(false);
    }
  };

  // Automatically fetch location on website entry
  useEffect(() => {
    let isMounted = true;

    // Check if welcome was already dismissed in this browser session
    const isDismissed = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_WELCOME_KEY) : null;

    detectVisitorLocation()
      .then((detected) => {
        if (!isMounted) return;
        setIsDetecting(false);
        if (detected) {
          setLocation(detected);
          // Automatically show celebration welcome popup on entry if not dismissed in this session
          if (!isDismissed) {
            setTimeout(() => {
              if (isMounted) {
                setWelcomeLocation(detected);
              }
            }, 350);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsDetecting(false);
        console.warn("Auto location detection fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSetWelcomeLocation = (loc: string | null) => {
    setWelcomeLocation(loc);
    if (!loc && typeof window !== "undefined") {
      // Mark as dismissed for current session when closed
      sessionStorage.setItem(SESSION_WELCOME_KEY, "true");
    }
  };

  const country = React.useMemo(() => extractCountryFromLocation(location), [location]);

  return (
    <LocationContext.Provider
      value={{
        location,
        country,
        setLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        welcomeLocation,
        setWelcomeLocation: handleSetWelcomeLocation,
        openLocationPicker,
        isDetecting,
        autoDetectLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useUserLocation must be used within a LocationProvider");
  }
  return context;
}
