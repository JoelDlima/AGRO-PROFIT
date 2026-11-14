/**
 * Rainfall Service
 * Fetches district-wise rainfall data from Government of India API via Supabase Edge Function
 * Resource ID: d758a71b-8caf-489b-a4c8-929e894e4a0b
 */


import { getApiUrl } from "@/lib/api";

import { liveServicesEnabled, requireLiveService } from '@/lib/demoConfig';

export interface RainfallData {
  state: string;
  district: string;
  year: string;
  jan: string;
  feb: string;
  mar: string;
  apr: string;
  may: string;
  jun: string;
  jul: string;
  aug: string;
  sep: string;
  oct: string;
  nov: string;
  dec: string;
  annual: string;
}

export interface RainfallResponse {
  records: RainfallData[];
  total: number;
  count: number;
}

/**
 * Fetch rainfall data for a specific state and year
 */
export async function fetchRainfallData(
  state: string,
  year?: number
): Promise<RainfallResponse> {
  requireLiveService(liveServicesEnabled(import.meta.env), 'Rainfall data');
  const params = new URLSearchParams({ state: state || 'Maharashtra', limit: '50' });
  if (year !== undefined) params.set('year', String(year));
  const response = await fetch(getApiUrl(`/api/rainfall?${params}`));
  if (!response.ok) throw new Error('Rainfall data is unavailable.');
  const data = await response.json();
  if (!Array.isArray(data.records)) throw new Error('Rainfall data is unavailable.');
  return data;
}

/**
 * Calculate total annual rainfall for a district
 */
export function calculateAnnualRainfall(record: RainfallData): number {
  if (record.annual && record.annual !== "0") {
    return parseFloat(record.annual);
  }
  
  // Calculate from monthly data if annual not available
  const months = [
    record.jan, record.feb, record.mar, record.apr,
    record.may, record.jun, record.jul, record.aug,
    record.sep, record.oct, record.nov, record.dec
  ];
  
  return months.reduce((sum, month) => {
    const value = parseFloat(month || "0");
    return sum + (isNaN(value) ? 0 : value);
  }, 0);
}

/**
 * Get rainfall risk level based on annual rainfall
 */
export function getRainfallRisk(annualRainfall: number): {
  level: "low" | "normal" | "high" | "excess";
  message: string;
  color: string;
} {
  if (annualRainfall < 500) {
    return {
      level: "low",
      message: "Drought risk - Consider drought-resistant crops",
      color: "text-red-600"
    };
  } else if (annualRainfall < 1000) {
    return {
      level: "normal",
      message: "Normal rainfall - Good for most crops",
      color: "text-green-600"
    };
  } else if (annualRainfall < 2000) {
    return {
      level: "high",
      message: "High rainfall - Suitable for water-intensive crops",
      color: "text-blue-600"
    };
  } else {
    return {
      level: "excess",
      message: "Excess rainfall - Risk of waterlogging",
      color: "text-orange-600"
    };
  }
}
