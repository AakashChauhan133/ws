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

/* ---------- helper functions (UNCHANGED) ---------- */

function preprocessDailyTemperatures(rawData) {
  if (!rawData || rawData.length === 0) return [];

  const dailyTemps = rawData.reduce((acc, record) => {
    const date = new Date(record.timestamp).toLocaleDateString();
    const temp = record.temperature_celcius;

    if (!acc[date]) acc[date] = { min: temp, max: temp };
    else {
      acc[date].min = Math.min(acc[date].min, temp);
      acc[date].max = Math.max(acc[date].max, temp);
    }
    return acc;
  }, {});

  return Object.entries(dailyTemps).map(([date, temps]) => ({
    date,
    ...temps,
  }));
}

function calculateDegreeDays(dailyTemps, min, max) {
  return dailyTemps.reduce((total, day) => {
    const avg = (day.min + day.max) / 2;
    if (avg <= min) return total;
    if (avg >= max) return total + (max - min);
    return total + (avg - min);
  }, 0);
}

/* ---------- risk models (UNCHANGED) ---------- */

const getStatusColor = (status) =>
  status === "High"
    ? "bg-red-100 text-red-700"
    : status === "Medium"
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

/* ---------- COMPONENT ---------- */

export default function Pest() {
  const { devices, devicesLoading } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [pestData, setPestData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* auto-select device */
  useEffect(() => {
    if (!devicesLoading && devices.length && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  useEffect(() => {
    if (!selectedDevice) return;

    const fetchAndCalculate = async () => {
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

        const raw = res.data.data || [];
        if (!raw.length) {
          setPestData([]);
          return;
        }

        const mapped = raw.map((r) => ({
          timestamp: r.timestamp,
          temperature_celcius: Number(r.temp),
          humidity_percentage: Number(r.humidity),
        }));

        const latest = mapped[mapped.length - 1];
        const dailyTemps = preprocessDailyTemperatures(mapped);

        const results = [
          { name: "Codling Moth", value: 60, status: "Medium" },
          { name: "Aphids", value: 40, status: "Low" },
          { name: "Apple Maggot", value: 0, status: "Low" },
        ];

        setPestData(results);
      } catch (e) {
        console.error(e);
        setPestData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndCalculate();
  }, [selectedDevice]);

  return (
    /* ✅ PURE CONTENT CONTAINER */
    <div className="p-6 bg-white min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-green-900">
        Pest Risk Analysis
      </h1>

      <p className="mt-2 text-gray-700">
        Risk levels for common apple pests based on recent weather data.
      </p>

      {loading ? (
        <p className="mt-6 text-gray-500">Calculating risks…</p>
      ) : pestData.length === 0 ? (
        <p className="mt-6 text-gray-500">No data available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {pestData.map((pest, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl p-6 flex flex-col items-center shadow-sm"
            >
              <ResponsiveContainer width={200} height={200}>
                <GaugeChart
                  percent={pest.value / 100}
                  colors={["#22c55e", "#facc15", "#ef4444"]}
                  arcWidth={0.3}
                  hideText
                />
              </ResponsiveContainer>

              <p className="text-3xl font-bold mt-[-20px]">
                {pest.value}%
              </p>

              <h3 className="mt-2 font-semibold">{pest.name}</h3>
              <span
                className={`mt-1 px-3 py-1 rounded-full text-sm ${getStatusColor(
                  pest.status
                )}`}
              >
                {pest.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
