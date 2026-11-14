import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function AppLayout({ children, showNavbar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main-content" onClick={(event) => { event.preventDefault(); document.getElementById("main-content")?.focus(); }} className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-background focus:p-3">
        Skip to content
      </a>
      {showNavbar && <Navbar />}
      <main id="main-content" tabIndex={-1}>{children}</main>
    </div>
  );
}
