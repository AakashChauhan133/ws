import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { FaUserCircle, FaEdit } from "react-icons/fa";
import AlertsSection from "./AlertsSection";
import DevicesList from "./DevicesList";
import { useAuth } from "./AuthProvider";
import axios from "axios";
import API_BASE_URL from "./config";
import PlanSection from "./PlanSection";
import { Link } from "react-router-dom";

export default function User() {
  const { devices } = useAuth();

  const [user, setUser] = useState(null);   // user data
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

          // ✅ Fetch human-readable location from lat/lng
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

  // ✅ Function to reverse geocode lat/lng
  const fetchLocation = async (lat, lon) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`
      );
      setLocationName(res.data.display_name || "Unknown Location");
    } catch (err) {
      setLocationName("Unable to fetch location");
    }
  };

  return (
    <div className="flex min-h-screen bg-green-50 text-gray-800">
      {/* Sidebar for Desktop */}
      <div className="hidden md:block w-64 flex-shrink-0 bg-green-100 border-r shadow">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        {/* Mobile Sidebar */}
        <div className="-mx-4 -mt-4 md:hidden mb-4">
          <Sidebar />
        </div>

        {/* Top Section: Profile & Account Settings */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Profile Section */}
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
                  <FaUserCircle className="text-green-600 text-6xl" />
                  <div>
                    <p className="font-bold text-xl">{user.name}</p>
                    <p>Email: {user.email}</p>
                    <p>Phone: {user.phone}</p>
                    {/* <p>Role: {user.role}</p> */}
                    <p>
                      Location: {locationName}
                      <br />
                      <span className="text-gray-500 text-sm">
                        (Latitude: {user.latitude} ,Lognitude: {user.longitude})
                      </span>
                    </p>
                  </div>
                </div>
                {/* <button className="mt-4 sm:mt-0 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <FaEdit /> <span>Edit</span>
                </button> */}
              </>
            )}
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow p-6 lg:w-1/3 flex flex-col justify-center">
          <p className="mb-3 font-medium ">Role: {user?.role}</p>
            <Link
              to="/forgotpassword"
              className="text-green-600 hover:underline font-medium mb-3"
            >
              Change Password
            </Link>
            {/* <a
              href="#data-upload"
              className="text-green-600 hover:underline font-medium"
            >
              📅 Data Upload Freq: Every 5 min
            </a> */}
          </div>
        </div>

        {/* Device Section */}
        <DevicesList devices={devices} />

        {/* Plan Section */}
        <PlanSection />

        {/* Alerts Section */}
        <AlertsSection />
      </div>
    </div>
  );
}
