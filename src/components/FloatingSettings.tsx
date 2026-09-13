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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Settings Panel */}
      <div
        className={cn(
          "absolute bottom-16 right-0 bg-card border border-border rounded-2xl shadow-2xl p-4 w-56 transition-all duration-300",
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-foreground">Settings</span>
          <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="mb-4">
          <span className="text-sm text-muted-foreground mb-2 block">Theme</span>
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
              <span className="text-sm font-medium">{theme === "light" ? "Light" : "Dark"}</span>
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
            Language
          </span>
          <div className="space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors",
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
        size="icon"
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isOpen ? "rotate-90 bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
      </Button>
    </div>
  );
}
