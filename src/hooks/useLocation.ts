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

  // Try to load from localStorage on mount and auto-detect if permission already granted
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

    // Check if permission already granted by browser
    if (typeof navigator !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getCurrentLocation()
            .then(coords => reverseGeocode(coords.latitude, coords.longitude))
            .then(locData => {
              setLocation(locData);
              setHasPermission(true);
              localStorage.setItem('userLocation', JSON.stringify(locData));
            })
            .catch(() => {});
        }
      }).catch(() => {});
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
