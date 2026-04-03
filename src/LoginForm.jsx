import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Note: Removed getCSRFToken as FastAPI's JWT implementation replaces the need for it.
import API_BASE_URL from "./config";
import { useAuth } from "./AuthProvider";

export default function LoginForm({ onBack, onToggleRegister }) {
  const navigate = useNavigate();
  const { setAuthenticated } = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const handleForgotPassword = () => {
    setRedirect(true);
    setTimeout(() => {
      setRedirect(false);
      navigate("forgotpassword"); // basename-safe
    }, 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    //  HARD RESET — prevents stale UI
    setError("");
    setSuccess(false);
    setLoading(true);

    if (!userId || !password) {
      setError("Please enter both User ID and Password.");
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Prepare form data (FastAPI strictly requires 'username' and 'password' for OAuth2)
      const formData = new URLSearchParams();
      formData.append("username", userId);
      formData.append("password", password);

      // 2️⃣ Login request
      const res = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // withCredentials: true, // Optional: Keep if you are using cookies alongside JWT
      });

      const result = res.data;

      // ✅ SUCCESS — EXIT IMMEDIATELY
      // FastAPI returns 200 OK with access_token and token_type
      if (res.status === 200 && result?.access_token) {
        // Store the JWT token for future authenticated requests
        localStorage.setItem("access_token", result.access_token);

        // Optionally store user details if needed by your frontend
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        setError(""); // force clear
        setSuccess(true);

        setAuthenticated(true);
        setTimeout(() => {
          navigate("/livedata", { replace: true }); // relative path (basename safe)
        }, 800);

        return;
      }

      setError("Login failed. Please try again.");
    } catch (err) {
      console.error("Login error:", err);

      // FastAPI returns errors inside the "detail" key.
      // It can be a string (401 Unauthorized) or an array (422 Validation Error).
      const detail = err?.response?.data?.detail;

      let errorMessage = "An error occurred during login.";

      if (typeof detail === "string") {
        errorMessage = detail; // e.g., "Invalid credentials"
      } else if (Array.isArray(detail)) {
        errorMessage = "Validation Error: Please check your inputs.";
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message; // Fallback for custom errors
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-left w-full max-w-md mx-auto h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>

      {/* Messages */}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-3">Login successful 🎉</p>
      )}
      {redirect && (
        <p className="text-green-600 text-sm mb-3">Redirecting...</p>
      )}

      <form className="space-y-6" onSubmit={handleLogin}>
        {/* User ID */}
        <div className="relative">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 peer bg-white text-black"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-xs text-green-800">
            User ID (Email)
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 peer bg-white text-black"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-xs text-green-800">
            Password
          </label>
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-green-700"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading ? "bg-green-400" : "bg-green-800 hover:bg-green-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Links Footer */}
        <div className="flex flex-col space-y-3 mt-4 text-sm">
          <div className="flex justify-between">
            <button
              type="button"
              className="text-green-700 hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
            <button
              type="button"
              onClick={onToggleRegister}
              className="text-green-700 hover:underline font-semibold"
            >
              Create Account
            </button>
          </div>
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBack}
              className="text-red-600 hover:underline"
            >
              Back to Card
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
