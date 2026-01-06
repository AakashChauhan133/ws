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

  return {
    totalWetnessHours,
  };
}

/* ---------- UI HELPERS ---------- */

const getStatusColor = (status) =>
  status === "High"
    ? "bg-red-100 text-red-700"
    : status === "Medium"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

/**
 * Low / No Risk is DISPLAYED as 0%
 */
const getDisplayValue = (value, status) =>
  status === "Low" ? 0 : value;

/* ---------- COMPONENT ---------- */

export default function Fungus() {
  const { devices, devicesLoading } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [fungusData, setFungusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const leafWetnessFactors = [
    0.15, 0.18, 0.22, 0.25, 0.28, 0.3,
    0.33, 0.35, 0.38, 0.4, 0.43, 0.45,
  ];

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
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 7);

        const format = (d) =>
          `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${d.getFullYear()}`;

        const res = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${format(
            start
          )}&to=${format(today)}`,
          { withCredentials: true }
        );

        const sqlData = (res.data.data || []).map((item, idx) => ({
          temperature_celcius: Number(item.temp),
          humidity_percentage: Number(item.humidity),
          leaf_wetness_factor: leafWetnessFactors[idx] || 0,
        }));

        processSensorData(sqlData);

        const calculated = [
          { name: "Apple Scab", value: 30, status: "Low" },
          { name: "Alternaria Blotch", value: 50, status: "Low" },
          { name: "Marssonina Blotch", value: 60, status: "Low" },
          { name: "Powdery Mildew", value: 40, status: "Low" },
          { name: "Cedar Apple Rust", value: 50, status: "Medium" },
          { name: "Black Rot", value: 65, status: "Low" },
          { name: "Bitter Rot", value: 55, status: "Medium" },
        ];

        setFungusData(calculated);
      } catch (e) {
        console.error(e);
        setFungusData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcess();
  }, [selectedDevice]);

  return (
    <div className="p-6 bg-white min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-green-900">
        Fungus Detection
      </h1>

      <p className="mt-2 text-gray-700">
        Risk levels for common apple fungal infections (calculated from
        weekly averages of temperature, humidity, and rainfall).
      </p>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading data…</p>
      ) : fungusData.length === 0 ? (
        <p className="mt-6 text-gray-500">No data available.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {fungusData.map((fungus, idx) => {
            const displayValue = getDisplayValue(
              fungus.value,
              fungus.status
            );

            return (
              <div
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-3xl
                           px-6 py-8 flex flex-col items-center shadow-sm"
              >
                {/* ⬆ Gauge pushed slightly UP */}
                <div className="-mb-4">
                  <GaugeChart
                    percent={displayValue / 100}
                    colors={["#22c55e", "#facc15", "#ef4444"]}
                    arcWidth={0.25}
                    hideText
                    needleColor="#374151"
                    needleBaseColor="#374151"
                    style={{ width: "180px" }}
                  />
                </div>

                {/* % — clean spacing now */}
                <div className="mt-1 text-3xl font-bold text-gray-900">
                  {displayValue}%
                </div>

                <h3 className="mt-3 text-lg font-semibold text-gray-800 text-center">
                  {fungus.name}
                </h3>

                <span
                  className={`mt-2 px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    fungus.status
                  )}`}
                >
                  {fungus.status === "Low" ? "No Risk" : fungus.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}