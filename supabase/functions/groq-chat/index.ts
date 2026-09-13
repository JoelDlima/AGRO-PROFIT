/**
 * Groq Chat Edge Function
 * Proxies requests to Groq API (llama-3.3-70b) to keep API key secure
 * 
 * Set the GROQ_API_KEY secret in Supabase Dashboard:
 * supabase secrets set GROQ_API_KEY=your_key_here
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatRequest {
  message: string;
  context?: {
    userState?: string;
    userCrops?: string[];
    marketData?: any[];
    weatherData?: string;
    language?: string;
  };
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

const SYSTEM_CONTEXT = `You are an intelligent agricultural assistant for Indian farmers. Your name is AgroProfit AI.

Your responsibilities:
1. Help farmers make informed decisions about crop selling
2. Explain market prices in simple, farmer-friendly language
3. Provide recommendations on when and where to sell crops
4. Explain government schemes and subsidies
5. Give weather-based farming advice
6. Answer questions in Hindi, English, Marathi, or Konkani based on user preference

Guidelines:
- Be concise and practical
- Use simple language suitable for rural communities
- Include specific numbers when discussing prices
- Always prioritize farmer profit and welfare
- If you don't know something, be honest
- Encourage sustainable farming practices

Format your responses with:
- Clear sections using markdown
- Bullet points for lists
- Numbers formatted in Indian style (₹1,00,000)
- Professional and concise language`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const { message, context, conversationHistory }: ChatRequest = await req.json();

    // Build enhanced prompt with context
    let enhancedPrompt = "";
    
    if (context) {
      if (context.language) {
        // Map language codes to full language names
        const languageNames: Record<string, string> = {
          'en': 'English',
          'hi': 'Hindi (हिंदी)',
          'mr': 'Marathi (मराठी)',
          'kok': 'Konkani (कोंकणी)'
        };
        const langName = languageNames[context.language] || 'English';
        enhancedPrompt += `IMPORTANT: You MUST respond entirely in ${langName}. All text, explanations, and advice should be in ${langName}. Do not mix languages unless showing specific terms.\n\n`;
      }
      if (context.userState) {
        enhancedPrompt += `User location: ${context.userState}\n`;
      }
      if (context.userCrops && context.userCrops.length > 0) {
        enhancedPrompt += `User's crops: ${context.userCrops.join(", ")}\n`;
      }
      if (context.weatherData) {
        enhancedPrompt += `Current weather: ${context.weatherData}\n`;
      }
      if (context.marketData && context.marketData.length > 0) {
        enhancedPrompt += `\nRecent Market Prices:\n`;
        context.marketData.slice(0, 10).forEach((item: any) => {
          enhancedPrompt += `- ${item.commodity} at ${item.market}, ${item.state}: ₹${item.modal_price}/quintal\n`;
        });
      }
      enhancedPrompt += `\n`;
    }
    
    enhancedPrompt += `User Question: ${message}`;

    // Build messages array (OpenAI-compatible format)
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_CONTEXT },
    ];

    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current user message
    messages.push({ role: "user", content: enhancedPrompt });

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.95,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", errorText);
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // Extract response text
    const responseText = data.choices?.[0]?.message?.content || 
                        "Sorry, I couldn't generate a response.";

    return new Response(
      JSON.stringify({ 
        response: responseText,
        success: true 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in groq-chat function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
