import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import FloatingSettings from "@/components/FloatingSettings";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { Capacitor } from "@capacitor/core";

// Lazy load StateMap to prevent Leaflet from causing issues
const StateMap = lazy(() => import("./pages/StateMap"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PriceComparison = lazy(() => import("./pages/PriceComparison"));
const Profile = lazy(() => import("./pages/Profile"));
const Forum = lazy(() => import("./pages/Forum"));
const ScanHistory = lazy(() => import("./pages/ScanHistory"));
const PriceTrends = lazy(() => import("./pages/PriceTrends"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const ExportReport = lazy(() => import("./pages/ExportReport"));
const CropHealth = lazy(() => import("./pages/CropHealth"));
const Resources = lazy(() => import("./pages/Resources"));

const queryClient = new QueryClient();

// Use HashRouter for Capacitor (file:// protocol), BrowserRouter for web
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Suspense fallback={<div role="status" className="container mx-auto px-4 py-12">Loading page…</div>}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/prices" element={<PriceComparison />} />
                <Route path="/trends" element={<PriceTrends />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/crop-health" element={<CropHealth />} />
                <Route path="/scan-history" element={<ScanHistory />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/state-map" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-screen"><Skeleton className="h-96 w-full max-w-4xl" /></div>}>
                    <StateMap />
                  </Suspense>
                } />
                <Route path="/export" element={<ExportReport />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <FloatingSettings />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
