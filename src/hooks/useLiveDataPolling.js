import { useEffect, useRef, useState, useCallback } from "react";
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

  // refs → stable across renders
  const timeoutRef = useRef(null);
  const retryDelayRef = useRef(BASE_INTERVAL);
  const isMountedRef = useRef(false);

  /**
   * Schedule next poll safely
   */
  const scheduleNextPoll = useCallback((fetchFn) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      // pause polling when tab hidden
      if (document.visibilityState === "visible") {
        fetchFn();
      }
    }, retryDelayRef.current);
  }, []);

  /**
   * Core polling function - wrapped in useCallback to stabilize
   */
  const fetchLiveData = useCallback(async () => {
    if (!deviceId || !isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_BASE_URL}/live-data/${deviceId}`,
        { withCredentials: true }
      );

      if (!isMountedRef.current) return;

      // Extract the real live object
      const live = response.data?.data?.[0];
      if (!live) {
        throw new Error("No live data received");
      }

      // Correct normalization
      const normalized = normalizeLiveData(live);
      setData(normalized);

      // reset backoff on success
      retryDelayRef.current = BASE_INTERVAL;
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error("Live data fetch error:", err);

      // Auth failure → STOP polling
      if (err.response?.status === 401) {
        setError("Session expired");
        clearTimeout(timeoutRef.current);
        return;
      }

      setError("Failed to fetch live data");

      // exponential backoff
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_BACKOFF);
    } finally {
      // Prevent zombie polling
      if (isMountedRef.current) {
        setLoading(false);
        scheduleNextPoll(fetchLiveData);
      }
    }
  }, [deviceId, scheduleNextPoll]);

  /**
   * Handle tab visibility changes
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
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchLiveData]);

  /**
   * Lifecycle start / stop
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
  }, [deviceId, fetchLiveData]);

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
      status: raw.device_status,
      lastSeen: raw.timestamp,
      location: {
        latitude: raw.latitude,
        longitude: raw.longitude,
        address: raw.address,
      },
    },
    sensors: {
      temperature: raw.temp,
      humidity: raw.humidity,
      rainfall: raw.rainfall,
      lightIntensity: raw.light_intensity,
      windSpeed: raw.wind_speed,
      windDirection: raw.wind_direction,
      pressure: raw.pressure,
      leafWetness: raw.leafwetness,
      depth: {
        temperature: raw.depth_temp,
        humidity: raw.depth_humidity,
      },
      surface: {
        temperature: raw.surface_temp,
        humidity: raw.surface_humidity,
      },
    },
  };
}
