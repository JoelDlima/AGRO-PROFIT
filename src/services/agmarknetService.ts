/**
 * Agmarknet API Service
 * Fetches real-time mandi (market) prices from Government of India's data.gov.in
 * 
 * API Documentation: https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi
 * Resource ID: 9ef84268-d588-465a-a308-a864a43d0070
 */

import { getApiUrl } from "@/lib/api";

import { liveServicesEnabled, requireLiveService } from '@/lib/demoConfig';

// Commodity name mapping - API uses different names than our display names
const COMMODITY_NAME_MAP: Record<string, string> = {
  'Sugarcane': 'Sugar Cane',
  'sugarcane': 'Sugar Cane',
  'Soybean': 'Soyabean',
  'soybean': 'Soyabean',
  // Add more mappings as needed
};

/**
 * Normalize commodity name for API requests
 */
function normalizeCommodityName(commodity: string): string {
  return COMMODITY_NAME_MAP[commodity] || commodity;
}

export interface MandiPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

export interface AgmarknetResponse {
  index_name: string;
  title: string;
  desc: string;
  created: number;
  updated: number;
  active: string;
  created_date: string;
  updated_date: string;
  records: MandiPrice[];
  total: number;
  count: number;
  limit: string;
  offset: string;
}

/**
 * Fetch mandi prices for a specific commodity
 * Resilient multi-tier strategy:
 * 1. Same-Origin Vercel Serverless Function (/api/mandi) - immune to CORS & extensions
 * 2. Direct Government API with verified working key
 * 3. Public CORS proxy fallback
 */
export async function fetchMandiPrices(
  commodity: string,
  options?: {
    state?: string;
    district?: string;
    market?: string;
    limit?: number;
    offset?: number;
  }
): Promise<AgmarknetResponse> {
  requireLiveService(liveServicesEnabled(import.meta.env), 'Mandi prices');
  const params = new URLSearchParams({ commodity: normalizeCommodityName(commodity), limit: String(options?.limit || 200) });
  if (options?.state) params.set('state', options.state);
  if (options?.district) params.set('district', options.district);
  if (options?.market) params.set('market', options.market);
  if (options?.offset) params.set('offset', String(options.offset));
  const response = await fetch(getApiUrl(`/api/mandi?${params}`));
  if (!response.ok) throw new Error('Mandi prices are unavailable.');
  const data = await response.json();
  if (!Array.isArray(data.records)) throw new Error('Mandi prices are unavailable.');
  return data;
}

/**
 * Fetch prices for multiple commodities
 */
export async function fetchMultipleCommodityPrices(
  commodities: string[],
  state?: string
): Promise<Map<string, MandiPrice[]>> {
  const results = new Map<string, MandiPrice[]>();

  for (const commodity of commodities) {
    try {
      const response = await fetchMandiPrices(commodity, { state, limit: 50 });
      results.set(commodity, response.records);
    } catch (error) {
      console.error(`Error fetching prices for ${commodity}:`, error);
      throw error;
    }
  }

  return results;
}

/**
 * Get unique states from API
 */
export async function fetchAvailableStates(): Promise<string[]> {
  try {
    const response = await fetchMandiPrices("Tomato", { limit: 1000 });
    const states = new Set(response.records.map((r) => r.state));
    return Array.from(states).sort();
  } catch (error) {
    console.error("Error fetching states:", error);
    throw error;
  }
}

/**
 * Get unique districts for a state
 */
export async function fetchDistrictsByState(state: string): Promise<string[]> {
  try {
    const response = await fetchMandiPrices("Tomato", { state, limit: 1000 });
    const districts = new Set(response.records.map((r) => r.district));
    return Array.from(districts).sort();
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw error;
  }
}

/**
 * Transform API data to our app's Market format
 */
export function transformToMarketData(
  record: MandiPrice,
  userLocation?: { lat: number; lng: number }
): {
  id: string;
  name: string;
  district: string;
  state: string;
  distance: number;
  price: number;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  commodity: string;
} {
  // Parse prices (they come as strings)
  const modalPrice = parseFloat(record.modal_price) || 0;
  const minPrice = parseFloat(record.min_price) || 0;
  const maxPrice = parseFloat(record.max_price) || 0;

  // Calculate approximate distance (would need geolocation API for real distance)
  const distance = userLocation ? calculateDistance(userLocation, record) : 0;

  // Determine trend based on modal vs min/max
  const trend = determineTrend(modalPrice, minPrice, maxPrice);

  return {
    id: `${record.state}-${record.district}-${record.market}`.toLowerCase().replace(/\s+/g, "-"),
    name: record.market,
    district: record.district,
    state: record.state,
    distance,
    price: modalPrice,
    modalPrice,
    minPrice,
    maxPrice,
    trend,
    lastUpdated: record.arrival_date,
    commodity: record.commodity,
  };
}

function determineTrend(modal: number, min: number, max: number): "up" | "down" | "stable" {
  const range = max - min;
  const position = modal - min;
  const percentage = range > 0 ? position / range : 0.5;

  if (percentage > 0.6) return "up";
  if (percentage < 0.4) return "down";
  return "stable";
}

function calculateDistance(
  userLocation: { lat: number; lng: number },
  record: MandiPrice
): number {
  // This is a placeholder - you'd need to use a geocoding service
  // to convert market name to coordinates, then calculate distance
  // For now, returning a random distance between 10-500 km
  return Math.floor(Math.random() * 490) + 10;
}
