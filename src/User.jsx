import React, { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

import AlertsSection from "./AlertsSection";
import DevicesList from "./DevicesList";
import PlanSection from "./PlanSection";
import { useAuth } from "./AuthProvider";
import API_BASE_URL from "./config";

export default function User() {
  const { devices } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationName, setLocationName] = useState("Fetching location...");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_BASE_URL}/getUser`, {
          withCredentials: true,
        });

        if (response.data.status === "success") {
          const userData = response.data.data;
          setUser(userData);

          if (userData.latitude && userData.longitude) {
            fetchLocation(userData.latitude, userData.longitude);
          } else {
            setLocationName("Location not available");
          }
        } else {
          setError(response.data.message || "User not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const fetchLocation = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      );
      setLocationName(res.data.display_name || "Unknown Location");
    } catch {
      setLocationName("Unable to fetch location");
    }
  };

  return (
    /* ✅ SINGLE content container */
    <div className="p-6 bg-green-50 min-h-full overflow-y-auto">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row items-center justify-between flex-1">
          {loading ? (
            <div className="animate-pulse w-full text-center text-gray-500">
              Loading user profile...
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <>
              <div className="flex items-center space-x-4">
                <div>
                  <p className="font-bold text-xl">{user.name}</p>
                  <p>Email: {user.email}</p>
                  <p>Phone: {user.phone}</p>
                  <p className="mt-1">
                    Location: {locationName}
                    <br />
                    <span className="text-gray-500 text-sm">
                      (Lat: {user.latitude}, Lng: {user.longitude})
                    </span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-xl shadow p-6 lg:w-1/3 flex flex-col justify-center">
          <p className="mb-3 font-medium">Role: {user?.role}</p>

          <Link
            to="/forgotpassword"
            className="text-green-600 hover:underline font-medium"
          >
            Change Password
          </Link>
        </div>
      </div>

      {/* Devices */}
      <DevicesList devices={devices} />

      {/* Plan */}
      <PlanSection />

      {/* Alerts */}
      <AlertsSection />
    </div>
  );
}
