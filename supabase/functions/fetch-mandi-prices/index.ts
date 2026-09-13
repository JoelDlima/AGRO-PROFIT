// @ts-nocheck - Deno runtime types (these imports work in Deno, ignore TS errors)
// Supabase Edge Function to fetch Mandi prices (bypasses CORS)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    let body;
    try {
      body = await req.json()
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body', records: [], total: 0, count: 0 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { commodity, state, limit = 200 } = body

    if (!commodity) {
      return new Response(
        JSON.stringify({ error: 'Commodity is required', records: [], total: 0, count: 0 }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch from Government API
    const API_KEY = Deno.env.get('DATA_GOV_API_KEY') || ''
    const params = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      limit: limit.toString(),
      offset: '0',
    })

    params.append('filters[commodity]', commodity)
    if (state) params.append('filters[state]', state)

    const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?${params.toString()}`
    
    console.log('[fetch-mandi-prices] Fetching from Gov API:', commodity)
    
    let response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(60000), // 60 second timeout
      })
    } catch (fetchError) {
      console.error('[fetch-mandi-prices] Fetch error:', fetchError)
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch from Government API: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`, 
          records: [], 
          total: 0, 
          count: 0 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!response.ok) {
      console.error('[fetch-mandi-prices] API returned non-OK status:', response.status)
      return new Response(
        JSON.stringify({ 
          error: `Government API returned ${response.status}`, 
          records: [], 
          total: 0, 
          count: 0 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    console.log(`[fetch-mandi-prices] Got ${data.records?.length || 0} records for ${commodity}`)

    // Try to cache to Supabase (non-blocking, don't fail if caching fails)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (supabaseUrl && supabaseKey && data.records && data.records.length > 0) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        console.log(`[fetch-mandi-prices] Caching ${data.records.length} records for ${commodity}`)
        
        // Delete old data
        const deleteResult = await supabase
          .from('mandi_prices_cache')
          .delete()
          .eq('commodity', commodity)
        
        if (deleteResult.error) {
          console.warn('[fetch-mandi-prices] Delete error (continuing anyway):', deleteResult.error.message)
        }

        // Insert new data in batches
        const cacheData = data.records.map((record: any) => ({
          commodity: record.commodity,
          state: record.state || null,
          district: record.district,
          market: record.market,
          variety: record.variety,
          grade: record.grade || null,
          arrival_date: record.arrival_date,
          min_price: parseFloat(record.min_price) || 0,
          max_price: parseFloat(record.max_price) || 0,
          modal_price: parseFloat(record.modal_price) || 0,
          fetched_at: new Date().toISOString(),
        }))

        // Insert in batches of 100
        for (let i = 0; i < cacheData.length; i += 100) {
          const batch = cacheData.slice(i, i + 100)
          const insertResult = await supabase.from('mandi_prices_cache').insert(batch)
          if (insertResult.error) {
            console.warn(`[fetch-mandi-prices] Insert batch ${i/100 + 1} error:`, insertResult.error.message)
          }
        }
        
        console.log(`[fetch-mandi-prices] Successfully cached data for ${commodity}`)
      } catch (cacheError) {
        // Don't fail the request if caching fails - just log and continue
        console.error('[fetch-mandi-prices] Caching failed (returning data anyway):', cacheError)
      }
    } else {
      if (!supabaseUrl || !supabaseKey) {
        console.warn('[fetch-mandi-prices] Supabase credentials not set, skipping cache')
      }
    }

    // Always return the data from the Government API
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[fetch-mandi-prices] Unexpected error:', error)
    console.error('[fetch-mandi-prices] Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        records: [], 
        total: 0, 
        count: 0,
        debug: {
          hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
          hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        }
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
