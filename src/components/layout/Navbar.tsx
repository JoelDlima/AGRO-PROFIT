import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sprout, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTheme();

  const navLinks = [
    { href: "/dashboard", labelKey: "nav.dashboard" },
    { href: "/prices", labelKey: "nav.prices" },
    { href: "/crop-health", labelKey: "nav.cropHealth" },
    { href: "/trends", labelKey: "nav.trends" },
    { href: "/state-map", labelKey: "nav.priceMap" },
    { href: "/export", labelKey: "nav.export" },
    { href: "/forum", labelKey: "nav.community" },
    { href: "/chatbot", labelKey: "nav.aiHelp" },
    { href: "/resources", labelKey: "nav.resources" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isLanding = location.pathname === "/";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.png" 
              alt="AgroProfit" 
              className="h-10 w-10 rounded-xl transition-transform group-hover:scale-110"
            />
            <span className="text-xl font-bold text-foreground">
              Agro<span className="text-primary">Profit</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isLanding && !isAuthPage && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {!isLanding && !isAuthPage && (
              <Link to="/profile">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  {t("nav.profile")}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            {!isLanding && !isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && !isLanding && !isAuthPage && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {t("nav.profile")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
