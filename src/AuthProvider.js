// src/AuthProvider.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from './config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null); // null = loading
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState('');

  const navigate = useNavigate();

  // Fetch devices from API
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
      setDevicesError(res.data?.message || 'Failed to load devices');
    }
  } catch (err) {
    setDevicesError(err?.response?.data?.message || err.message || 'Network error');
  } finally {
    setDevicesLoading(false);

  }
};


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/checkSession`, {
          withCredentials: true,
        });

        if (response.data.status) {
          setAuthenticated(true);
          navigate('/livedata', { replace: true });

          // Fetch devices right after login success
          fetchDevices();

          // Refresh devices every 1 hour (3600000 ms)
          const interval = setInterval(fetchDevices, 3600000);
          return () => clearInterval(interval);
        } else {
          setAuthenticated(false);
          navigate('/', { replace: true });
        }
      } catch (err) {
        setAuthenticated(false);
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDevices();
      const interval = setInterval(fetchDevices, 3600000);
      return () => clearInterval(interval);
    }
  }, [authenticated]);


  if (authenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-900"></div>
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
        refreshDevices: fetchDevices, // manual refresh option
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
