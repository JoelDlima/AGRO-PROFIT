import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import FloatingSettings from "@/components/FloatingSettings";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import PriceComparison from "./pages/PriceComparison";
import PriceTrends from "./pages/PriceTrends";
import Chatbot from "./pages/Chatbot";
import Profile from "./pages/Profile";
import Forum from "./pages/Forum";
import APITest from "./pages/APITest";
import ExportReport from "./pages/ExportReport";
import NotFound from "./pages/NotFound";
import CropHealth from "./pages/CropHealth";
import ScanHistory from "./pages/ScanHistory";
import Resources from "./pages/Resources";
import { backgroundSyncAllCrops } from "@/services/mandiCacheService";
import { crops } from "@/data/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { Capacitor } from "@capacitor/core";

// Lazy load StateMap to prevent Leaflet from causing issues
const StateMap = lazy(() => import("./pages/StateMap"));

const queryClient = new QueryClient();

// Use HashRouter for Capacitor (file:// protocol), BrowserRouter for web
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

const App = () => {
  // Background sync all crop prices on app mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Starting background price sync...');
        const cropNames = crops.map(c => c.name);
        // Run in background, don't block UI
        backgroundSyncAllCrops(cropNames).catch(err => 
          console.error('[App] Background sync error:', err)
        );
      } catch (error) {
        console.error('[App] Failed to initialize background sync:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
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
                <Route path="/api-test" element={<APITest />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <FloatingSettings />
            </Router>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
