import { useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Clock,
  ArrowRight,
  Star,
  Navigation,
  AlertCircle,
  Navigation2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { crops, markets } from "@/data/mockData";
import { useTransformedMarkets } from "@/hooks/useMandiPrices";
import { cn } from "@/lib/utils";
import { useLocation } from "@/hooks/useLocation";
import { geocodeIndianLocation, calculateDistance, formatDistance } from "@/services/locationService";
import { useTheme } from "@/hooks/useTheme";
import { getStateTranslation, getDistrictTranslation, translateMarketName } from "@/lib/locationTranslations";

export default function PriceComparison() {
  const [selectedCrop, setSelectedCrop] = useState("tomato");
  const [sortBy, setSortBy] = useState<"price" | "distance">("price");
  const [priceUnit, setPriceUnit] = useState<"quintal" | "kg">("quintal");
  const { location: userLocation, requestLocation, loading: locationLoading } = useLocation();
  const { language, t } = useTheme();
  const selectedCropData = crops.find((c) => c.id === selectedCrop);

  // Auto-switch to distance sorting when location is detected
  useEffect(() => {
    if (userLocation) {
      setSortBy("distance");
    }
  }, [userLocation]);
  
  // Get translated crop name based on language
  const getCropName = (crop: typeof crops[0]) => {
    if (language === 'hi') return crop.nameHi || crop.name;
    if (language === 'mr') return crop.nameMr || crop.name;
    if (language === 'kok') return crop.nameKok || crop.name;
    return crop.name;
  };
  
  // Fetch real mandi prices using the correct hook
  const { markets: mandiMarkets, isLoading, error } = useTransformedMarkets(
    selectedCropData?.name || "",
    undefined // We can add state filter later
  );
  
  // Debug logging
  console.log("PriceComparison Debug:", {
    selectedCrop,
    cropName: selectedCropData?.name,
    isLoading,
    error,
    mandiMarketsCount: mandiMarkets?.length,
    mandiMarkets: mandiMarkets?.slice(0, 2) // Show first 2 for debugging
  });
  
  // Use real data if available, otherwise fall back to mock data
  const displayMarkets = mandiMarkets && mandiMarkets.length > 0 ? mandiMarkets : markets;
  
  // Calculate distances for all markets if location available
  const marketsWithDistance = displayMarkets.map(market => {
    let distance: number | null = null;
    if (userLocation) {
      const marketCoords = geocodeIndianLocation(
        market.name,
        market.district,
        market.state
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
    return { ...market, distance };
  });
  
  // Sort markets by selected criteria
  const sortedMarkets = [...marketsWithDistance].sort((a, b) => {
    if (sortBy === "distance") {
      // If sorting by distance, prioritize markets with known distances
      if (a.distance === null && b.distance === null) return b.price - a.price; // Both null, sort by price
      if (a.distance === null) return 1; // a is null, move to end
      if (b.distance === null) return -1; // b is null, move to end
      return a.distance - b.distance; // Both have distance, sort ascending
    } else {
      // Sort by price (highest first)
      return b.price - a.price;
    }
  });
  
  const averagePrice = Math.round(displayMarkets.reduce((sum, m) => sum + m.price, 0) / displayMarkets.length);
  const highestPrice = sortedMarkets[0]?.price || 0;
  
  // Convert price based on unit selection
  const convertPrice = (price: number) => {
    return priceUnit === "kg" ? Math.round(price / 100) : price;
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("price.compareTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("price.findBestMarket")}
          </p>
        </div>

        {/* Crop Selector */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* Crop Selection Row */}
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t("price.selectCrop")}
                  </label>
                  <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue>
                        {selectedCropData && (
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{selectedCropData.icon}</span>
                            <span>{getCropName(selectedCropData)}</span>
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.id} value={crop.id}>
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{crop.icon}</span>
                            <span>{getCropName(crop)}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("price.markets")}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mx-auto" />
                    ) : (
                      <p className="text-2xl font-bold text-primary">{displayMarkets.length}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("price.highestPrice")}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mx-auto" />
                    ) : (
                      <p className="text-2xl font-bold text-success">₹{convertPrice(highestPrice)}</p>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("price.avgPrice")}</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20 mx-auto" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground">₹{convertPrice(averagePrice)}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sort & Unit Controls */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t("price.sortBy")}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === "price" ? "default" : "outline"}
                      onClick={() => setSortBy("price")}
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      {t("price.bestPrice")}
                    </Button>
                    <Button
                      variant={sortBy === "distance" ? "default" : "outline"}
                      onClick={() => {
                        setSortBy("distance");
                        if (!userLocation && !locationLoading) {
                          requestLocation();
                        }
                      }}
                      className="flex-1"
                    >
                      <Navigation2 className="h-4 w-4 mr-2" />
                      {t("price.nearest")}
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t("price.priceUnit")}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={priceUnit === "quintal" ? "default" : "outline"}
                      onClick={() => setPriceUnit("quintal")}
                      className="flex-1"
                    >
                      {t("price.perQuintal")}
                    </Button>
                    <Button
                      variant={priceUnit === "kg" ? "default" : "outline"}
                      onClick={() => setPriceUnit("kg")}
                      className="flex-1"
                    >
                      {t("price.perKg")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data source indicator */}
        {mandiMarkets && mandiMarkets.length > 0 && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("price.showingLiveData")}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error state */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to fetch live prices. Showing sample data.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Market List */}
        {!isLoading && (
          <div className="space-y-4">
            {sortedMarkets.map((market, index) => {
            const isAboveAverage = market.price > averagePrice;
            const isBest = index === 0;
            const priceDiff = market.price - averagePrice;
            const priceDiffPercent = Math.round((priceDiff / averagePrice) * 100);
            
            // Distance is already calculated in marketsWithDistance
            const distance = market.distance;

            return (
              <Card 
                key={`${market.id}-${index}`} 
                className={cn(
                  "transition-all duration-300 hover:shadow-lg animate-slide-up",
                  isBest && "border-2 border-success ring-2 ring-2-success/20"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Rank & Name */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0",
                        isBest ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {isBest ? <Star className="h-6 w-6" /> : index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground text-lg">{translateMarketName(market.name, language)}</h3>
                          {isBest && (
                            <span className="px-2 py-0.5 bg-success text-success-foreground text-xs font-medium rounded-full">
                              {sortBy === "distance" ? t("price.nearest") : t("price.bestPrice")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {getDistrictTranslation(market.district, language)}, {getStateTranslation(market.state, language)}
                          </span>
                          {distance !== null && (
                            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                              <Navigation2 className="h-3 w-3" />
                              {formatDistance(distance)}
                            </span>
                          )}
                          {distance === null && !userLocation && sortBy === "distance" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={requestLocation}
                              disabled={locationLoading}
                              className="h-6 px-2 text-xs"
                            >
                              <Navigation2 className="h-3 w-3 mr-1" />
                              {locationLoading ? t("price.getting") : t("price.enableLocation")}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price Info */}
                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t("price.modalPrice")}</p>
                        <p className="font-medium text-foreground">₹{convertPrice(market.modalPrice)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t("price.range")}</p>
                        <p className="font-medium text-foreground">
                          ₹{convertPrice(market.minPrice)} - ₹{convertPrice(market.maxPrice)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t("price.current")}</p>
                        <p className="text-2xl font-bold text-foreground">
                          ₹{convertPrice(market.price)}
                          <span className="text-sm text-muted-foreground font-normal">
                            /{t(`price.${priceUnit}`)}
                          </span>
                        </p>
                        <div className={cn(
                          "flex items-center justify-center gap-1 text-xs font-medium",
                          isAboveAverage ? "text-success" : "text-destructive"
                        )}>
                          {isAboveAverage ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {priceDiffPercent > 0 ? "+" : ""}{priceDiffPercent}% {t("price.vsAvg")}
                        </div>
                      </div>
                    </div>

                    {/* Trend & Actions */}
                    <div className="flex items-center gap-3 md:ml-4">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1",
                        market.trend === "up" ? "bg-success/10 text-success" :
                        market.trend === "down" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {market.trend === "up" ? <TrendingUp className="h-3 w-3" /> :
                         market.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                        {market.trend === "up" ? t("price.rising") : market.trend === "down" ? t("price.falling") : t("price.stable")}
                      </div>
                      <Link to={`/trends?crop=${selectedCrop}`}>
                        <Button variant="outline" size="sm">
                          {t("price.trends")}
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                    <Clock className="h-3 w-3" />
                    {t("price.updated")} {market.lastUpdated}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}

        {/* Pro Tip */}
        <Card className="mt-6 bg-muted/50 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
              💡
            </div>
            <div>
              <p className="font-medium text-foreground">Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                Prices shown are indicative. Contact the mandi directly for real-time rates before transporting your produce.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
