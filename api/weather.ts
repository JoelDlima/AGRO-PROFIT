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

function getWeatherCodeInfo(code: number): { text: string; icon: string } {
  if (code === 0) return { text: "Clear sky", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" };
  if (code <= 3) return { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png" };
  if (code <= 48) return { text: "Foggy", icon: "//cdn.weatherapi.com/weather/64x64/day/143.png" };
  if (code <= 55) return { text: "Light drizzle", icon: "//cdn.weatherapi.com/weather/64x64/day/266.png" };
  if (code <= 65) return { text: "Rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png" };
  if (code <= 82) return { text: "Showers", icon: "//cdn.weatherapi.com/weather/64x64/day/353.png" };
  if (code >= 95) return { text: "Thunderstorm", icon: "//cdn.weatherapi.com/weather/64x64/day/389.png" };
  return { text: "Clear sky", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png" };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { lat, lon } = req.query || req.body || {};
  let coords: { lat: number; lon: number };
  if (lat && lon && !isNaN(Number(lat)) && !isNaN(Number(lon))) {
    coords = { lat: Number(lat), lon: Number(lon) };
  } else {
    const location = (req.query?.location || (req.body && req.body.location) || 'Maharashtra') as string;
    const locKey = location.toLowerCase().trim();
    coords = STATE_COORDINATES[locKey] || STATE_COORDINATES['india'];
  }

  try {
    const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m`;
    const omRes = await fetch(omUrl);
    if (!omRes.ok) {
      return res.status(omRes.status).json({ success: false, error: 'Open-Meteo error' });
    }

    const omData = await omRes.json();
    const current = omData.current;
    const code = current.weather_code || 0;
    const codeInfo = getWeatherCodeInfo(code);

    const weatherData = {
      temp: Math.round(current.temperature_2m),
      feels_like: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      pressure: Math.round(current.surface_pressure),
      description: codeInfo.text,
      icon: codeInfo.icon,
      wind_speed: Math.round(current.wind_speed_10m * 10) / 10,
      clouds: 20,
      rain: current.precipitation > 0 ? current.precipitation : undefined,
    };

    return res.status(200).json({ success: true, data: weatherData });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
