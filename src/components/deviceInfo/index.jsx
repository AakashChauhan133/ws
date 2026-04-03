"use client";

import React from "react";
import "./styles.css";

// --- Time-Based Background Component ---
const TimeBasedBackground = ({ hour }) => {
  let skyGradient, SunMoon;

  if (hour >= 5 && hour < 11) {
    // Morning
    skyGradient = "from-sky-300 to-blue-500";
    SunMoon = () => (
      <div className="sun-animation absolute top-1/2 left-1/4 w-16 h-16 bg-amber-200 rounded-full transition-all duration-1000"></div>
    );
  } else if (hour >= 11 && hour < 16) {
    // Noon
    skyGradient = "from-sky-400 to-blue-600";
    SunMoon = () => (
      <div className="sun-animation absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-300 rounded-full transition-all duration-1000"></div>
    );
  } else if (hour >= 16 && hour < 19) {
    // Evening
    skyGradient = "from-orange-400 via-red-500 to-indigo-800";
    SunMoon = () => (
      <div className="sun-animation absolute top-1/2 right-1/4 w-16 h-16 bg-orange-400 rounded-full transition-all duration-1000"></div>
    );
  } else {
    // Night
    skyGradient = "from-indigo-800 via-purple-800 to-slate-900";
    SunMoon = () => (
      <div className="moon-animation absolute top-8 right-1/4 w-12 h-12 bg-indigo-100 rounded-full transition-all duration-1000"></div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
      <div
        className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-all duration-1000`}
      ></div>
      <SunMoon />
      {/* Mountain Layers */}
      <svg
        viewBox="0 0 100 20"
        className="absolute bottom-0 w-full h-1/3"
        preserveAspectRatio="none"
      >
        <path
          d="M -5 20 L 25 8 L 55 18 L 80 12 L 105 20 Z"
          fill="rgba(0, 0, 0, 0.1)"
        />
        <path
          d="M -5 20 L 35 12 L 65 19 L 85 15 L 105 20 Z"
          fill="rgba(0, 0, 0, 0.2)"
        />
      </svg>
    </div>
  );
};

// --- Helper function to format the timestamp ---
const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = dayNames[date.getDay()];
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayName} ${time}`;
};

// --- The Main Device Info Component ---
const DeviceInfoCard = ({ selectedDevice, hour }) => {
  // 1. Safely map to the new database fields with fallbacks to the old schema
  const status =
    selectedDevice?.status || selectedDevice?.device_status || "N/A";
  const isDeviceActive = status.toLowerCase() === "active";

  // Extracting the new scalable IDs and Names
  const deviceName =
    selectedDevice?.device_name || selectedDevice?.farm_name || "Device Info";
  const deviceId =
    selectedDevice?.device_uid ||
    selectedDevice?.id ||
    selectedDevice?.d_id ||
    "N/A";
  const lastSeen = selectedDevice?.last_seen_at || selectedDevice?.last_seen;

  return (
    <div className="relative rounded-xl shadow-lg overflow-hidden h-full min-h-[250px]">
      {/* Background Component */}
      <TimeBasedBackground hour={hour} />

      {/* Foreground Content with "Glassmorphism" effect */}
      <div className="relative z-10 w-full h-full bg-black/10 backdrop-blur-sm p-6 flex flex-col justify-between text-white ">
        <div>
          <h2
            className="text-xl font-bold truncate"
            title={deviceName}
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
          >
            {deviceName}
          </h2>
        </div>
        <div className="space-y-3 mt-4">
          <div>
            <p className="text-sm font-semibold opacity-70">Device ID / UID</p>
            <p className="text-lg font-bold truncate" title={deviceId}>
              {deviceId}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold opacity-70">Status</p>
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${isDeviceActive ? "bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" : "bg-red-500"}`}
              ></div>
              <p className="text-lg font-bold uppercase tracking-wider">
                {status}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold opacity-70">Last Seen</p>
            <p className="text-lg font-bold">{formatTime(lastSeen)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceInfoCard;
