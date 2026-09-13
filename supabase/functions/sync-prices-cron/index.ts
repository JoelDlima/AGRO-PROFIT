// Supabase Edge Function - Auto-sync prices every 12 hours
// This function syncs all 34 crops' prices to price_history table
// Triggered by pg_cron scheduler

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const crops = [
  'Tomato', 'Onion', 'Potato', 'Cabbage', 'Cauliflower', 'Brinjal', 'Lady Finger', 
  'Carrot', 'Peas', 'Capsicum', 'Green Chilli', 'Coriander',
  'Apple', 'Banana', 'Mango', 'Grapes', 'Orange', 'Pomegranate', 'Watermelon',
  'Wheat', 'Rice', 'Maize', 'Bajra', 'Jowar', 'Cotton', 'Sugarcane', 
  'Soybean', 'Groundnut', 'Mustard',
  'Gram', 'Tur', 'Moong', 'Urad'
];

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Cron] Starting automatic price sync for all 34 crops...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const crop of crops) {
      try {
        // Call the existing fetch-mandi-prices function
        const { data: prices, error: fetchError } = await supabase.functions.invoke('fetch-mandi-prices', {
          body: { commodity: crop }
        });

        if (fetchError) {
          console.error(`[Cron] Error fetching ${crop}:`, fetchError);
          errorCount++;
          continue;
        }

        if (!prices || prices.length === 0) {
          console.warn(`[Cron] No prices found for ${crop}`);
          continue;
        }

        // Store in mandi_prices_cache (upsert)
        const cacheRecords = prices.slice(0, 100).map((price: any) => ({
          commodity: crop,
          state: price.state,
          district: price.district,
          market: price.market,
          modal_price: price.modal_price,
          min_price: price.min_price,
          max_price: price.max_price,
          arrival_date: price.arrival_date,
          variety: price.variety,
          grade: price.grade,
          fetched_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const { error: cacheError } = await supabase
          .from('mandi_prices_cache')
          .upsert(cacheRecords, {
            onConflict: 'commodity,market,district,state,arrival_date',
            ignoreDuplicates: false
          });

        if (cacheError) {
          console.error(`[Cron] Cache error for ${crop}:`, cacheError);
        }

        // Store top 50 in price_history for trends
        const historyRecords = prices.slice(0, 50).map((price: any) => ({
          commodity: crop,
          state: price.state,
          district: price.district,
          market: price.market,
          modal_price: price.modal_price,
          min_price: price.min_price,
          max_price: price.max_price,
          recorded_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }));

        const { error: historyError } = await supabase
          .from('price_history')
          .upsert(historyRecords, {
            onConflict: 'commodity,state,market,recorded_date',
            ignoreDuplicates: true // Don't update if already exists for today
          });

        if (historyError) {
          console.error(`[Cron] History error for ${crop}:`, historyError);
        } else {
          successCount++;
          console.log(`[Cron] ✓ Synced ${crop}`);
        }

        // Rate limiting - 1 second between crops
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`[Cron] Exception for ${crop}:`, error);
        errorCount++;
      }
    }

    // Cleanup old data (keep last 15 days)
    await supabase.rpc('cleanup_old_price_history');

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      crops_synced: successCount,
      errors: errorCount,
      message: `Synced ${successCount}/${crops.length} crops successfully`
    };

    console.log('[Cron] Sync complete:', response);

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('[Cron] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
