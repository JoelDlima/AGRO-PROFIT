import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * crophealth-detect Edge Function
 * Secure proxy for crop.health (Kindwise) API calls.
 * Keeps CROPHEALTH_API_KEY server-side (Supabase Vault).
 *
 * crop.health combines identification + disease detection in ONE call.
 * Response includes:
 * - result.crop.suggestions[] for crop identification
 * - result.disease.suggestions[] for disease detection
 *
 * Required secrets: CROPHEALTH_API_KEY
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const CROPHEALTH_API_KEY = Deno.env.get('CROPHEALTH_API_KEY');
    if (!CROPHEALTH_API_KEY) {
      throw new Error('CROPHEALTH_API_KEY not configured');
    }

    const { image } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image data required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Strip data URI prefix if present, keep only base64
    const normalizeImage = (value: string): string => {
      const trimmed = value.trim();
      const dataUrlMatch = trimmed.match(/^data:.*?;base64,(.+)$/i);
      if (dataUrlMatch?.[1]) return dataUrlMatch[1];
      return trimmed;
    };

    const base64Image = normalizeImage(image);
    const apiUrl = 'https://crop.kindwise.com/api/v1/identification';

    console.log('Calling crop.health API: identification (includes disease detection)');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': CROPHEALTH_API_KEY,
      },
      body: JSON.stringify({ images: [base64Image] }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('crop.health API error:', errorText);
      throw new Error(`crop.health API error: ${response.status} - ${errorText}`);
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
