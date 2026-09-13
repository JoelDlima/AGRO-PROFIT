/**
 * Mandi Price Cache Service
 * Handles caching of mandi prices in Supabase for better performance
 * Uses Supabase Edge Functions to bypass CORS issues
 */

import { supabase } from '@/integrations/supabase/client';
import { type MandiPrice, fetchMandiPrices } from './agmarknetService';
import { storePriceHistory } from './forumService';

export interface CachedMandiPrice {
  id: string;
  commodity: string;
  state: string | null;
  district: string;
  market: string;
  variety: string;
  grade: string | null;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  fetched_at: string;
}

/**
 * Check if cached data exists and is fresh (< 3 hours old)
 */
export async function hasFreshCache(commodity: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('mandi_prices_cache')
    .select('fetched_at')
    .eq('commodity', commodity)
    .gte('fetched_at', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking cache:', error);
    return false;
  }

  return Boolean(data && data.length > 0);
}

/**
 * Get the latest fetched timestamp for a commodity in Supabase cache
 */
export async function getLatestCacheTimestamp(commodity: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('mandi_prices_cache')
      .select('fetched_at')
      .eq('commodity', commodity)
      .order('fetched_at', { ascending: false })
      .limit(1);

    return data?.[0]?.fetched_at || null;
  } catch {
    return null;
  }
}

/**
 * Get cached mandi prices from Supabase
 */
export async function getCachedPrices(
  commodity: string,
  state?: string
): Promise<MandiPrice[]> {
  let query = supabase
    .from('mandi_prices_cache')
    .select('*')
    .eq('commodity', commodity)
    .order('modal_price', { ascending: false });

  if (state) {
    query = query.eq('state', state);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cached prices:', error);
    return [];
  }

  // Convert cached format to MandiPrice format
  return (data || []).map((item) => ({
    state: item.state || '',
    district: item.district,
    market: item.market,
    commodity: item.commodity,
    variety: item.variety,
    arrival_date: item.arrival_date,
    min_price: item.min_price.toString(),
    max_price: item.max_price.toString(),
    modal_price: item.modal_price.toString(),
  }));
}

/**
 * Cache mandi records directly to Supabase table
 */
export async function cacheRecordsInSupabase(
  commodity: string,
  records: MandiPrice[]
): Promise<void> {
  if (!records || records.length === 0) return;

  const parseArrivalDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  try {
    const rows = records.slice(0, 100).map((r) => ({
      commodity: r.commodity || commodity,
      state: r.state || null,
      district: r.district || '',
      market: r.market || '',
      variety: r.variety || '',
      grade: 'FAQ',
      arrival_date: parseArrivalDate(r.arrival_date),
      min_price: parseFloat(String(r.min_price)) || 0,
      max_price: parseFloat(String(r.max_price)) || 0,
      modal_price: parseFloat(String(r.modal_price)) || 0,
      fetched_at: new Date().toISOString(),
    }));

    await supabase.from('mandi_prices_cache').upsert(rows, {
      onConflict: 'commodity,market,district,state,arrival_date',
      ignoreDuplicates: true,
    });

    // Store up to 20 price history records for trend analysis
    for (const record of records.slice(0, 20)) {
      try {
        await storePriceHistory({
          commodity: record.commodity || commodity,
          state: record.state,
          district: record.district,
          market: record.market,
          modal_price: parseFloat(String(record.modal_price)),
          min_price: record.min_price ? parseFloat(String(record.min_price)) : undefined,
          max_price: record.max_price ? parseFloat(String(record.max_price)) : undefined,
        });
      } catch (err) {}
    }
  } catch (err) {
    console.warn('[Cache] Background caching error:', err);
  }
}

/**
 * Sync mandi prices to Supabase cache
 */
