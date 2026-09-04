import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  if (!toggleTheme) return null;

  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`} title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}><span className="theme-toggle-icon">{theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}</span><span className="theme-toggle-label">{theme === "light" ? "Dark" : "Light"}</span></button>;
}
