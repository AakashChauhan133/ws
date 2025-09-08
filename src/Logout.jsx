import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from './config';
import { getCSRFToken } from './GetCSRF';
import { useAuth } from './AuthProvider';

export default function Logout() {
    const {setAuthenticated} = useAuth();
  
  const [status, setStatus] = useState('loggingOut'); // loggingOut, success, error
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();
  const logoutUser = async () => {
      try {
        const csrf = await getCSRFToken();

        const formData = new URLSearchParams();
        formData.append(csrf.name, csrf.value);
        await axios.post(`${API_BASE_URL}/logout`, formData,
          {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true, // send session cookie
        }
        );
        setAuthenticated(false);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

  useEffect(() => {
    logoutUser();
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            navigate('/');
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [status, navigate]);

  const retryLogout = async () => {
    logoutUser();
  };

  const renderContent = () => {
    switch (status) {
      case 'loggingOut':
        return (
          <>
            <Loader2 className="animate-spin w-10 h-10 text-white" />
            <p className="text-white text-xl font-medium">Logging you out securely...</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-10 h-10 text-white" />
            <h2 className="text-white text-2xl font-semibold">You've been logged out.</h2>
            <p className="text-white text-sm">
              Redirecting to home in <span className="font-bold">{countdown}</span> seconds...
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-5 py-2 rounded-lg bg-white text-sm font-semibold text-black hover:bg-gray-100 transition"
            >
              Click here to return now
            </button>
          </>
        );
      case 'error':
        return (
          <>
            <XCircle className="w-10 h-10 text-white" />
            <h2 className="text-white text-xl font-semibold">Logout failed</h2>
            <p className="text-white text-sm">Something went wrong while logging you out.</p>
            <button
              onClick={retryLogout}
              className="mt-4 px-5 py-2 flex items-center gap-2 rounded-lg bg-white text-sm font-semibold text-black hover:bg-gray-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div
        className="max-w-md w-full text-center p-6 rounded-2xl shadow-lg border transition-all"
        style={{ backgroundColor: 'oklch(39.3% 0.095 152.535)' }}
      >
        <div className="flex flex-col items-center gap-4">{renderContent()}</div>
      </div>
    </div>
  );
}
