/**
 * Groq AI Service
 * Provides intelligent farming assistance and price recommendations
 * 
 * Proxied through Supabase Edge Function (groq-chat) to keep API key secure
 */

import { getAllCachedPricesForAI } from './mandiCacheService';
import { supabase } from '@/integrations/supabase/client';

const GROQ_EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/groq-chat`;
const DIRECT_GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_MODEL = import.meta.env.VITE_GROQ_MODEL || "openai/gpt-oss-20b";

/**
 * Send a chat message to Groq AI via direct API or Supabase Edge Function
 */
export async function sendChatMessage(
  message: string,
  context?: {
    userState?: string;
    userCrops?: string[];
    marketData?: any[];
    weatherData?: string;
    language?: string;
  }
): Promise<string> {
  try {
    // 1. If direct Groq API key is available, call Groq directly
    if (DIRECT_GROQ_KEY) {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DIRECT_GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: "system",
              content: `You are AgroProfit AI, a concise agricultural advisor for Indian farmers.
Location: ${context?.userState || "India"}.
Crops: ${context?.userCrops?.join(", ") || "General"}.
${context?.weatherData ? `Weather context:\n${context.weatherData}` : ""}

RESPONSE RULES (STRICT):
1. Keep your reply SHORT, crisp, and direct (max 3-5 bullet points or 2-3 sentences).
2. Do not write essays, long intros, or disclaimers. Give actionable farming and pricing advice immediately.
3. Formatting:
   - Use **bold** for prices, crops, and key facts (e.g. **₹2,800/quintal**).
   - Use clean bullet points (•) for tips or steps.
4. Language: Respond in ${context?.language === 'hi' ? 'Hindi' : context?.language === 'mr' ? 'Marathi' : context?.language === 'kok' ? 'Konkani' : 'English'}.`,
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 350,
          temperature: 0.5,
        }),
      });

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        const content = groqData?.choices?.[0]?.message?.content;
        if (content) {
          return content;
        }
      }
    }
    // Get cached price data for AI context
    const cachedPrices = await getAllCachedPricesForAI();
    
    // Add cached prices to market data context
    const enhancedContext = {
      ...context,
      marketData: context?.marketData || [],
    };

    // Get the auth session for the API call
    const { data: { session } } = await supabase.auth.getSession();
    
    // Call the Supabase Edge Function
    const response = await fetch(GROQ_EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        message,
        context: enhancedContext,
      }),
    });

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.response) {
      throw new Error(data.error || "No response from AI");
    }

    return data.response;
  } catch (error) {
    console.error("Error calling Groq via edge function:", error);
    return getFallbackResponse(message);
  }
}

/**
 * Provide intelligent price recommendation
 */
export async function getPriceRecommendation(
  crop: string,
  marketData: Array<{
    name: string;
    price: number;
    distance: number;
    state: string;
  }>,
  userLocation?: string
): Promise<string> {
  const sortedByPrice = [...marketData].sort((a, b) => b.price - a.price);
  const bestMarket = sortedByPrice[0];
  const avgPrice = marketData.reduce((sum, m) => sum + m.price, 0) / marketData.length;

  const prompt = `
I need advice on selling ${crop}. Here's the market data:

Best Price Market: ${bestMarket.name} - ₹${bestMarket.price}/kg (${bestMarket.distance} km away)
Average Market Price: ₹${avgPrice.toFixed(2)}/kg
${userLocation ? `My location: ${userLocation}` : ""}

Markets available:
${sortedByPrice.map((m, i) => `${i + 1}. ${m.name} - ₹${m.price}/kg (${m.distance} km)`).join("\n")}

Should I sell today? Which market is best considering price and distance?
`;

  return sendChatMessage(prompt);
}

/**
 * Fallback responses when AI API is not available
 */
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("price") || lowerMessage.includes("mandi")) {
    return `🌾 **Market Price Information**

To help you with current prices, I need:
1. Which crop are you selling?
2. Your location (state/district)

You can check the **Price Comparison** page for live market rates across different mandis.

💡 **Tip**: Sell when modal price is 10-15% above average for maximum profit!`;
  }

  if (lowerMessage.includes("sell") || lowerMessage.includes("where")) {
    return `💰 **Selling Recommendation**

To recommend the best market, consider:
- **Highest modal price** (not just max price)
- **Distance** from your location
- **Transport costs** (typically ₹2-5/km)
- **Market timing** (morning prices are usually better)

Check the **Price Comparison** page to see all nearby markets ranked by profit potential!`;
  }

  if (lowerMessage.includes("weather") || lowerMessage.includes("rain")) {
    return `🌧️ **Weather & Farming**

Weather affects your crops and selling decisions:
- **Before harvest**: Monitor rain to prevent crop damage
- **During transport**: Avoid moving produce in heavy rain
- **Market timing**: Prices rise when supply decreases due to weather

I recommend checking the weather forecast before planning your market visit.`;
  }

  if (lowerMessage.includes("scheme") || lowerMessage.includes("government")) {
    return `📋 **Government Schemes for Farmers**

Popular schemes include:
1. **PM-KISAN** - ₹6,000/year direct benefit
2. **Crop Insurance** - PMFBY protection against losses
3. **MSP (Minimum Support Price)** - Guaranteed minimum price for major crops
4. **Kisan Credit Card** - Low-interest loans

Visit your nearest Krishi Vigyan Kendra (KVK) or agriculture office for enrollment assistance.`;
  }

  return `🙏 Namaste!

I'm AgroProfit AI, your farming assistant. I can help with:

📊 **Market Prices** - Compare mandi rates
💰 **Selling Advice** - Best time and place to sell
🌾 **Crop Information** - Varieties and best practices
🌧️ **Weather Impact** - How weather affects your decisions
📋 **Government Schemes** - Available benefits and subsidies

Please ask me anything specific about your farming needs!

**Quick Actions:**
- "What's the tomato price today?"
- "Where should I sell onions?"
- "Tell me about PM-KISAN scheme"`;
}

/**
 * Translate response to user's preferred language (simplified version)
 */
export function translateResponse(text: string, language: string): string {
  // This is a placeholder - for production, use Google Translate API
  // or integrate with i18n library
  
  if (language === "en") return text;
  
  // For now, return with a note that translation is needed
  return text + "\n\n(Translation to local language available soon)";
}
