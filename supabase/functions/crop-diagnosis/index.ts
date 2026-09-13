import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * crop-diagnosis Edge Function
 * Generates AI-powered treatment explanations for detected crop diseases.
 * Uses Groq (llama-3.3-70b) for fast, high-quality responses.
 *
 * Required secret: GROQ_API_KEY
 */

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');

    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const { plantData, language = 'en', weather } = await req.json();

    if (!plantData) {
      return new Response(
        JSON.stringify({ error: 'plantData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an expert agricultural advisor helping farmers.

**CROP INFORMATION:**
- Plant: ${plantData.cropName}
- Health Status: ${plantData.isHealthy ? 'Healthy' : 'Diseased'}

**DISEASE DETECTED:**
- Name: ${plantData.diseaseName || 'None'}
- Confidence: ${plantData.confidence}%
- Severity: ${plantData.severity}

${weather ? `**WEATHER CONDITIONS:**
- Temperature: ${weather.temperature}°C
- Humidity: ${weather.humidity}%
- Conditions: ${weather.description}
` : ''}

**LANGUAGE:** Respond in ${language}.
${String(language).toLowerCase().includes('hindi') || String(language).toLowerCase() === 'hi' ? 'Write in Hindi using Devanagari script.' : ''}

**TASK:**
Provide a farmer-friendly treatment guide.

CRITICAL FORMATTING RULES:
1. **What is this disease?** (2-3 simple sentences)
2. **Why did it happen?** (explain cause)
3. **Organic Treatment** (2-3 steps with products)
4. **Chemical Treatment** (2-3 steps with fertilizer/pesticide names)
5. **Prevention Tips** (3-4 practical tips)

**IMPORTANT:**
- Use simple farmer-friendly language
- Mention specific product names (neem oil, NPK 19-19-19, etc.)
- Include dosage (ml per liter, grams per plant)
- Add timing information (weekly, every 3 days, etc.)`;

    let explanation = '';
    let apiUsed = 'groq';

    // Call Groq API
    console.log('Calling Groq API...');
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are an expert agricultural advisor. Provide practical, actionable advice for farmers.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    explanation = groqData.choices?.[0]?.message?.content;
    console.log('✅ Groq API succeeded');

    if (!explanation) {
      throw new Error('No explanation received from any AI API');
    }

    return new Response(
      JSON.stringify({ explanation, apiUsed }),
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
