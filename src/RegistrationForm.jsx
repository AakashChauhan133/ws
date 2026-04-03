import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "./config";

export default function RegisterForm({ onBack, onToggleLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "user", // Defaulting role to 'user' as per schema
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Basic Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone
    ) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Sending JSON payload as specified in the schema
      const res = await axios.post(`${API_BASE_URL}/register`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        setSuccess(true);
        setError("");

        // Automatically switch back to login form after a brief delay
        setTimeout(() => {
          onToggleLogin();
        }, 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Registration failed. Please check your inputs.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-left w-full max-w-md mx-auto h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-4 text-green-800">Create Account</h2>

      {/* Messages */}
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {success && (
        <p className="text-green-600 text-sm mb-3">
          Account created! Redirecting to login...
        </p>
      )}

      <form className="space-y-4" onSubmit={handleRegister}>
        {/* Full Name */}
        <div className="relative">
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black peer"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-xs text-green-800">
            Full Name
          </label>
        </div>

        {/* Email */}
        <div className="relative">
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black peer"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-xs text-green-800">
            Email Address
          </label>
        </div>

        {/* Password */}
        <div className="relative">
          <input
            name="password"
            type={showPass ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black peer"
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

        {/* Phone */}
        <div className="relative">
          <input
            name="phone"
            type="text"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 pt-5 pb-2 text-sm border border-green-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400 bg-white text-black peer"
            placeholder=" "
          />
          <label className="absolute left-4 top-2 text-xs text-green-800">
            Phone Number
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold ${
            loading ? "bg-green-400" : "bg-green-800 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="flex justify-between text-sm mt-2">
          <button
            type="button"
            onClick={onToggleLogin}
            className="text-green-700 hover:underline"
          >
            Already have an account?
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-red-600 hover:underline"
          >
            Back to Card
          </button>
        </div>
      </form>
    </div>
  );
}
