import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

export function Navbar() {
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
    { href: "/profile", labelKey: "nav.profile" },
  ];
  const showLinks = !["/", "/login", "/signup"].includes(location.pathname);

  return (
    <nav className="market-nav sticky top-0 z-40 w-full pt-[env(safe-area-inset-top)]">
      <div className="container mx-auto px-4">
        <div className="flex min-h-16 items-center">
          <Link to="/" className="flex min-h-11 items-center gap-3 rounded-md">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              Agro<span className="text-primary">Profit</span>
            </span>
          </Link>
        </div>
        {showLinks && (
          <div className="market-nav-rail" aria-label="Navigation">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn("market-nav-link", active && "market-nav-link-active")}
                >
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
