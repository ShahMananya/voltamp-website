import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  group: "india" | "international";
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  // Domestic & Indian Regional Languages
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧 / 🇮🇳", group: "india", region: "Global / Pan-India Commercial" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", group: "india", region: "North & Central India" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", group: "india", region: "Gujarat HQ · Ahmedabad" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", group: "india", region: "Maharashtra · Mumbai & Pune Hub" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", group: "india", region: "Tamil Nadu · Chennai Infra" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", group: "india", region: "Telangana & Andhra · Hyderabad" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", group: "india", region: "West Bengal · Kolkata Industrial" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", group: "india", region: "Karnataka · Bengaluru Tech Corridors" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", group: "india", region: "Kerala · Ports & Infrastructure" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", group: "india", region: "Punjab & Northern Agro-Industries" },

  // International Export Corridors
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", group: "international", region: "Middle East & GCC · UAE, Saudi, Qatar" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", group: "international", region: "Europe & Americas Commercial" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", group: "international", region: "Europe & Francophone Africa" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", group: "international", region: "DACH Region & European EPCs" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", group: "international", region: "Brazil & Latin American Infrastructure" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", group: "international", region: "Eurasia & CIS Industrial" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", group: "international", region: "East Asia & Singapore Trade Desk" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", group: "international", region: "Japan Industrial Standards" },
];

export interface LanguageContextType {
  currentLanguage: string;
  currentLanguageObj: LanguageOption;
  setLanguage: (langCode: string) => void;
  isLanguageModalOpen: boolean;
  setIsLanguageModalOpen: (open: boolean) => void;
  openLanguagePicker: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "volamp_preferred_language";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setGoogleTranslateCookie(langCode: string) {
  if (typeof document === "undefined") return;
  const domain = window.location.hostname;
  const isEn = langCode === "en";
  const cookieVal = isEn ? "" : `/en/${langCode}`;
  const expire = isEn ? "Thu, 01 Jan 1970 00:00:00 UTC" : "Fri, 31 Dec 9999 23:59:59 GMT";

  // Root path
  document.cookie = `googtrans=${cookieVal}; expires=${expire}; path=/;`;
  // Domain specific
  document.cookie = `googtrans=${cookieVal}; expires=${expire}; domain=${domain}; path=/;`;

  const hostParts = domain.split(".");
  if (hostParts.length > 2) {
    const rootDomain = hostParts.slice(-2).join(".");
    document.cookie = `googtrans=${cookieVal}; expires=${expire}; domain=.${rootDomain}; path=/;`;
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguageState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored;
      // Also inspect cookie
      const cookie = getCookie("googtrans");
      if (cookie) {
        const parts = cookie.split("/");
        const last = parts[parts.length - 1];
        if (last && SUPPORTED_LANGUAGES.some((l) => l.code === last)) {
          return last;
        }
      }
    }
    return "en";
  });

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const currentLanguageObj = useMemo(() => {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  }, [currentLanguage]);

  const setLanguage = (langCode: string) => {
    const target = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    if (!target) return;

    setCurrentLanguageState(langCode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, langCode);
      setGoogleTranslateCookie(langCode);

      // Attempt in-place select update first
      const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        toast.success(`Language set to ${target.name} (${target.nativeName})`, {
          description: "Whole website is now translated in real-time.",
        });
      } else {
        toast.success(`Switching language to ${target.name}...`, {
          description: "Translating entire website...",
        });
        setTimeout(() => {
          window.location.reload();
        }, 300);
      }
    }
  };

  const openLanguagePicker = () => {
    setIsLanguageModalOpen(true);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageObj,
        setLanguage,
        isLanguageModalOpen,
        setIsLanguageModalOpen,
        openLanguagePicker,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
