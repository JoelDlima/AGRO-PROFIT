/**
 * WeatherAPI.com Service
 * Provides weather data for farming decisions and advisory
 * Provides weather data for farming decisions and advisory
 * Proxied through Vercel Serverless /api/weather with Open-Meteo fallback
 */

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  description: string;
  icon: string;
  wind_speed: number;
  clouds: number;
  rain?: number;
}

export interface WeatherForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  rain_probability: number;
  humidity: number;
}

export interface WeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_mph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
  };
}

/**
 * Fetch current weather for a location via /api/weather proxy or direct Open-Meteo
 */
export async function getCurrentWeather(
  location: string,
  latitude?: number,
  longitude?: number
): Promise<WeatherData | null> {
  // Tier 1: Try same-origin serverless proxy /api/weather
  try {
    let url = `/api/weather?location=${encodeURIComponent(location || 'India')}`;
    if (latitude !== undefined && longitude !== undefined && !isNaN(latitude) && !isNaN(longitude)) {
      url = `/api/weather?lat=${latitude}&lon=${longitude}&location=${encodeURIComponent(location || 'India')}`;
    }
    const res = await fetch(url);
    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (apiErr) {
    // Fall back to direct Open-Meteo
  }

  // Tier 2: Direct Open-Meteo API
  try {
      let omUrl: string;
      if (latitude !== undefined && longitude !== undefined && !isNaN(latitude) && !isNaN(longitude)) {
        omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m`;
      } else {
        const STATE_COORDINATES: Record<string, { lat: number; lon: number }> = {
        maharashtra: { lat: 19.7515, lon: 75.7139 },
        delhi: { lat: 28.7041, lon: 77.1025 },
        punjab: { lat: 31.1471, lon: 75.3412 },
        haryana: { lat: 29.0588, lon: 76.0856 },
        rajasthan: { lat: 27.0238, lon: 74.2179 },
        gujarat: { lat: 22.2587, lon: 71.1924 },
        karnataka: { lat: 15.3173, lon: 75.7139 },
        'uttar pradesh': { lat: 26.8467, lon: 80.9462 },
        'madhya pradesh': { lat: 22.9734, lon: 78.6569 },
        'andhra pradesh': { lat: 15.9129, lon: 79.7400 },
        telangana: { lat: 18.1124, lon: 79.0193 },
        'tamil nadu': { lat: 11.1271, lon: 78.6569 },
        kerala: { lat: 10.8505, lon: 76.2711 },
        'west bengal': { lat: 22.9868, lon: 87.8550 },
        bihar: { lat: 25.0961, lon: 85.3131 },
        odisha: { lat: 20.9517, lon: 85.0985 },
        goa: { lat: 15.2993, lon: 74.1240 },
        india: { lat: 20.5937, lon: 78.9629 },
      };

        const locKey = (location || '').toLowerCase().trim();
        const coords = STATE_COORDINATES[locKey] || STATE_COORDINATES['india'];
        omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m`;
      }
      
      const omRes = await fetch(omUrl);
      if (omRes.ok) {
        const omData = await omRes.json();
        const current = omData.current;
        const code = current.weather_code || 0;
        let desc = "Clear sky";
        let icon = "//cdn.weatherapi.com/weather/64x64/day/113.png";
        if (code > 0 && code <= 3) { desc = "Partly cloudy"; icon = "//cdn.weatherapi.com/weather/64x64/day/116.png"; }
        else if (code <= 48) { desc = "Foggy"; icon = "//cdn.weatherapi.com/weather/64x64/day/143.png"; }
        else if (code <= 55) { desc = "Light drizzle"; icon = "//cdn.weatherapi.com/weather/64x64/day/266.png"; }
        else if (code <= 65) { desc = "Rain"; icon = "//cdn.weatherapi.com/weather/64x64/day/296.png"; }
        else if (code <= 82) { desc = "Showers"; icon = "//cdn.weatherapi.com/weather/64x64/day/353.png"; }
        else if (code >= 95) { desc = "Thunderstorm"; icon = "//cdn.weatherapi.com/weather/64x64/day/389.png"; }

        return {
          temp: Math.round(current.temperature_2m),
          feels_like: Math.round(current.apparent_temperature),
          humidity: current.relative_humidity_2m,
          pressure: Math.round(current.surface_pressure),
          description: desc,
          icon,
          wind_speed: Math.round(current.wind_speed_10m * 10) / 10,
          clouds: 20,
          rain: current.precipitation > 0 ? current.precipitation : undefined,
        };
      }
    } catch (fallbackError) {
      console.error("Open-Meteo fallback error:", fallbackError);
    }
    return null;
  }

/**
 * Get weather-based farming advisory
 */
export function getWeatherAdvisory(weather: WeatherData): {
  risk: "low" | "medium" | "high";
  message: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let risk: "low" | "medium" | "high" = "low";

  // High humidity risk
  if (weather.humidity > 80) {
    risk = "high";
    recommendations.push("⚠️ High humidity - Crops may spoil during transport");
    recommendations.push("Consider delaying transport if possible");
  } else if (weather.humidity > 65) {
    risk = "medium";
    recommendations.push("⚡ Moderate humidity - Monitor crop quality during transport");
  }

  // Rain risk
  if (weather.rain && weather.rain > 0) {
    risk = "high";
    recommendations.push("🌧️ Rain detected - Avoid transporting perishable crops");
    recommendations.push("Wait for weather to clear");
  }

  // Temperature risk
  if (weather.temp > 35) {
    risk = risk === "high" ? "high" : "medium";
    recommendations.push("🌡️ High temperature - Risk of rapid spoilage");
    recommendations.push("Use covered transport or transport early morning");
  } else if (weather.temp < 10) {
    risk = "medium";
    recommendations.push("❄️ Cold weather - Some crops may need protection");
  }

  // Good conditions
  if (recommendations.length === 0) {
    recommendations.push("✅ Weather conditions favorable for transport");
    recommendations.push("Good time to sell perishable crops");
  }

  const messages = {
    low: "✅ Weather conditions are favorable for transport and selling",
    medium: "⚡ Weather requires some caution - plan accordingly",
    high: "⚠️ Weather conditions risky - consider delaying if possible",
  };

  return {
    risk,
    message: messages[risk],
    recommendations,
  };
}

/**
 * Get weather icon URL
 */
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Format weather for chatbot context
 */
export function formatWeatherForChatbot(
  location: string,
  weather: WeatherData
): string {
  const advisory = getWeatherAdvisory(weather);
  
  return `Current weather in ${location}:
- Temperature: ${weather.temp}°C (feels like ${weather.feels_like}°C)
- Humidity: ${weather.humidity}%
- Conditions: ${weather.description}
- Wind: ${weather.wind_speed} m/s
${weather.rain ? `- Rainfall: ${weather.rain}mm` : ""}

Weather Advisory: ${advisory.message}
${advisory.recommendations.join("\n")}`;
}

/**
 * Check if weather is suitable for transport
 */
export function isTransportSafe(weather: WeatherData): boolean {
  const advisory = getWeatherAdvisory(weather);
  return advisory.risk === "low";
}
