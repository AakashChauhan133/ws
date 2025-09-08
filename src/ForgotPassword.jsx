import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const ForgotPassword = () => {
  const [userId, setUserId] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!userId || !oldPassword || !newPassword || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/api/reset-password", {
        userId,
        oldPassword,
        newPassword,
      });

      setSuccess("Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/"); // Assuming "/" is your login route
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left/Top Green Half */}
      <div className="md:w-1/2 h-64 md:h-auto bg-green-700 text-white flex items-center justify-center text-center p-8">
        <div>
          <h1 className="text-3xl font-bold">Reset Your Password</h1>
          <p className="mt-4 text-sm">
            Enter your current and new password to update your login credentials.
          </p>
        </div>
      </div>

      {/* Right/Bottom White Form */}
      <div className="md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-10">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4"
        >
          <h2 className="text-2xl font-semibold text-green-800 text-center mb-4">
            Reset Password
          </h2>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm text-center">{success}</p>}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Old Password</label>
            <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span
                className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
                onClick={() => setShowOld(!showOld)}
            >
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
        </div>


          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">New Password</label>
            <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span
                className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
                onClick={() => setShowNew(!showNew)}
            >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            </div>


          <div className="relative">
            <label className="block text-gray-700 text-sm font-medium mb-1">Confirm New Password</label>
            <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <span
                className="absolute right-3 top-[38px] cursor-pointer text-gray-600"
                onClick={() => setShowConfirm(!showConfirm)}
            >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
            </div>


          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white transition duration-200 ${
              loading ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() =>{setTimeout(() => {navigate("/")}, 500)}}
              className="text-sm text-green-600 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
