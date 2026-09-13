import { ReactNode } from "react";
import { Navbar } from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function AppLayout({ children, showNavbar = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <main>{children}</main>
    </div>
  );
}
