import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

/**
 * Base polling interval: 60 seconds
 * Backoff doubles on failure up to 5 minutes
 */
const BASE_INTERVAL = 60_000;
const MAX_BACKOFF = 5 * 60_000;

export default function useLiveDataPolling(deviceId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // refs → no re-renders, safe across async calls
  const timeoutRef = useRef(null);
  const retryDelayRef = useRef(BASE_INTERVAL);
  const isMountedRef = useRef(false);

  /**
   * Core polling function
   * Uses setTimeout (not setInterval)
   */
  const fetchLiveData = async () => {
    if (!deviceId || !isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/live-data/${deviceId}`,
        { withCredentials: true }
      );

      if (!isMountedRef.current) return;

      const normalized = normalizeLiveData(response.data);
      setData(normalized);

      // reset backoff on success
      retryDelayRef.current = BASE_INTERVAL;
    } catch (err) {
      if (!isMountedRef.current) return;

      // Auth failure → STOP polling completely
      if (err.response?.status === 401) {
        setError("Session expired");
        clearTimeout(timeoutRef.current);
        return;
      }

      setError("Failed to fetch live data");

      // exponential backoff
      retryDelayRef.current = Math.min(
        retryDelayRef.current * 2,
        MAX_BACKOFF
      );
    } finally {
      setLoading(false);
      scheduleNextPoll();
    }
  };

  /**
   * Schedule next poll safely
   */
  const scheduleNextPoll = () => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // don’t poll hidden tabs
      if (document.visibilityState === "visible") {
        fetchLiveData();
      }
    }, retryDelayRef.current);
  };

  /**
   * Handle tab visibility
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveData();
      } else {
        clearTimeout(timeoutRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  /**
   * Start / stop polling lifecycle
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (deviceId) {
      fetchLiveData();
    }

    return () => {
      isMountedRef.current = false;
      clearTimeout(timeoutRef.current);
    };
  }, [deviceId]);

  return { data, loading, error };
}

/**
 * Backend → frontend normalization
 * UI NEVER touches raw API response
 */
function normalizeLiveData(raw) {
  return {
    device: {
      id: raw.device_id,
      status: raw.status,
      lastSeen: raw.last_seen,
      location: {
        latitude: raw.latitude,
        longitude: raw.longitude,
        address: raw.address,
      },
    },
    sensors: {
      temperature: raw.temperature,
      humidity: raw.humidity,
      rainfall: raw.rainfall,
      lightIntensity: raw.light_intensity,
      windSpeed: raw.wind_speed,
      pressure: raw.pressure,
      leafWetness: raw.leaf_wetness,
      depth: {
        temperature: raw.depth_temperature,
        humidity: raw.depth_humidity,
      },
      surface: {
        temperature: raw.surface_temperature,
        humidity: raw.surface_humidity,
      },
    },
  };
}
