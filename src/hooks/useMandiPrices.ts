/**
 * Custom hook for fetching mandi price data with Supabase caching
 */

import { useQuery } from "@tanstack/react-query";
import { getMandiPricesWithCache } from "@/services/mandiCacheService";
import { transformToMarketData } from "@/services/agmarknetService";
import { liveServicesEnabled } from "@/lib/demoConfig";

export interface UseMandiPricesOptions {
  commodity: string;
  state?: string;
  district?: string;
  enabled?: boolean;
}

export function useMandiPrices(options: UseMandiPricesOptions) {
  const { commodity, state, district, enabled = true } = options;

  const queryKey = ["mandiPrices", commodity, state, district];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const records = await getMandiPricesWithCache(commodity, state);
      return { records, total: records.length, count: records.length };
    },
    enabled: enabled && !!commodity && liveServicesEnabled(import.meta.env),
    staleTime: 1000 * 60 * 60 * 3, // 3 hours - matches 3-hour cache sync
    refetchInterval: false,
    retry: 1,
    retryDelay: 2000,
    gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}

export function useTransformedMarkets(commodity: string, state?: string) {
  const { data, isLoading, error } = useMandiPrices({ commodity, state });

  const markets = data?.records?.map((record) => transformToMarketData(record)) || [];

  // Sort by price (highest first)
  const sortedMarkets = [...markets].sort((a, b) => b.price - a.price);

  // Calculate statistics
  const averagePrice = markets.length > 0
    ? markets.reduce((sum, m) => sum + m.price, 0) / markets.length
    : 0;

  const highestPrice = sortedMarkets[0]?.price || 0;
  const lowestPrice = sortedMarkets[sortedMarkets.length - 1]?.price || 0;

  return {
    markets: sortedMarkets,
    averagePrice: Math.round(averagePrice),
    highestPrice,
    lowestPrice,
    isLoading,
    error,
    totalMarkets: markets.length,
  };
}
