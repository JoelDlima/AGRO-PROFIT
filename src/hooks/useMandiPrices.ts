/**
 * Custom hook for fetching mandi price data with Supabase caching
 */

import { useQuery } from "@tanstack/react-query";
import { getMandiPricesWithCache } from "@/services/mandiCacheService";
import { transformToMarketData, type MandiPrice } from "@/services/agmarknetService";

export interface UseMandiPricesOptions {
  commodity: string;
  state?: string;
  district?: string;
  enabled?: boolean;
}

export function useMandiPrices(options: UseMandiPricesOptions) {
  const { commodity, state, district, enabled = true } = options;

  const queryKey = ["mandiPrices", commodity, state, district];
  
  console.log("useMandiPrices Hook Called:", {
    commodity,
    state,
    district,
    enabled,
    willExecute: enabled && !!commodity,
    queryKey: JSON.stringify(queryKey)
  });

  return useQuery({
    queryKey,
    queryFn: async () => {
      console.log(`[${commodity}${state ? `/${state}` : ''}] Fetching mandi prices with cache...`);
      const records = await getMandiPricesWithCache(commodity, state);
      console.log(`[${commodity}${state ? `/${state}` : ''}] Got ${records.length} records`);
      return { records, total: records.length, count: records.length };
    },
    enabled: enabled && !!commodity,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours - matches 3-hour cache sync
    refetchInterval: false,
    retry: 1,
    retryDelay: 2000,
    gcTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
}

export function useTransformedMarkets(commodity: string, state?: string) {
  console.log("useTransformedMarkets called with:", { commodity, state });
  const { data, isLoading, error } = useMandiPrices({ commodity, state });

  console.log("Raw data from useMandiPrices:", {
    hasData: !!data,
    dataKeys: data ? Object.keys(data) : [],
    recordsType: data?.records ? typeof data.records : 'undefined',
    recordsIsArray: Array.isArray(data?.records),
    recordsLength: data?.records?.length,
    firstRecordKeys: data?.records?.[0] ? Object.keys(data.records[0]) : []
  });

  const markets = data?.records?.map((record) => transformToMarketData(record)) || [];
  
  console.log("useTransformedMarkets result:", {
    hasData: !!data,
    recordsCount: data?.records?.length || 0,
    marketsCount: markets.length,
    isLoading,
    error: error?.message
  });

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
