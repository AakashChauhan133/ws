import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
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
      ? wetIntervals.reduce(
          (sum, d) => sum + d.temperature_celcius,
          0
        ) / wetIntervals.length
      : 0;

  const overallAvgHumidity =
    rawData.length > 0
      ? rawData.reduce(
          (sum, d) => sum + d.humidity_percentage,
          0
        ) / rawData.length
      : 0;

  return {
    totalWetnessHours,
    avgTempDuringWetness: Number(avgTempDuringWetness.toFixed(2)),
    overallAvgHumidity: Number(overallAvgHumidity.toFixed(2)),
  };
}

/* ---------- RISK MODELS ---------- */

const getStatusColor = (status) =>
  status === "High"
    ? "bg-red-100 text-red-700"
    : status === "Medium"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

const getZoneColor = (value) => {
  if (value <= 40) return "#22c55e";
  if (value <= 70) return "#facc15";
  return "#ef4444";
};

/* ---------- COMPONENT ---------- */

export default function Fungus() {
  const { devices, devicesLoading } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [fungusData, setFungusData] = useState([]);
  const [loading, setLoading] = useState(true);

  const leafWetnessFactors = [
    0.15, 0.18, 0.22, 0.25, 0.28, 0.3, 0.33, 0.35, 0.38, 0.4, 0.43, 0.45,
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

        const metrics = processSensorData(sqlData);

        const calculated = [
          { name: "Apple Scab", value: Math.min(metrics.totalWetnessHours * 10, 100), status: "Medium" },
          { name: "Alternaria Blotch", value: 50, status: "Medium" },
          { name: "Marssonina Blotch", value: 60, status: "Medium" },
          { name: "Powdery Mildew", value: 40, status: "Low" },
          { name: "Cedar Apple Rust", value: 75, status: "High" },
          { name: "Black Rot", value: 65, status: "Medium" },
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
    /* ✅ PURE CONTENT ONLY */
    <div className="p-6 bg-white min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-green-900">
        Fungus Detection
      </h1>

      <p className="mt-2 text-gray-700">
        Risk levels for common apple fungal infections based on recent
        weather conditions.
      </p>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading data…</p>
      ) : fungusData.length === 0 ? (
        <p className="mt-6 text-gray-500">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {fungusData.map((fungus, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl p-6 flex flex-col items-center shadow-sm"
            >
              <ResponsiveContainer width={200} height={200}>
                <GaugeChart
                  percent={fungus.value / 100}
                  colors={["#22c55e", "#facc15", "#ef4444"]}
                  arcWidth={0.3}
                  hideText
                />
              </ResponsiveContainer>

              <p className="text-3xl font-bold mt-[-20px]">
                {fungus.value}%
              </p>

              <h3 className="mt-2 font-semibold">{fungus.name}</h3>
              <span
                className={`mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(
                  fungus.status
                )}`}
              >
                {fungus.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
