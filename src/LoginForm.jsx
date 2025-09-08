import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {  useNavigate } from "react-router-dom";
import { getCSRFToken } from "./GetCSRF";
import API_BASE_URL from "./config";
import axios from "axios";
import { useAuth } from "./AuthProvider";

export default function LoginForm({ onBack }) {
  const {setAuthenticated} = useAuth();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const navigate = useNavigate();

   const handleForgotPassword = () => {
        setRedirect(true);
        setTimeout(() => {setRedirect(false); navigate("/forgotpassword");}, 500);
        
   }



const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess(false);

  if (!userId || !password) {
    setError("Please enter both User ID and Password.");
    return;
  }

  setLoading(true);

  try {
      // 1. Get CSRF token from server
      const csrfResponse = await getCSRFToken();
      const csrf = csrfResponse; // { name: 'csrf_token_name', value: 'token_value' }
      // console.log(csrf);
      // 2. Prepare login data (URL-encoded format)
      const formData = new URLSearchParams();
      formData.append("username", userId);
      formData.append("password", password);
      formData.append(csrf.name, csrf.value); // CSRF token field

      // 3. Send login POST request
      const loginResponse = await axios.post(
        `${API_BASE_URL}/login`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true, // send session cookie
        }
      );

      const result = loginResponse.data;

      if (loginResponse.status === 200 && result.status) {
        setSuccess(true);
        setAuthenticated(true);
        setTimeout(() => {          
          navigate("/livedata");
        }, 1000);
        // setSuccess(true);
        // navigate("/livedata");
        // Optionally store user info or redirect
      } else {
        setError(result.message || "Login failed.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login.");
    }

    setLoading(false);
  };



  return (
    <div className="p-6 text-left w-full max-w-md mx-auto h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Login</h2>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-3">Login successful 🎉</p>
      )}
      {redirect && (
        <p className="text-green-600 text-sm mb-3">Redirecting</p>
      )}

      <form className="space-y-6" onSubmit={handleLogin}>
        {/* User ID */}
        <div className="relative">
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 peer bg-white text-black"
            placeholder=" "
          />
          <label
            htmlFor="userId"
            className="absolute left-4 top-2 text-xs text-green-800 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400"
          >
            User ID
          </label>
        </div>

        {/* Password Field */}
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 peer bg-white text-black"
            placeholder=" "
          />
          <label
            htmlFor="password"
            className="absolute left-4 top-2 text-xs text-green-800 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400"
          >
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

        <div className="flex justify-between text-sm mt-2">
          <button type="button" className="text-green-700 hover:underline" onClick={handleForgotPassword}>
            Forgot Password?
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-red-600 hover:underline"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
