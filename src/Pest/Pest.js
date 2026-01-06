import React, { useEffect, useState } from "react";
import axios from "axios";
import GaugeChart from "react-gauge-chart";
import { useAuth } from "../AuthProvider";
import API_BASE_URL from "../config";

/* ---------- CONSTANT PEST LIST (THIS WAS MISSING) ---------- */

const PESTS = [
  { key: "codling_moth", name: "Codling Moth" },
  { key: "aphids", name: "Aphids" },
  { key: "apple_maggot", name: "Apple Maggot" },
  { key: "spider_mites", name: "Spider Mites" },
  { key: "san_jose_scale", name: "San Jose Scale" },
];

/* ---------- STATUS UTILS ---------- */

const getStatus = (value) =>
  value >= 60 ? "High" : value >= 30 ? "Medium" : "Low";

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
        const res = await axios.get(
          `${API_BASE_URL}/live-data/${selectedDevice.d_id}`,
          { withCredentials: true }
        );

        const live = res.data?.data?.[0];
        if (!live) {
          setPestData([]);
          return;
        }

        const temp = Number(live.temp) || 0;
        const humidity = Number(live.humidity) || 0;
        const leafWetness = Number(live.leafwetness) || 0;

        /* SIMPLE, STABLE RISK HEURISTICS */
        const risks = {
          codling_moth: Math.min(Math.max((temp - 10) * 3, 0), 100),
          aphids: Math.min(Math.max((humidity - 40) * 2, 0), 100),
          apple_maggot: temp > 18 ? 40 : 0,
          spider_mites: temp > 20 && humidity < 60 ? 35 : 10,
          san_jose_scale: leafWetness > 5 ? 25 : 5,
        };

        const results = PESTS.map((p) => {
          const value = Math.round(risks[p.key] || 0);
          return {
            name: p.name,
            value,
            status: getStatus(value),
          };
        });

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
    <div className="p-6 bg-white min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-green-900">
        Pest Risk Analysis
      </h1>

      <p className="mt-2 text-gray-700">
        Risk levels for common apple pests based on live station data.
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
              <GaugeChart
                percent={pest.value / 100}
                colors={["#22c55e", "#facc15", "#ef4444"]}
                arcWidth={0.3}
                hideText
              />

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