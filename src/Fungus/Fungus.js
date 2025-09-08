import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import axios from "axios";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../AuthProvider";
import API_BASE_URL from "../config";


// ----------------------------
// Condition Calculation Logic
// ----------------------------

// Apple Scab (Mills Table)
function calculateAppleScab(temp, wetnessHours) {
  if (temp < 6) return { value: 0, status: "No Risk" };

  let requiredHours;
  if (temp >= 18 && temp <= 24) requiredHours = 9;
  else if (temp === 17) requiredHours = 10;
  else if (temp === 16) requiredHours = 11;
  else if (temp === 15) requiredHours = 12;
  else if (temp >= 13 && temp <= 14) requiredHours = 14;
  else if (temp === 12) requiredHours = 15;
  else if (temp >= 10 && temp <= 11) requiredHours = 20;

  if (!requiredHours) return { value: 0, status: "No Risk" };

  const risk = Math.min((wetnessHours / requiredHours) * 100, 100);
  let status = "Low";
  if (risk >= 70) status = "High";
  else if (risk >= 40) status = "Medium";

  return { value: Math.round(risk), status };
}

// Alternaria Blotch
function calculateAlternaria(temp, wetnessHours) {
  if (temp >= 25 && temp <= 30 && wetnessHours >= 5.5)
    return { value: 80, status: "High" };
  if (temp >= 20 && temp <= 32 && wetnessHours >= 4)
    return { value: 50, status: "Medium" };
  return { value: 0, status: "No Risk" };
}

// Marssonina Blotch
function calculateMarssonina(temp, wetnessHours) {
  if (temp >= 20 && temp <= 25 && wetnessHours >= 24)
    return { value: 90, status: "High" };
  if (temp >= 16 && temp <= 28 && wetnessHours >= 10)
    return { value: 60, status: "Medium" };
  return { value: 0, status: "No Risk" };
}

// Powdery Mildew
function calculatePowderyMildew(temp, humidity) {
  if (temp < 10 || temp > 25 || humidity < 70)
    return { value: 0, status: "No Risk" };

  const optimal = temp >= 19 && temp <= 22 && humidity > 75;
  const risk = optimal ? 90 : 60;

  return { value: risk, status: risk >= 70 ? "High" : "Medium" };
}

// Cedar - Apple Rust
function calculateCedarRust(temp, wetnessHours) {
  if (temp >= 13 && temp <= 24 && wetnessHours >= 4)
    return { value: 75, status: "High" };
  if (temp >= 10 && temp <= 26 && wetnessHours >= 2)
    return { value: 50, status: "Medium" };
  return { value: 0, status: "No Risk" };
}

// Black Rot
function calculateBlackRot(temp, wetnessHours) {
  if (temp < 20 || temp > 35 || wetnessHours < 4)
    return { value: 0, status: "No Risk" };

  const optimal = temp >= 26 && temp <= 32 && wetnessHours >= 6;
  const risk = optimal ? 85 : 60;

  return { value: risk, status: risk >= 70 ? "High" : "Medium" };
}

// Bitter Rot
function calculateBitterRot(temp, wetnessHours) {
  if (temp >= 26 && temp <= 32 && wetnessHours >= 5)
    return { value: 80, status: "High" };
  if (temp >= 20 && temp <= 35 && wetnessHours >= 3)
    return { value: 50, status: "Medium" };
  return { value: 0, status: "No Risk" };
}

// ----------------------------
// Utility: Zone Color
// ----------------------------
const getZoneColor = (value) => {
  if (value <= 40) return "#22c55e"; // green
  if (value <= 70) return "#facc15"; // yellow
  return "#ef4444"; // red
};

// ----------------------------
// Main Fungus Component
// ----------------------------
export default function Fungus() {
  const { devices, devicesLoading } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [fungusData, setFungusData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Select first device automatically
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Fetch weekly data when device changes
  useEffect(() => {
    if (!selectedDevice) return;

    async function fetchWeeklyData() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=weekly`,
          { withCredentials: true }
        );

      console.log("Server response:", res.data);
        const rawData = res.data.data || [];

        if (!Array.isArray(rawData) || rawData.length === 0) {
          setFungusData([]);
          setLoading(false);
          return;
        }

        // Compute averages
        const avgTemp =
          rawData.reduce((sum, d) => sum + parseFloat(d.temp || 0), 0) /
          rawData.length;
        const avgHumidity =
          rawData.reduce((sum, d) => sum + parseFloat(d.humidity || 0), 0) /
          rawData.length;

        // If you have direct wetnessHours in API use that; otherwise approximate from rainfall
        const avgWetness =
          rawData.reduce(
            (sum, d) => sum + parseFloat(d.rainfall || 0),
            0
          ) / rawData.length;

        const calculatedData = [
          { name: "Apple Scab", ...calculateAppleScab(avgTemp, avgWetness) },
          { name: "Alternaria Blotch", ...calculateAlternaria(avgTemp, avgWetness) },
          { name: "Marssonina Blotch", ...calculateMarssonina(avgTemp, avgWetness) },
          { name: "Powdery Mildew", ...calculatePowderyMildew(avgTemp, avgHumidity) },
          { name: "Cedar - Apple Rust", ...calculateCedarRust(avgTemp, avgWetness) },
          { name: "Black Rot", ...calculateBlackRot(avgTemp, avgWetness) },
          { name: "Bitter Rot", ...calculateBitterRot(avgTemp, avgWetness) },
        ];

        setFungusData(calculatedData);
      } catch (err) {
        console.error("Error fetching weekly fungus data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeeklyData();
  }, [selectedDevice]);

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>

        <h1 className="text-3xl font-bold text-green-900">Fungus Detection</h1>
        <p className="mt-2 text-gray-700">
          Risk levels for common apple fungal infections (calculated from weekly
          averages of temperature, humidity, and rainfall).
        </p>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading data...</p>
        ) : fungusData.length === 0 ? (
          <p className="mt-6 text-gray-500">No data available for this device.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {fungusData.map((fungus, idx) => (
              <div
                key={idx}
                className="relative bg-white shadow-md rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition"
              >
                {/* Gauge */}
                <ResponsiveContainer width={200} height={200}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[
                      {
                        name: fungus.name,
                        value: fungus.value,
                        fill: getZoneColor(fungus.value),
                      },
                    ]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar
                      dataKey="value"
                      cornerRadius={15}
                      background={{ fill: "#e5e7eb" }}
                      clockWise
                    />
                  </RadialBarChart>
                </ResponsiveContainer>

                {/* Centered % */}
                <div className="absolute top-1/2 transform -translate-y-1/2 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {fungus.value}%
                  </p>
                </div>

                {/* Info */}
                <h3 className="mt-3 text-lg font-semibold text-gray-800 text-center">
                  {fungus.name}
                </h3>
                <p
                  className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    fungus.status === "High"
                      ? "bg-red-100 text-red-700"
                      : fungus.status === "Medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {fungus.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
