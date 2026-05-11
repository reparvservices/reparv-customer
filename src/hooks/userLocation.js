// hooks/useUserLocation.js
import {useEffect, useState} from 'react';
import {Platform, PermissionsAndroid} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Returns { coords: { latitude, longitude } | null, loading: bool }
 * Requests location permission on Android automatically.
 */
export const useUserLocation = () => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'Allow Reparv to access your location.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            if (!cancelled) setLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          position => {
            if (!cancelled) {
              setCoords({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setLoading(false);
            }
          },
          () => {
            if (!cancelled) setLoading(false);
          },
          {enableHighAccuracy: false, timeout: 6000, maximumAge: 300000},
        );
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  return {coords, loading};
};

/**
 * Haversine distance in km between two lat/lng pairs.
 * Returns null if any coordinate is missing / invalid.
 */
export const haversineKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  )
    return null;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Formats a raw km distance (number) into a human-readable string.
 * e.g. 0.35 → "350 m"   |   2.7 → "2.7 km"
 */
export const formatDistance = km => {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
};
