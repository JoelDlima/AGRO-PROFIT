import { Link, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  MessageCircle, 
  BarChart3,
  Plus,
  ArrowRight,
  IndianRupee,
  Sparkles,
  Cloud,
  Droplets,
  Wind,
  AlertCircle,
  Navigation2,
  Map,
  Download
} from "lucide-react";
import { crops, markets } from "@/data/mockData";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTheme } from "@/hooks/useTheme";
import { useTransformedMarkets } from "@/hooks/useMandiPrices";
import { useQuery } from "@tanstack/react-query";
import { getCurrentWeather } from "@/services/weatherService";
import { PriceCalculator } from "@/components/PriceCalculator";
import { RainfallWidget } from "@/components/RainfallWidget";
import { useLocation } from "@/hooks/useLocation";
import { geocodeIndianLocation, calculateDistance, formatDistance } from "@/services/locationService";
import { useState } from "react";
import { getStateTranslation, getDistrictTranslation, translateMarketName } from "@/lib/locationTranslations";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { t, language } = useTheme();
  const { location: userLocation, requestLocation, loading: locationLoading } = useLocation();
  
  // State for selected crop in Top Markets
  const [selectedMarketCrop, setSelectedMarketCrop] = useState<string>("");

  // Get translated crop name
  const getCropName = (crop: any) => {
    if (language === 'hi') return crop.nameHi || crop.name;
    if (language === 'mr') return crop.nameMr || crop.name;
    if (language === 'kok') return crop.nameKok || crop.name;
    return crop.name;
  };

  // Get user's crops from profile
  const userCropNames = profile?.crops || [];
  const userCrops = userCropNames.map((cropName) => {
    const crop = crops.find((c) => c.name.toLowerCase() === cropName.toLowerCase());
    return crop ? { cropName, crop } : null;
  }).filter(Boolean);

  // Fetch real mandi prices for selected crop in Top Markets, fallback to first user crop or Wheat
  const firstCrop = userCropNames[0] || "Wheat";
  const activeCropForMarkets = selectedMarketCrop || firstCrop;
  
  // Fetch from all states (don't filter by state to get maximum results)
  const { markets: realMarkets, isLoading: marketsLoading, error: marketsError } = useTransformedMarkets(!authLoading && !user ? "" : activeCropForMarkets);
  
  const hasRealData = !marketsLoading && realMarkets && realMarkets.length > 0;
  
  // Show markets if we have real data, otherwise fallback to reference markets
  const rawMarkets = hasRealData ? realMarkets : markets;

  // Calculate distance from user's current GPS location
  const marketsWithDistance = rawMarkets.map((m) => {
    let distance: number | null = null;
    if (userLocation) {
      const marketCoords = geocodeIndianLocation(
        m.name,
        m.district,
        m.state
      );
      if (marketCoords) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          marketCoords.latitude,
          marketCoords.longitude
        );
      }
    }
    return { ...m, distance };
  });

  // If user location is active, sort by nearest distance first! Otherwise sort by highest price
  const displayMarkets = userLocation
    ? [...marketsWithDistance].sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return b.price - a.price;
      })
    : [...marketsWithDistance].sort((a, b) => b.price - a.price);

  const topMarkets = displayMarkets.slice(0, 3);

  const isLoading = authLoading || profileLoading;
  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Farmer';
  
  // Dynamic location names based on current GPS location
  const detectedLocationName = userLocation?.displayName || userLocation?.city;
  const currentDisplayLocation = detectedLocationName || profile?.state || 'India';
  const effectiveState = userLocation?.state || profile?.state || 'India';
  const displayState = effectiveState;

  // Fetch weather data for user's location (using GPS lat/lon if enabled)
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', effectiveState, userLocation?.latitude, userLocation?.longitude],
    queryFn: () => getCurrentWeather(effectiveState, userLocation?.latitude, userLocation?.longitude),
    staleTime: 1000 * 60 * 15, // 15 minutes
    enabled: authLoading || !!user,
  });

  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {t("dashboard.welcome")}, {displayName}! 🙏
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-foreground">{currentDisplayLocation}</span>
                {userLocation && (
                  <span className="text-[11px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    ● GPS Active
                  </span>
                )}
              </p>
            </>
          )}
        </div>

        {/* Weather Widget */}
        {!weatherLoading && !weatherData && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Weather data unavailable for {currentDisplayLocation}.</AlertDescription>
          </Alert>
        )}
        {weatherData && !weatherLoading && (
          <Card className="mb-6 animate-slide-up border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{t("weather.conditions")}</CardTitle>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {currentDisplayLocation}
                  </span>
                  {!userLocation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={requestLocation}
                      disabled={locationLoading}
                      className="text-xs"
                    >
                      <Navigation2 className="h-3 w-3 mr-1" />
                      {locationLoading ? t("weather.getting") : t("weather.enableLocation")}
                    </Button>
                  )}
                  {userLocation && (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                      <Navigation2 className="h-3 w-3" />
                      {t("weather.locationEnabled")}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <span className="text-2xl">🌡️</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{weatherData.temp}°C</p>
                    <p className="text-xs text-muted-foreground">{t("weather.temperature")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{weatherData.humidity}%</p>
                    <p className="text-xs text-muted-foreground">{t("weather.humidity")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Wind className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{weatherData.wind_speed}</p>
                    <p className="text-xs text-muted-foreground">{t("weather.wind")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center">
                    <Cloud className="h-6 w-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{weatherData.description}</p>
                    <p className="text-xs text-muted-foreground">{t("weather.condition")}</p>
                  </div>
                </div>
              </div>
              
              {weatherData.humidity > 80 && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    {t("weather.highHumidity")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Crops Section */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{t("dashboard.myCrops")}</CardTitle>
                <CardDescription>
                  {userCrops.length} {t("dashboard.yourCrops") || "crops monitored"}
                </CardDescription>
              </div>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t("dashboard.add")}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {userCrops.map((item: any) => (
                    <div
                      key={item.cropName}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                        activeCropForMarkets.toLowerCase() === item.cropName.toLowerCase()
                          ? 'bg-primary/15 border border-primary/30'
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => setSelectedMarketCrop(item.cropName)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.crop.icon}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{getCropName(item.crop)}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.crop.unit}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-primary hover:underline">
                        {activeCropForMarkets.toLowerCase() === item.cropName.toLowerCase() ? 'Selected' : 'View Mandis'}
                      </span>
                    </div>
                  ))}
                  {userCrops.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>{t("dashboard.noCrops")}</p>
                      <Link to="/profile">
                        <Button variant="outline" className="mt-2">
                          {t("dashboard.addFirstCrop")}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Markets */}
          <Card className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">Market prices</CardTitle>
                <CardDescription>
                  {activeCropForMarkets}
                  {userLocation && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      Sorted by estimated distance when available; otherwise by price.
                    </span>
                  )}
                  {!userLocation && <span className="ml-2">Sorted by price.</span>}
                  {marketsLoading && (
                    <span className="ml-2 text-xs text-muted-foreground">⟳ Loading...</span>
                  )}
                </CardDescription>
                
                {/* Crop Selector */}
                {userCropNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {userCropNames.map((cropName) => (
                      <Button
                        key={cropName}
                        variant={activeCropForMarkets === cropName ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMarketCrop(cropName)}
                        className="text-xs h-7"
                      >
                        {getCropName(crops.find(c => c.name.toLowerCase() === cropName.toLowerCase()) || { name: cropName, nameHi: cropName })}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/prices">
                <Button variant="ghost" size="sm">
                  {t("dashboard.viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {marketsLoading ? (
                <div className="space-y-3">
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                      Loading mandi price records...
                    </AlertDescription>
                  </Alert>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : marketsError ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm font-medium">Market data temporarily unavailable</p>
                  <p className="text-xs mt-1">Please try again later.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : topMarkets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No market data available for {activeCropForMarkets}</p>
                  <p className="text-xs mt-2">Try checking other crops in Price Comparison</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hasRealData ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Prices may be cached or outdated. Verify with the market before making decisions.</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Sample prices only, not current market prices or specific to the selected crop.</AlertDescription>
                    </Alert>
                  )}
                  {userLocation && (
                    <p className="text-xs text-muted-foreground">Distances are straight-line and approximate; market locations may be estimates, not road distances.</p>
                  )}
                  {topMarkets.map((market: any, index) => {
                    const distance = market.distance ?? null;
                    
                    return (
                  <div
                    key={market.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold bg-muted text-muted-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{translateMarketName(market.name, language)}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getDistrictTranslation(market.district, language)}, {getStateTranslation(market.state, language)}
                          </span>
                          {distance !== null && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                              <Navigation2 className="h-3 w-3" />
                              Approx. {formatDistance(distance)} straight-line
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-foreground">₹{market.price}/quintal</p>
                    </div>
                  </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insight Card */}
        <Card className="mt-6 bg-gradient-hero text-primary-foreground animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Market information</h3>
                <p className="text-sm opacity-90">
                  Check current prices and local conditions before making a decision.
                </p>
              </div>
            </div>
            <Link to="/chatbot">
              <Button variant="accent" size="sm">
                {t("dashboard.learnMore")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Price Calculator & Rainfall - Below main grid */}
        <div className="mt-6 animate-slide-up">
          <div className="grid lg:grid-cols-2 gap-6">
            <PriceCalculator 
              key={activeCropForMarkets}
              commodity={activeCropForMarkets}
              marketPrice={hasRealData && !marketsError ? topMarkets[0]?.price : undefined}
            />
            
            {/* Rainfall Widget */}
            {effectiveState && effectiveState !== 'India' && (
              <RainfallWidget state={effectiveState} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
