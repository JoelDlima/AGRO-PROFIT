import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Language, translations } from "@/lib/translations";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("agroprofit-theme");
    return (saved as Theme) || "dark";
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("agroprofit-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("agroprofit-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("agroprofit-language", language);
    console.log("Language changed to:", language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setLanguage = (lang: Language) => {
    console.log("setLanguage called with:", lang);
    localStorage.setItem("agroprofit-language", lang);
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}