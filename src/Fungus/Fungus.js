import React, { useEffect, useState } from "react";
import axios from "axios";
import GaugeChart from "react-gauge-chart";

import { useAuth } from "../AuthProvider";
import API_BASE_URL from "../config";

/* ---------- DATA PROCESSING ---------- */

function processSensorData(rawData) {
  const WETNESS_THRESHOLD = 0.3;

  const wetIntervals = rawData.filter(
    (d) => d.leaf_wetness_factor > WETNESS_THRESHOLD
  );

  const totalWetnessHours = wetIntervals.length * 0.5;

  const avgTempDuringWetness =
    wetIntervals.length > 0
      ? wetIntervals.reduce((sum, d) => sum + (d.temperature_celcius || 0), 0) /
        wetIntervals.length
      : 0;

  const overallAvgHumidity =
    rawData.length > 0
      ? rawData.reduce((sum, d) => sum + (d.humidity_percentage || 0), 0) /
        rawData.length
      : 0;

  return {
    totalWetnessHours,
    avgTempDuringWetness,
    overallAvgHumidity,
  };
}

// ----------------------------
// Condition Calculation Logic
// ----------------------------

/**
 * Low / No Risk is DISPLAYED as 0%
 */
const getDisplayValue = (value, status) => (status === "Low" ? 0 : value);

/* ---------- COMPONENT ---------- */

export default function Fungus() {
  const { devices, devicesLoading } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [fungusData, setFungusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const leafWetnessFactors = [
    0.15, 0.18, 0.22, 0.25, 0.28, 0.3, 0.33, 0.35, 0.38, 0.4, 0.43, 0.45, 0.48,
  ];
  // Select first device automatically
  useEffect(() => {
    if (!devicesLoading && devices.length && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchAndProcess = async () => {
      setLoading(true);
      try {
        // --- 1. Robust Date Calculation --- RESOLVED tt
        // This method correctly handles month and year changes.
        const today = new Date();
        const endDate = new Date(today);
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 7); // Set start date to 7 days ago

        const formatDate = (date) => {
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        // --- 2. Fetch Data from SQL API ---
        const response = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${formattedStartDate}&to=${formattedEndDate}`,
          { withCredentials: true }
        );

        // Rename keys to match what processSensorData expects, if necessary

        console.log("SQL Data: ", response.data.data);

        const sqlData = (response.data.data || []).map((item) => ({
          temperature_celcius: parseFloat(item.temp),
          humidity_percentage: parseFloat(item.humidity),
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
          {
            name: "Apple Scab",
            ...calculateAppleScab(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
          {
            name: "Alternaria Blotch",
            ...calculateAlternaria(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
          {
            name: "Marssonina Blotch",
            ...calculateMarssonina(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
          {
            name: "Powdery Mildew",
            ...calculatePowderyMildew(
              metrics.avgTempDuringWetness,
              metrics.overallAvgHumidity
            ),
          },
          {
            name: "Cedar - Apple Rust",
            ...calculateCedarRust(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
          {
            name: "Black Rot",
            ...calculateBlackRot(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
          {
            name: "Bitter Rot",
            ...calculateBitterRot(
              metrics.avgTempDuringWetness,
              metrics.totalWetnessHours
            ),
          },
        ];

        setFungusData(calculatedData);
      } catch (err) {
        console.error("Failed to fetch or process sensor data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcess();
  }, [selectedDevice]); // Re-runs when device changes

  /* ---------- CALCULATION FUNCTIONS ---------- */

  const calculateAppleScab = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 10 && temp < 24 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculateAlternaria = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 15 && temp < 28 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculateMarssonina = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 12 && temp < 26 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculatePowderyMildew = (temp, humidity) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (humidity / 100) * 100 * (temp > 15 && temp < 27 ? 1.1 : 0.4))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculateCedarRust = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 10 && temp < 25 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculateBlackRot = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 18 && temp < 30 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const calculateBitterRot = (temp, wetness) => {
    const riskValue = Math.min(
      100,
      Math.max(0, (wetness / 12) * 100 * (temp > 15 && temp < 30 ? 1.2 : 0.5))
    );
    return {
      value: Math.round(riskValue),
      status: riskValue < 40 ? "Low" : riskValue < 70 ? "Moderate" : "High",
    };
  };

  const getZoneColor = (value) => {
    if (value < 40) return "#22c55e";
    if (value < 70) return "#facc15";
    return "#ef4444";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <h1 className="text-3xl font-bold text-green-900">Fungus Detection</h1>
        <p className="mt-2 text-gray-700">
          Risk levels for common apple fungal infections (calculated from weekly
          averages of temperature, humidity, and rainfall).
        </p>

        {loading ? (
          <p className="mt-6 text-gray-500">Loading data...</p>
        ) : fungusData.length === 0 ? (
          <p className="mt-6 text-gray-500">
            No data available for this device.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {fungusData.map((fungus, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-3xl px-6 py-8 flex flex-col items-center shadow-sm relative"
              >
                <div className="mb-4">
                  <GaugeChart
                    percent={fungus.value / 100}
                    colors={["#22c55e", "#facc15", "#ef4444"]}
                    arcWidth={0.3}
                    hideText={true}
                    textColor="#1f2937"
                    innerRadius="70%"
                    outerRadius="100%"
                    startAngle={180}
                    endAngle={0}
                  />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 pb-2">
                    {fungus.value}%
                  </p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {fungus.name}
                  </h3>
                  <p
                    className={`mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      fungus.status
                    )}`}
                  >
                    {fungus.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
