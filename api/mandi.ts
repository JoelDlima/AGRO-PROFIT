export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const COMMODITY_NAME_MAP: Record<string, string> = {
    'Sugarcane': 'Sugar Cane',
    'sugarcane': 'Sugar Cane',
    'Soybean': 'Soyabean',
    'soybean': 'Soyabean',
  };

  const GOV_API_KEY = process.env.DATA_GOV_API_KEY || process.env.VITE_DATA_GOV_API_KEY || "";
  const AGMARKNET_API_BASE = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

  const { commodity = 'Wheat', state, limit = '200', force } = req.query || {};
  const commodityStr = Array.isArray(commodity) ? commodity[0] : (commodity || 'Wheat');
  const normalizedCommodity = COMMODITY_NAME_MAP[commodityStr] || commodityStr;

  // 1. Check Supabase 3-Hour Cache first (avoids slow external gov API calls)
  if (!force) {
    try {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      let cacheUrl = `${SUPABASE_URL}/rest/v1/mandi_prices_cache?commodity=eq.${encodeURIComponent(commodityStr)}&fetched_at=gte.${encodeURIComponent(threeHoursAgo)}&order=modal_price.desc&limit=${limit}`;
      if (state && typeof state === 'string') {
        cacheUrl += `&state=eq.${encodeURIComponent(state)}`;
      }

      const cacheRes = await fetch(cacheUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (cacheRes.ok) {
        const cachedRows = await cacheRes.json();
        if (Array.isArray(cachedRows) && cachedRows.length > 0) {
          const formatted = cachedRows.map((item: any) => ({
            state: item.state || '',
            district: item.district || '',
            market: item.market || '',
            commodity: item.commodity || commodityStr,
            variety: item.variety || '',
            arrival_date: item.arrival_date || '',
            min_price: String(item.min_price || '0'),
            max_price: String(item.max_price || '0'),
            modal_price: String(item.modal_price || '0'),
          }));
          return res.status(200).json({
            records: formatted,
            total: formatted.length,
            count: formatted.length,
            cached: true,
            cached_at: cachedRows[0]?.fetched_at,
          });
        }
      }
    } catch (cacheErr) {
      console.warn('[Mandi Proxy] Cache read failed, proceeding to live fetch:', cacheErr);
    }
  }

  // 2. Fetch fresh data from Government of India Agmarknet API
  const params = new URLSearchParams({
    'api-key': GOV_API_KEY,
    'format': 'json',
    'limit': String(limit),
    'offset': '0',
    'filters[commodity]': normalizedCommodity,
  });

  if (state && typeof state === 'string') {
    params.append('filters[state]', state);
  }

  const url = `${AGMARKNET_API_BASE}?${params.toString()}`;

  try {
    const apiRes = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ records: [], total: 0, count: 0, error: apiRes.statusText });
    }

    const data = await apiRes.json();
    const records = data.records || [];

    // 3. Store to Supabase in background every time it's fetched
    if (records.length > 0) {
      const nowIso = new Date().toISOString();
      const rows = records.slice(0, 100).map((r: any) => {
        let arrivalDate = r.arrival_date || '';
        if (arrivalDate.includes('/')) {
          const parts = arrivalDate.split('/');
          if (parts.length === 3) arrivalDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return {
          commodity: r.commodity || commodityStr,
          state: r.state || null,
          district: r.district || '',
          market: r.market || '',
          variety: r.variety || '',
          grade: 'FAQ',
          arrival_date: arrivalDate || nowIso.split('T')[0],
          min_price: parseFloat(String(r.min_price)) || 0,
          max_price: parseFloat(String(r.max_price)) || 0,
          modal_price: parseFloat(String(r.modal_price)) || 0,
          fetched_at: nowIso,
        };
      });

      // Upsert into mandi_prices_cache
      const upsertPromise = fetch(`${SUPABASE_URL}/rest/v1/mandi_prices_cache?on_conflict=commodity,market,district,state,arrival_date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(rows),
      });

      // Append price history records
      const historyRows = rows.slice(0, 20).map((r: any) => ({
        commodity: r.commodity,
        state: r.state,
        district: r.district,
        market: r.market,
        modal_price: r.modal_price,
        min_price: r.min_price,
        max_price: r.max_price,
        recorded_date: r.arrival_date,
      }));

      const historyPromise = fetch(`${SUPABASE_URL}/rest/v1/price_history?on_conflict=commodity,state,market,recorded_date`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(historyRows),
      });

      // Await writes to guarantee database persistence before serverless response completes
      await Promise.allSettled([upsertPromise, historyPromise]);
    }

    return res.status(200).json(data);
  } catch (err: any) {
    // Fallback to any cached data on network error
    try {
      let fallbackUrl = `${SUPABASE_URL}/rest/v1/mandi_prices_cache?commodity=eq.${encodeURIComponent(commodityStr)}&order=modal_price.desc&limit=${limit}`;
      if (state && typeof state === 'string') {
        fallbackUrl += `&state=eq.${encodeURIComponent(state)}`;
      }
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Accept': 'application/json',
        },
      });
      if (fallbackRes.ok) {
        const fallbackRows = await fallbackRes.json();
        if (Array.isArray(fallbackRows) && fallbackRows.length > 0) {
          const formatted = fallbackRows.map((item: any) => ({
            state: item.state || '',
            district: item.district || '',
            market: item.market || '',
            commodity: item.commodity || commodityStr,
            variety: item.variety || '',
            arrival_date: item.arrival_date || '',
            min_price: String(item.min_price || '0'),
            max_price: String(item.max_price || '0'),
            modal_price: String(item.modal_price || '0'),
          }));
          return res.status(200).json({
            records: formatted,
            total: formatted.length,
            count: formatted.length,
            cached: true,
            fallback: true,
          });
        }
      }
    } catch (_) {}

    return res.status(500).json({ records: [], total: 0, count: 0, error: err.message });
  }
}
