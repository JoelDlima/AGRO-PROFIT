import { useState, useEffect } from 'react';
import { getCurrentLocation, reverseGeocode, type LocationData } from '@/services/locationService';

interface UseLocationResult {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const coords = await getCurrentLocation();
      const locationData = await reverseGeocode(coords.latitude, coords.longitude);
      setLocation(locationData);
      setHasPermission(true);
      
      // Save to localStorage for future use
      localStorage.setItem('userLocation', JSON.stringify(locationData));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setHasPermission(false);
    } finally {
      setLoading(false);
    }
  };

  // Restore a previously saved location; acquire a new one only on explicit request.
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const loc = JSON.parse(savedLocation);
        setLocation(loc);
        setHasPermission(true);
      } catch {
        // Invalid data, ignore
      }
    }

  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission,
  };
}
