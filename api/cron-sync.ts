export default async function handler(req: any, res: any) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const startTime = Date.now();

  const GOV_API_KEY = process.env.DATA_GOV_API_KEY || process.env.VITE_DATA_GOV_API_KEY || "";
  const AGMARKNET_API_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const COMMODITY_NAME_MAP: Record<string, string> = {
    'Sugarcane': 'Sugar Cane',
    'sugarcane': 'Sugar Cane',
    'Soybean': 'Soyabean',
    'soybean': 'Soyabean',
  };

  // Staple crops covering India's major agricultural markets
  const CROPS_TO_SYNC = [
    'Wheat',
    'Rice',
    'Tomato',
    'Onion',
    'Potato',
    'Maize',
    'Soybean',
    'Cotton',
    'Mustard',
    'Gram',
    'Apple',
    'Banana',
  ];

  const syncResults: Array<{
    crop: string;
    status: 'success' | 'empty' | 'error';
    recordsSynced: number;
    error?: string;
  }> = [];

  let totalRecordsSynced = 0;

  const parseArrivalDate = (dateStr: string, fallback: string): string => {
    if (!dateStr) return fallback;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return dateStr;
  };

  // Helper to fetch and sync one crop
  const syncCrop = async (crop: string) => {
    const apiCommodity = COMMODITY_NAME_MAP[crop] || crop;
    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    try {
      const params = new URLSearchParams({
        'api-key': GOV_API_KEY,
        'format': 'json',
        'limit': '100',
        'offset': '0',
        'filters[commodity]': apiCommodity,
      });

      const fetchUrl = `${AGMARKNET_API_BASE}?${params.toString()}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s per crop

      const apiRes = await fetch(fetchUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!apiRes.ok) {
        syncResults.push({
          crop,
          status: 'error',
          recordsSynced: 0,
          error: `API returned ${apiRes.status}: ${apiRes.statusText}`,
        });
        return;
      }

      const data = await apiRes.json();
      const rawRecords: any[] = data.records || [];

      if (rawRecords.length === 0) {
        syncResults.push({ crop, status: 'empty', recordsSynced: 0 });
        return;
      }

      // Format records for Supabase mandi_prices_cache
      const cacheRows = rawRecords.map((r) => ({
        commodity: r.commodity || crop,
        state: r.state || null,
        district: r.district || '',
        market: r.market || '',
        variety: r.variety || '',
        grade: 'FAQ',
        arrival_date: parseArrivalDate(r.arrival_date, todayDate),
        min_price: parseFloat(String(r.min_price)) || 0,
        max_price: parseFloat(String(r.max_price)) || 0,
        modal_price: parseFloat(String(r.modal_price)) || 0,
        fetched_at: nowIso,
      }));

      // Format price history entries (top 20 markets)
      const historyRows = cacheRows.slice(0, 20).map((r) => ({
        commodity: r.commodity,
        state: r.state || 'India',
        district: r.district,
        market: r.market,
        modal_price: r.modal_price,
        min_price: r.min_price,
        max_price: r.max_price,
        recorded_date: r.arrival_date,
      }));

      // 1. Bulk upsert to mandi_prices_cache
      const upsertCachePromise = fetch(
        `${SUPABASE_URL}/rest/v1/mandi_prices_cache?on_conflict=commodity,market,district,state,arrival_date`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(cacheRows),
        }
      );

      // 2. Bulk upsert to price_history
      const insertHistoryPromise = fetch(
        `${SUPABASE_URL}/rest/v1/price_history?on_conflict=commodity,state,market,recorded_date`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify(historyRows),
        }
      );

      await Promise.allSettled([upsertCachePromise, insertHistoryPromise]);

      totalRecordsSynced += cacheRows.length;
      syncResults.push({
        crop,
        status: 'success',
        recordsSynced: cacheRows.length,
      });
    } catch (err: any) {
      syncResults.push({
        crop,
        status: 'error',
        recordsSynced: 0,
        error: err.message || 'Unknown error',
      });
    }
  };

  // Run in chunks of 3 concurrent requests to avoid serverless timeouts & rate-limits
  const chunkSize = 3;
  for (let i = 0; i < CROPS_TO_SYNC.length; i += chunkSize) {
    const chunk = CROPS_TO_SYNC.slice(i, i + chunkSize);
    await Promise.all(chunk.map((c) => syncCrop(c)));
  }

  const durationMs = Date.now() - startTime;

  return res.status(200).json({
    success: true,
    message: `Mandi price cron sync completed for ${CROPS_TO_SYNC.length} crops.`,
    cronInterval: '3 Hours',
    timestamp: new Date().toISOString(),
    durationMs,
    totalRecordsSynced,
    details: syncResults,
  });
}
