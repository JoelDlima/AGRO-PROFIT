/**
 * Location Service
 * Handles geolocation and distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData extends Coordinates {
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  displayName?: string;
}

/**
 * Reverse geocode latitude and longitude to get city, district, state
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<LocationData> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const state = data.principalSubdivision;
      const country = data.countryName || 'India';
      const parts = [city, state].filter(Boolean);
      const displayName = parts.length > 0 ? parts.join(', ') : 'Current Location';
      return {
        latitude,
        longitude,
        city,
        district: city,
        state,
        country,
        displayName,
      };
    }
  } catch (err) {
    console.warn('[Location] Reverse geocode network error, falling back to local lookup:', err);
  }

  // Fallback: find closest known Indian city/state by coordinates
  let closestName = 'India';
  let minDistance = Infinity;

  for (const [name, coords] of Object.entries(INDIAN_LOCATIONS)) {
    const d = calculateDistance(latitude, longitude, coords.latitude, coords.longitude);
    if (d < minDistance) {
      minDistance = d;
      closestName = name;
    }
  }

  return {
    latitude,
    longitude,
    city: closestName,
    district: closestName,
    state: closestName,
    country: 'India',
    displayName: closestName,
  };
}

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * Get approximate coordinates for Indian cities/states
 * This is a fallback when geolocation is not available
 */
const INDIAN_LOCATIONS: Record<string, Coordinates> = {
  // Major States
  "Maharashtra": { latitude: 19.7515, longitude: 75.7139 },
  "Karnataka": { latitude: 15.3173, longitude: 75.7139 },
  "Tamil Nadu": { latitude: 11.1271, longitude: 78.6569 },
  "Uttar Pradesh": { latitude: 26.8467, longitude: 80.9462 },
  "Gujarat": { latitude: 22.2587, longitude: 71.1924 },
  "Rajasthan": { latitude: 27.0238, longitude: 74.2179 },
  "West Bengal": { latitude: 22.9868, longitude: 87.8550 },
  "Madhya Pradesh": { latitude: 22.9734, longitude: 78.6569 },
  "Andhra Pradesh": { latitude: 15.9129, longitude: 79.7400 },
  "Punjab": { latitude: 31.1471, longitude: 75.3412 },
  "Haryana": { latitude: 29.0588, longitude: 76.0856 },
  "Bihar": { latitude: 25.0961, longitude: 85.3131 },
  "Odisha": { latitude: 20.9517, longitude: 85.0985 },
  
  // Major Cities
  "Mumbai": { latitude: 19.0760, longitude: 72.8777 },
  "Delhi": { latitude: 28.7041, longitude: 77.1025 },
  "Bangalore": { latitude: 12.9716, longitude: 77.5946 },
  "Hyderabad": { latitude: 17.3850, longitude: 78.4867 },
  "Chennai": { latitude: 13.0827, longitude: 80.2707 },
  "Kolkata": { latitude: 22.5726, longitude: 88.3639 },
  "Pune": { latitude: 18.5204, longitude: 73.8567 },
  "Ahmedabad": { latitude: 23.0225, longitude: 72.5714 },
  "Jaipur": { latitude: 26.9124, longitude: 75.7873 },
  "Surat": { latitude: 21.1702, longitude: 72.8311 },
  "Lucknow": { latitude: 26.8467, longitude: 80.9462 },
  "Kanpur": { latitude: 26.4499, longitude: 80.3319 },
  "Nagpur": { latitude: 21.1458, longitude: 79.0882 },
  "Indore": { latitude: 22.7196, longitude: 75.8577 },
  "Bhopal": { latitude: 23.2599, longitude: 77.4126 },
};

/**
 * Get coordinates for a location name (city or state)
 */
export function getCoordinatesForLocation(location: string): Coordinates | null {
  const normalized = location.trim();
  return INDIAN_LOCATIONS[normalized] || null;
}

/**
 * Geocode a location string (city, district, state)
 * Returns coordinates or null if not found
 */
export function geocodeIndianLocation(
  city?: string,
  district?: string,
  state?: string
): Coordinates | null {
  // Try exact matches first
  if (city && INDIAN_LOCATIONS[city]) {
    return INDIAN_LOCATIONS[city];
  }
  if (district && INDIAN_LOCATIONS[district]) {
    return INDIAN_LOCATIONS[district];
  }
  if (state && INDIAN_LOCATIONS[state]) {
    return INDIAN_LOCATIONS[state];
  }
  
  // Try partial matches
  const searchTerm = (city || district || state || "").toLowerCase();
  for (const [name, coords] of Object.entries(INDIAN_LOCATIONS)) {
    if (name.toLowerCase().includes(searchTerm) || searchTerm.includes(name.toLowerCase())) {
      return coords;
    }
  }
  
  return null;
}
