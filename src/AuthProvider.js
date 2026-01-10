// src/AuthProvider.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from './config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null); // null = loading
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState('');

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      setDevicesError('');
      const res = await axios.get(`${API_BASE_URL}/getDevices`, {
        withCredentials: true,
      });

      if (res.data?.status) {
        setDevices(res.data.data || []);
      } else {
        setDevices([]);
        setDevicesError(res.data?.message || 'Failed to load devices');
      }
    } catch (err) {
      setDevices([]);
      setDevicesError(
        err?.response?.data?.message || err.message || 'Network error'
      );
    } finally {
      setDevicesLoading(false);
    }
  };

  // 🔹 Check auth ONCE
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/checkSession`, {
          withCredentials: true,
        });

        if (res.data?.status) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch {
        setAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // 🔹 Fetch devices only after auth
  useEffect(() => {
    if (!authenticated) return;

    fetchDevices();
    const interval = setInterval(fetchDevices, 3600000);
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
