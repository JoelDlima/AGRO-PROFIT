import { useState } from "react";
import { Settings, Moon, Sun, Languages, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const languages = [
  { code: "en" as const, name: "English", flag: "🇬🇧" },
  { code: "hi" as const, name: "हिंदी", flag: "🇮🇳" },
  { code: "mr" as const, name: "मराठी", flag: "🇮🇳" },
  { code: "kok" as const, name: "कोंकणी", flag: "🇮🇳" },
];

export default function FloatingSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const labelsByLanguage = {
    en: { settings: "Settings", close: "Close settings", theme: "Theme", light: "Light", dark: "Dark", language: "Language" },
    hi: { settings: "सेटिंग्स", close: "सेटिंग्स बंद करें", theme: "थीम", light: "लाइट", dark: "डार्क", language: "भाषा" },
    mr: { settings: "सेटिंग्ज", close: "सेटिंग्ज बंद करा", theme: "थीम", light: "लाइट", dark: "डार्क", language: "भाषा" },
    kok: { settings: "सेटिंग्स", close: "सेटिंग्स बंद करात", theme: "थीम", light: "लाइट", dark: "डार्क", language: "भास" },
  };
  const labels = labelsByLanguage[language] || labelsByLanguage.en;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50">
      {/* Settings Panel */}
      <div
        id="floating-settings"
        hidden={!isOpen}
        className={cn(
          "absolute bottom-16 right-0 max-h-[70vh] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-xl"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-foreground">{labels.settings}</span>
          <button type="button" aria-label={labels.close} onClick={() => setIsOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="mb-4">
          <span className="text-sm text-muted-foreground mb-2 block">{labels.theme}</span>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-400" />
              )}
              <span className="text-sm font-medium">{theme === "light" ? labels.light : labels.dark}</span>
            </span>
            <div
              className={cn(
                "w-10 h-6 rounded-full p-1 transition-colors",
                theme === "dark" ? "bg-primary" : "bg-border"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  theme === "dark" ? "translate-x-4" : "translate-x-0"
                )}
              />
            </div>
          </button>
        </div>

        {/* Language Selection */}
        <div>
          <span className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
            <Languages className="h-4 w-4" />
            {labels.language}
          </span>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                aria-pressed={language === lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "w-full min-h-11 flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
                  language === lang.code
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? labels.close : labels.settings}
        aria-expanded={isOpen}
        aria-controls="floating-settings"
        size="icon"
        className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
      </Button>
    </div>
  );
}
