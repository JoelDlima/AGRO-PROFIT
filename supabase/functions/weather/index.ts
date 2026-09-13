/**
 * Weather API Edge Function
 * Proxies requests to WeatherAPI.com to keep API key secure
 * 
 * Set the WEATHER_API_KEY secret in Supabase Dashboard
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const WEATHER_API_KEY = Deno.env.get("WEATHER_API_KEY");
const WEATHER_API_BASE = "https://api.weatherapi.com/v1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeatherRequest {
  location: string;
  type?: "current" | "forecast";
  days?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!WEATHER_API_KEY) {
      throw new Error("WEATHER_API_KEY not configured");
    }

    const { location, type = "current", days = 3 }: WeatherRequest = await req.json();

    if (!location) {
      throw new Error("Location is required");
    }

    let url: string;
    if (type === "forecast") {
      url = `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)},India&days=${days}&aqi=no&alerts=no`;
    } else {
      url = `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)},India&aqi=no`;
    }

    // Call WeatherAPI.com
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Weather API error:", errorText);
      throw new Error(`Weather API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ 
        data,
        success: true 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in weather function:", error);
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
