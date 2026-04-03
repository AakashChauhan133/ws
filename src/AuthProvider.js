import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "./config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null); // null = loading
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState("");

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      setDevicesError("");
      const token = localStorage.getItem("access_token");

      // Updated to match your FastAPI /devices/ route and use the JWT token
      const res = await axios.get(`${API_BASE_URL}/devices/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle both possible JSON schemas (direct array or nested in { data: [...] })
      const fetchedDevices = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setDevices(fetchedDevices);
    } catch (err) {
      setDevices([]);

      // If the JWT token is invalid or expired, the API will return 401
      if (err.response?.status === 401) {
        setAuthenticated(false);
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
      }

      setDevicesError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err.message ||
          "Network error",
      );
    } finally {
      setDevicesLoading(false);
    }
  };

  // 🔹 Check auth ONCE using JWT from localStorage instead of checkSession endpoint
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");

      if (token) {
        // Token exists locally. We set authenticated to true immediately for a fast UI load.
        // If the token is actually expired, the subsequent fetchDevices() call will catch the 401 and log them out.
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 🔹 Fetch devices only after auth is confirmed to be true
  useEffect(() => {
    if (!authenticated) return;

    fetchDevices();
    const interval = setInterval(fetchDevices, 3600000); // refresh every hour
    return () => clearInterval(interval);
  }, [authenticated]);

  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-900" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        devices,
        devicesLoading,
        devicesError,
        refreshDevices: fetchDevices,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
