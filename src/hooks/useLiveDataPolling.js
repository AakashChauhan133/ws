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

      // 1. Retrieve the JWT Token saved from LoginForm
      const token = localStorage.getItem("access_token");

      // 2. Fetch the latest history batch (FastAPI route)
      const response = await axios.get(
        `${API_BASE_URL}/readings/${deviceId}/history`,
        {
          params: { limit: 10 }, // Pulling recent batch to extract latest live state
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!isMountedRef.current) return;

      const resultsArray = response.data?.data;
      if (!resultsArray || resultsArray.length === 0) {
        throw new Error("No live data received");
      }

      // 3. Normalize the array into a single "Live State" object
      const normalized = normalizeLiveData(resultsArray);
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
      } else if (err.response?.status === 422) {
        // FastAPI specific Validation Error logging
        console.error("Validation Error:", err.response.data.detail);
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
 * Takes an ARRAY of recent readings and reduces it to the single latest state.
 */
function normalizeLiveData(rawArray) {
  // Since order is newest-first, we grab the first item
  const latest = rawArray[0];

  // SCENARIO A: Normalized EAV Database (device_sensor_id)
  if (latest.device_sensor_id !== undefined) {
    const recentReadings = {};

    // Parse through the recent 50 rows to find the most recent value for each sensor ID
    rawArray.forEach((reading) => {
      if (recentReadings[reading.device_sensor_id] === undefined) {
        recentReadings[reading.device_sensor_id] = reading.value;
      }
    });

    // Best-effort mapping based on known IDs (e.g., 3=temp, 4=humidity)
    return {
      device: {
        id: latest.device_id || latest.d_id,
        status: "active",
        lastSeen: latest.recorded_at,
        location: { latitude: null, longitude: null, address: "Available" },
      },
      sensors: {
        temperature: recentReadings[3] ?? null,
        humidity: recentReadings[4] ?? null,
        // Add additional mapped IDs as needed (e.g., rainfall, wind)
      },
    };
  }

  // SCENARIO B: Flat/Grouped Database
  return {
    device: {
      id: latest.device_id || latest.d_id,
      status: latest.device_status || "active",
      lastSeen: latest.timestamp || latest.recorded_at,
      location: {
        latitude: latest.latitude,
        longitude: latest.longitude,
        address: latest.address,
      },
    },
    sensors: {
      temperature: latest.temp,
      humidity: latest.humidity,
      rainfall: latest.rainfall,
      lightIntensity: latest.light_intensity,
      windSpeed: latest.wind_speed,
      windDirection: latest.wind_direction,
      pressure: latest.pressure,
      leafWetness: latest.leafwetness,
      depth: {
        temperature: latest.depth_temp,
        humidity: latest.depth_humidity,
      },
      surface: {
        temperature: latest.surface_temp,
        humidity: latest.surface_humidity,
      },
    },
  };
}
