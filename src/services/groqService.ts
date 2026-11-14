/**
 * Groq AI Service
 * Provides intelligent farming assistance and price recommendations
 * 
 * Proxied through Supabase Edge Function (groq-chat) to keep API key secure
 */

import { supabase, supabaseLiveEnabled } from '@/integrations/supabase/client';
import { requireLiveService } from '@/lib/demoConfig';

const GROQ_EDGE_FUNCTION_URL = `${import.meta.env.VITE_LIVE_SUPABASE_URL}/functions/v1/groq-chat`;

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
  requireLiveService(supabaseLiveEnabled, 'AI chat');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('AI chat requires a signed-in session.');
  const response = await fetch(GROQ_EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ message, context }),
  });
  if (!response.ok) throw new Error('AI chat is unavailable.');
  const data = await response.json();
  if (!data.success || !data.response) throw new Error('AI chat is unavailable.');
  return data.response;
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
 * Translate response to user's preferred language (simplified version)
 */
export function translateResponse(text: string, language: string): string {
  // This is a placeholder - for production, use Google Translate API
  // or integrate with i18n library
  
  if (language === "en") return text;
  
  // For now, return with a note that translation is needed
  return text + "\n\n(Translation to local language available soon)";
}
