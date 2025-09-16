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
import GaugeChart from 'react-gauge-chart';

// Helper function to process the raw sensor data
function processSensorData(rawData) {
  const WETNESS_THRESHOLD = 0.3; // Leaf is considered "wet" if factor > 0.3

  // 1. Filter for time intervals where leaves were wet
  const wetIntervals = rawData.filter(
    (d) => d.leaf_wetness_factor > WETNESS_THRESHOLD
  );

  // 2. Calculate total hours of wetness
  // Each interval is 0.5 hours (30 minutes)
  const totalWetnessHours = wetIntervals.length * 0.5;

  // 3. Calculate the average temperature ONLY during the wet periods
  const sumOfWetTemperatures = wetIntervals.reduce(
    (sum, interval) => sum + interval.temperature_celcius,
    0
  );
  const avgTempDuringWetness =
    wetIntervals.length > 0 ? sumOfWetTemperatures / wetIntervals.length : 0;

  // 4. Calculate the average humidity over the entire day for Powdery Mildew
  const sumOfHumidity = rawData.reduce(
    (sum, interval) => sum + interval.humidity_percentage,
    0
  );
  const overallAvgHumidity =
    rawData.length > 0 ? sumOfHumidity / rawData.length : 0;

  // 5. Return the calculated metrics
  return {
    totalWetnessHours,
    avgTempDuringWetness: parseFloat(avgTempDuringWetness.toFixed(2)), // Round to 2 decimal places
    overallAvgHumidity: parseFloat(overallAvgHumidity.toFixed(2)),
  };
}


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

// --- Utility for coloring the status badges ---
const getStatusColor = (status) => {
  switch (status) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-green-100 text-green-700";
  }
};

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

  // This array will be merged with your SQL data.
  const leafWetnessFactors = [
    0.15, 0.18, 0.22, 0.25, 0.28, 0.30, 0.33, 0.35, 0.38, 0.40, 0.43, 0.45, 0.48
  ]; 
  // Select first device automatically
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Fetch weekly data when device changes
  useEffect(() => {
    // Don't run if no device is selected
    if (!selectedDevice) return;

    const fetchDataAndProcess = async () => {
      setLoading(true);
      try {

        // Get the current date
        const today = new Date();

        // Get the day, month, and year
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = today.getFullYear();

        // Assemble the formatted date string
        const endDate = `${day - 1}-${month}-${year}`;
        const startDate = `${day - 8}-${month}-${year}`;

        console.log(endDate);   // end date
        console.log(startDate); // start date

        // --- STEP 1: Fetch main sensor data from your SQL API ---
        const response = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${startDate}&to=${endDate}`, // Ensure this endpoint returns raw 24-hour data
          { withCredentials: true }
        );
        // Rename keys to match what processSensorData expects, if necessary

        console.log("SQL Data: ",response.data.data);

        const sqlData = (response.data.data || []).map(item => ({
            temperature_celcius: parseFloat(item.temp),
            humidity_percentage: parseFloat(item.humidity)
            //... map other fields if their names differ
        }));


        // --- STEP 2: Create a lookup map from the local JSON file ---
        const mergedData = sqlData.map((record, index) => ({
          ...record,
          leaf_wetness_factor: leafWetnessFactors[index] || 0, // Default to 0 if arrays differ in length
        }));

        // --- STEP 4: Process the complete, merged data ---
        const metrics = processSensorData(mergedData);
        
        console.log("Calculated Metrics from Merged Data:", metrics);

        const calculatedData = [
          { name: "Apple Scab", ...calculateAppleScab(metrics.avgTempDuringWetness, metrics.totalWetnessHours)},
          { name: "Alternaria Blotch", ...calculateAlternaria(metrics.avgTempDuringWetness, metrics.totalWetnessHours)},
          { name: "Marssonina Blotch", ...calculateMarssonina(metrics.avgTempDuringWetness, metrics.totalWetnessHours)},
          { name: "Powdery Mildew", ...calculatePowderyMildew(metrics.avgTempDuringWetness, metrics.overallAvgHumidity)},
          { name: "Cedar - Apple Rust", ...calculateCedarRust(metrics.avgTempDuringWetness, metrics.totalWetnessHours)},
          { name: "Black Rot", ...calculateBlackRot(metrics.avgTempDuringWetness, metrics.totalWetnessHours)},
          { name: "Bitter Rot", ...calculateBitterRot(metrics.avgTempDuringWetness, metrics.totalWetnessHours)}
        ];

        setFungusData(calculatedData);

      } catch (err) {
        console.error("Failed to fetch or process sensor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndProcess();
  }, [selectedDevice]); // Re-runs when device changes


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
                className="relative bg-white border-4 rounded-2xl p-6 flex flex-col items-center hover:shadow-lg transition"
              >
                {/* Gauge */}
                <ResponsiveContainer width={200} height={200}>
                  <GaugeChart
                    percent={(fungus.value ?? 0) / 100}
                    colors={["#22c55e", "#facc15", "#ef4444"]}
                    arcWidth={0.3}
                    hideText="true"
                    textColor="#1f2937"
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
                  </GaugeChart>
                </ResponsiveContainer>

                {/* Centered % */}
                <div className="absolute top-1/2 transform text-center">
                  <p className="text-2xl font-bold text-gray-900 pb-2">
                    {fungus.value}%
                  </p>
                  {/* Info */}
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fungus.name}
                  </h3>
                  <p className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fungus.status)}`}>
                    {fungus.status}
                  </p>
                </div>

                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
