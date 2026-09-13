// @ts-nocheck - Deno runtime types
// Supabase Edge Function to fetch Rainfall data (bypasses CORS)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const API_KEY = Deno.env.get('DATA_GOV_API_KEY') || ''

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { state, year = 2024, limit = 50 } = await req.json()

    // Fetch from Government Rainfall API
    const params = new URLSearchParams({
      'api-key': API_KEY,
      format: 'json',
      limit: limit.toString(),
      offset: '0',
    })

    if (state) params.append('filters[state]', state)
    if (year) params.append('filters[year]', year.toString())

    const url = `https://api.data.gov.in/resource/d758a71b-8caf-489b-a4c8-929e894e4a0b?${params.toString()}`
    
    console.log('Fetching rainfall data for:', state, year)
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, records: [], total: 0, count: 0 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
