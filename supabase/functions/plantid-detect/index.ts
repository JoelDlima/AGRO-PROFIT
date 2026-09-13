import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * plantid-detect Edge Function
 * Secure proxy for Plant.id API calls.
 * Keeps PLANTID_API_KEY server-side (Supabase Vault).
 *
 * Required secrets: PLANTID_API_KEY
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const PLANTID_API_KEY = Deno.env.get('PLANTID_API_KEY');
    if (!PLANTID_API_KEY) {
      throw new Error('PLANTID_API_KEY not configured');
    }

    const { image, action } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let apiUrl = '';
    let requestBody = {};

    if (action === 'identify') {
      apiUrl = 'https://plant.id/api/v3/identification';
      requestBody = { images: [image], similar_images: false };
    } else if (action === 'health') {
      apiUrl = 'https://plant.id/api/v3/health_assessment';
      requestBody = { images: [image], health: 'all' };
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use "identify" or "health"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calling Plant.id API: ${action}`);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANTID_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plant.id API error:', errorText);
      throw new Error(`Plant.id API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