export async function syncMandiPrices(commodity: string): Promise<boolean> {
  try {
    console.log(`[Cache] Syncing ${commodity}...`);
    let records: MandiPrice[] = [];

    // Fetch via resilient multi-tier agmarknetService
    const directRes = await fetchMandiPrices(commodity, { limit: 200 });
    if (directRes?.records?.length > 0) {
      records = directRes.records;
    }

    if (records.length > 0) {
      await cacheRecordsInSupabase(commodity, records);
      console.log(`[Cache] Successfully synced ${records.length} records for ${commodity}`);
      return true;
    }

    console.warn(`[Cache] No records found for ${commodity}`);
    return false;
  } catch (error) {
    console.error(`[Cache] Error syncing ${commodity}:`, error);
    return false;
  }
}

/**
 * Get mandi prices with automatic caching
 * - First checks Supabase cache (< 12 hours old)
 * - If no cache or stale, fetches from Government API and caches
 */
export async function getMandiPricesWithCache(
  commodity: string,
  state?: string
): Promise<MandiPrice[]> {
  try {
    // Check if we have fresh cache in Supabase
    const isFresh = await hasFreshCache(commodity);

    if (isFresh) {
      console.log(`[Cache] Using cached data for ${commodity}`);
      const cachedData = await getCachedPrices(commodity, state);
      if (cachedData.length > 0) {
        return cachedData;
      }
    }

    // No cache or stale - fetch fresh data via multi-tier fetchMandiPrices
    console.log(`[Cache] Fetching fresh data for ${commodity}`);
    let records: MandiPrice[] = [];

    const directRes = await fetchMandiPrices(commodity, { state, limit: 200 });
    if (directRes?.records?.length > 0) {
      records = directRes.records;
    }

    // Cache to Supabase in background
    if (records.length > 0) {
      cacheRecordsInSupabase(commodity, records).catch((err) =>
        console.warn('Background cache insertion error:', err)
      );
      return records;
    }

    // Fallback to older cache if available
    const cachedData = await getCachedPrices(commodity, state);
    if (cachedData.length > 0) {
      return cachedData;
    }

    return [];
  } catch (error) {
    console.error('Error in getMandiPricesWithCache:', error);
    const cachedData = await getCachedPrices(commodity, state);
    return cachedData;
  }
}

/**
 * Background sync priority crops on startup
 * Syncs top 5 crops to keep startup lightweight and fast
 */
export async function backgroundSyncAllCrops(crops: string[]): Promise<void> {
  console.log('[Background Sync] Starting sync for priority crops...');
  const priorityCrops = crops.slice(0, 5);
  for (const crop of priorityCrops) {
    try {
      const isFresh = await hasFreshCache(crop);
      if (!isFresh) {
        console.log(`[Background Sync] Refreshing ${crop}...`);
        await syncMandiPrices(crop);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`[Background Sync] ${crop} cache is fresh, skipping`);
      }
    } catch (error) {
      console.warn(`[Background Sync] Failed to sync ${crop}:`, error);
    }
  }
  console.log('[Background Sync] Completed sync for priority crops');
}

/**
 * Get all cached prices for AI context
 * Returns a summary of prices for all crops
 */
export async function getAllCachedPricesForAI(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('mandi_prices_cache')
      .select('commodity, state, district, market, modal_price, arrival_date')
      .order('commodity')
      .order('modal_price', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      return 'No cached price data available yet.';
    }

    // Group by commodity and get top markets for each
    const groupedByCrop: Record<string, any[]> = {};
    data.forEach(item => {
      if (!groupedByCrop[item.commodity]) {
        groupedByCrop[item.commodity] = [];
      }
      // Keep top 5 markets per crop
      if (groupedByCrop[item.commodity].length < 5) {
        groupedByCrop[item.commodity].push(item);
      }
    });

    // Format for AI
    let summary = 'Current Mandi Prices (cached data):\n\n';
    Object.entries(groupedByCrop).forEach(([crop, markets]) => {
      summary += `${crop}:\n`;
      markets.forEach(m => {
        summary += `  - ${m.market}, ${m.district}, ${m.state}: ₹${m.modal_price}/quintal (${m.arrival_date})\n`;
      });
      summary += '\n';
    });

    return summary;
  } catch (error) {
    console.error('Error fetching cached prices for AI:', error);
    return 'Unable to fetch cached price data.';
  }
}
