/**
 * Scan History Service for AgroProfit
 * Manages crop scan history in Supabase + localStorage fallback
 */

import { supabase } from '@/integrations/supabase/client';

export interface ScanRecord {
  id: string;
  user_id?: string;
  scan_type: 'plant' | 'crop';
  provider: 'plant_id' | 'crop_health';
  crop_name: string;
  location: string;
  image_url: string;
  status: 'healthy' | 'small_problem' | 'medium_problem' | 'big_problem';
  disease_name: string | null;
  disease_severity: 'low' | 'medium' | 'high' | null;
  disease_confidence: number | null;
  disease_description: string | null;
  treatment_summary: string | null;
  treatment_steps: any[];
  ai_explanation: any;
  ai_language: string;
  created_at: string;
}

const LOCAL_STORAGE_KEY = 'agroprofit-scan-history';

/** Get scan history from Supabase (or localStorage for guests) */
export async function getScanHistory(userId?: string): Promise<ScanRecord[]> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('crop_scans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        return data as ScanRecord[];
      }
    } catch (e) {
      console.warn('[ScanHistory] Supabase fetch failed, using localStorage', e);
    }
  }

  // Fallback to localStorage
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/** Save a scan to history */
export async function saveScanToHistory(
  scan: Omit<ScanRecord, 'id' | 'created_at'>,
  userId?: string
): Promise<ScanRecord> {
  const record: ScanRecord = {
    ...scan,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };

  if (userId) {
    try {
      const { data, error } = await supabase
        .from('crop_scans')
        .insert({
          user_id: userId,
          scan_type: scan.scan_type,
          provider: scan.provider,
          crop_name: scan.crop_name,
          location: scan.location || 'Field Scan',
          image_url: scan.image_url,
          status: scan.status,
          disease_name: scan.disease_name,
          disease_severity: scan.disease_severity,
          disease_confidence: scan.disease_confidence,
          disease_description: scan.disease_description,
          treatment_summary: scan.treatment_summary,
          treatment_steps: scan.treatment_steps || [],
          ai_explanation: scan.ai_explanation || {},
          ai_language: scan.ai_language || 'en',
        })
        .select()
        .single();

      if (!error && data) {
        return data as ScanRecord;
      }
    } catch (e) {
      console.warn('[ScanHistory] Supabase insert failed, saving to localStorage', e);
    }
  }

  // Fallback to localStorage
  const existing = await getScanHistory();
  existing.unshift(record);
  // Keep max 50 scans in localStorage
  const trimmed = existing.slice(0, 50);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
  return record;
}

/** Delete a scan from history */
export async function deleteScan(scanId: string, userId?: string): Promise<void> {
  if (userId) {
    try {
      await supabase
        .from('crop_scans')
        .delete()
        .eq('id', scanId)
        .eq('user_id', userId);
      return;
    } catch (e) {
      console.warn('[ScanHistory] Supabase delete failed', e);
    }
  }

  // Fallback: remove from localStorage
  const existing = await getScanHistory();
  const filtered = existing.filter(s => s.id !== scanId);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
}

/** Clear all scan history */
export async function clearScanHistory(userId?: string): Promise<void> {
  if (userId) {
    try {
      await supabase
        .from('crop_scans')
        .delete()
        .eq('user_id', userId);
    } catch (e) {
      console.warn('[ScanHistory] Supabase clear failed', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/** Map detection result to scan status */
export function getScanStatus(
  isHealthy: boolean,
  severity: string
): ScanRecord['status'] {
  if (isHealthy) return 'healthy';
  switch (severity) {
    case 'high': return 'big_problem';
    case 'medium': return 'medium_problem';
    case 'low': return 'small_problem';
    default: return 'healthy';
  }
}
