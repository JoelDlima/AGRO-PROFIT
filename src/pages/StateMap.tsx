import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crops } from "@/data/mockData";
import { useTransformedMarkets } from "@/hooks/useMandiPrices";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Info, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTheme } from "@/hooks/useTheme";
import { getStateTranslation, getDistrictTranslation, translateMarketName, stateTranslations } from "@/lib/locationTranslations";

// Indian states with approximate coordinates and translations
const indianStates = Object.keys(stateTranslations).map((stateName) => ({
  name: stateName,
  nameHi: stateTranslations[stateName].hi,
  nameMr: stateTranslations[stateName].mr,
  nameKok: stateTranslations[stateName].kok,
  lat: 19.7515, // Default coordinates, update as needed
  lng: 75.7139,
}));

// Helper to get state name based on language
const getStateNameForDisplay = (stateName: string, language: string) => {
  if (language === 'hi') return stateTranslations[stateName]?.hi || stateName;
  if (language === 'mr') return stateTranslations[stateName]?.mr || stateName;
  if (language === 'kok') return stateTranslations[stateName]?.kok || stateName;
  return stateName;
};

// Helper to get crop name based on language
const getCropNameForDisplay = (crop: any, language: string) => {
  if (language === 'hi') return crop.nameHi || crop.name;
  if (language === 'mr') return crop.nameMr || crop.name;
  if (language === 'kok') return crop.nameKok || crop.name;
  return crop.name;
};

export default function StateMap() {
  const [selectedCrop, setSelectedCrop] = useState("tomato");
  const [selectedStateData, setSelectedStateData] = useState<any>(null);
  const { t, language } = useTheme();
  
  const selectedCropData = crops.find((c) => c.id === selectedCrop);
  const { markets: allMarkets, isLoading } = useTransformedMarkets(
    selectedCropData?.name || "",
    undefined
  );

  // Aggregate prices by state
  const stateData = indianStates.map(state => {
    const stateMarkets = allMarkets?.filter(m => m.state === state.name) || [];
    if (stateMarkets.length === 0) return null;

    const avgPrice = Math.round(
      stateMarkets.reduce((sum, m) => sum + m.price, 0) / stateMarkets.length
    );
    const minPrice = Math.min(...stateMarkets.map(m => m.price));
    const maxPrice = Math.max(...stateMarkets.map(m => m.price));

    return {
      ...state,
      avgPrice,
      minPrice,
      maxPrice,
      marketCount: stateMarkets.length,
    };
  }).filter(Boolean);

  const validStates = stateData.filter(s => s !== null);
  const cheapestState = validStates.length > 0 
    ? validStates.reduce((min, s) => s!.avgPrice < min!.avgPrice ? s : min)
    : null;
  const mostExpensiveState = validStates.length > 0
    ? validStates.reduce((max, s) => s!.avgPrice > max!.avgPrice ? s : max)
    : null;

  // Get color based on price (relative to min/max)
  const getMarkerColor = (avgPrice: number) => {
    if (!validStates.length) return "bg-gray-400";
    const allPrices = validStates.map(s => s!.avgPrice);
    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const normalized = (avgPrice - min) / (max - min || 1);
    
    if (normalized < 0.33) return "bg-green-500";
    if (normalized < 0.67) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t("stateMap.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("stateMap.subtitle")}
          </p>
        </div>

        {/* Crop Selector */}
        <Card className="mb-6 animate-slide-up">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  {t("stateMap.selectCrop")}
                </label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.id} value={crop.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{crop.icon}</span>
                          <span>{getCropNameForDisplay(crop, language)}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              {!isLoading && validStates.length > 0 && (
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("stateMap.states")}</p>
                    <p className="text-2xl font-bold text-primary">{validStates.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("stateMap.cheapest")}</p>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-success" />
                      <p className="text-lg font-bold text-success">
                        ₹{cheapestState?.avgPrice}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{cheapestState ? getStateNameForDisplay(cheapestState.name, language) : ''}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{t("stateMap.highest")}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-destructive" />
                      <p className="text-lg font-bold text-destructive">
                        ₹{mostExpensiveState?.avgPrice}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">{mostExpensiveState ? getStateNameForDisplay(mostExpensiveState.name, language) : ''}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* State Cards Grid - Alternative to Map */}
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>{t("stateMap.priceDistribution")}</CardTitle>
            <CardDescription>
              {t("stateMap.clickMarkers")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : validStates.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t("stateMap.noData")} {getCropNameForDisplay(selectedCropData, language)}. {t("stateMap.tryAnother")}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {validStates.map((state) => state && (
                  <Card 
                    key={state.name}
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${
                      selectedStateData?.name === state.name ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedStateData(state)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className={`w-3 h-3 rounded-full ${getMarkerColor(state.avgPrice)}`} />
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">{getStateNameForDisplay(state.name, language)}</h3>
                      <p className="text-xl font-bold text-primary">₹{state.avgPrice}</p>
                      <p className="text-xs text-muted-foreground">
                        {state.marketCount} {t("stateMap.markets")}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Selected State Details */}
            {selectedStateData && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <h3 className="font-bold text-lg mb-3">{getStateNameForDisplay(selectedStateData.name, language)}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("stateMap.avgPrice")}</p>
                    <p className="text-xl font-bold text-primary">₹{selectedStateData.avgPrice}/quintal</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("stateMap.range")}</p>
                    <p className="text-lg font-semibold">₹{selectedStateData.minPrice} - ₹{selectedStateData.maxPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t("stateMap.markets")}</p>
                    <p className="text-lg font-semibold">{selectedStateData.marketCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-lg font-semibold ${
                      selectedStateData === cheapestState ? 'text-success' : 
                      selectedStateData === mostExpensiveState ? 'text-destructive' : 
                      'text-foreground'
                    }`}>
                      {selectedStateData === cheapestState ? '✓ ' + t("stateMap.cheapest") : 
                       selectedStateData === mostExpensiveState ? '↑ ' + t("stateMap.highest") : 
                       t("stateMap.mediumPrice")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Legend */}
            {!isLoading && validStates.length > 0 && (
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>{t("stateMap.lowPrice")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span>{t("stateMap.mediumPrice")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>{t("stateMap.highPrice")}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pro Tip */}
        <Card className="bg-muted/50 animate-slide-up">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
              💡
            </div>
            <div>
              <p className="font-medium text-foreground">{t("stateMap.proTip")}</p>
              <p className="text-sm text-muted-foreground">
                {t("stateMap.proTipText")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
