import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API_BASE_URL from "./config";

export default function WeeklyOverview() {
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [selectedRange, setSelectedRange] = useState("weekly");
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sensorMap, setSensorMap] = useState({});

  // 1. Fetch Devices locally using JWT Auth
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.get(`${API_BASE_URL}/devices/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedDevices = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setDevices(fetchedDevices);
      } catch (err) {
        console.error("Error fetching devices:", err);
      } finally {
        setDevicesLoading(false);
      }
    };
    fetchDevices();
  }, []);

  // Select first device by default
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowDevices(false);
      }
    };
    if (showDevices) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDevices]);

  // 2. Fetch Installed Sensors to dynamically map IDs (e.g., 3 -> "temp")
  useEffect(() => {
    const fetchSensorMap = async () => {
      if (!selectedDevice) return;
      const deviceId = selectedDevice.id || selectedDevice.d_id;
      const token = localStorage.getItem("access_token");

      try {
        const res = await axios.get(
          `${API_BASE_URL}/sensors/device/${deviceId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data?.data) {
          const mapping = {};
          res.data.data.forEach((sensor) => {
            mapping[sensor.id] = sensor.sensor_label;
          });
          setSensorMap(mapping);
        }
      } catch (err) {
        console.error("Failed to fetch sensor map:", err);
      }
    };
    fetchSensorMap();
  }, [selectedDevice]);

  // 3. Fetch History and "Pivot" the Data (Like pandas.pivot_table)
  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!selectedDevice || Object.keys(sensorMap).length === 0) return;

      setLoading(true);
      const deviceId = selectedDevice.id || selectedDevice.d_id;
      const token = localStorage.getItem("access_token");

      try {
        const res = await axios.get(
          `${API_BASE_URL}/devices/${deviceId}/history`,
          {
            params: { range: selectedRange },
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const rawData = res.data?.data || [];

        // --- The "Pandas Pivot" Logic ---
        // Converts EAV rows into Wide Format for Recharts
        const groupedData = {};

        rawData.forEach((item) => {
          // Format the time nicely for the X-Axis
          const timeObj = new Date(item.recorded_at || item.timestamp);
          const timeKey = timeObj.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          // Initialize the row if it doesn't exist yet
          if (!groupedData[timeKey]) {
            groupedData[timeKey] = {
              time: timeKey,
              _timestamp: timeObj.getTime(),
            };
          }

          // Map the sensor ID to its string label (e.g., "temp")
          const sensorLabel = sensorMap[item.device_sensor_id];
          if (sensorLabel) {
            groupedData[timeKey][sensorLabel] = parseFloat(item.value);
          }
        });

        // Convert the grouped object back into an array and sort chronologically
        const chartArray = Object.values(groupedData).sort(
          (a, b) => a._timestamp - b._timestamp,
        );

        setChartData(chartArray);
      } catch (err) {
        console.error(`Error fetching ${selectedRange} data:`, err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [selectedDevice, selectedRange, sensorMap]);

  // Matches the dynamic "sensor_label" strings from your backend database
  const parameters = [
    { key: "temp", label: "Temperature (°C)" },
    { key: "humidity", label: "Humidity (%)" },
    { key: "leaf_wetness", label: "Leaf Wetness" },
    { key: "light_intensity", label: "Light Intensity (lx)" },
    { key: "rainfall", label: "Rainfall (mm)" },
    { key: "wind_speed", label: "Wind Speed (m/s)" },
    { key: "depth_humidity", label: "Depth Humidity (%)" },
    { key: "depth_temp", label: "Depth Temperature (°C)" },
    { key: "surface_humidity", label: "Surface Humidity (%)" },
    { key: "surface_temp", label: "Surface Temperature (°C)" },
  ];

  return (
    <div className="p-6">
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">Overview</h1>
          <div className="relative">
            <button
              ref={buttonRef}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setShowDevices((prev) => !prev)}
              disabled={devicesLoading}
            >
              Switch Device
            </button>
            {showDevices && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-64 z-[1000]"
              >
                <h2 className="text-lg font-semibold p-3 border-b">
                  Select Device
                </h2>
                <ul className="max-h-[200px] overflow-y-auto">
                  {devices.map((device) => (
                    <li key={device.id || device.d_id}>
                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowDevices(false);
                        }}
                        className="w-full text-left p-3 hover:bg-green-100"
                      >
                        {device.device_name ||
                          device.farm_name ||
                          `Device ${device.id || device.d_id}`}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {selectedDevice && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-700 p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {selectedDevice.device_name ||
                  selectedDevice.farm_name ||
                  "Device"}
              </h3>
              <p className="text-sm text-gray-700">
                ID:{" "}
                <span className="font-medium">
                  {selectedDevice.device_uid || selectedDevice.d_id}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Status:{" "}
                <span className="font-medium uppercase">
                  {selectedDevice.status || selectedDevice.device_status}
                </span>
              </p>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                Location:{" "}
                <span className="font-medium">
                  {selectedDevice.location_name ||
                    selectedDevice.address ||
                    "N/A"}
                </span>
              </p>
              <p>
                Lat: {selectedDevice.latitude || "N/A"} | Lng:{" "}
                {selectedDevice.longitude || "N/A"}
              </p>
            </div>
          </div>
        )}

        {/* Range buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          {["daily", "weekly", "monthly"].map((range) => (
            <button
              key={range}
              className={`px-5 py-2 rounded-md border font-medium transition duration-200
                ${
                  selectedRange === range
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-green-700 border-green-600 hover:bg-green-50"
                }
              `}
              onClick={() => setSelectedRange(range)}
            >
              {`${range.charAt(0).toUpperCase() + range.slice(1)} Data`}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-6 space-y-8">
          {loading ? (
            <p className="text-center text-gray-600 font-semibold py-10">
              Loading and pivoting data array...
            </p>
          ) : chartData.length === 0 ? (
            <p className="text-center text-gray-600 py-10 border rounded-lg bg-gray-50">
              No data available for the {selectedRange} range.
            </p>
          ) : (
            parameters.map((param) => {
              // Only render the chart if this data parameter actually exists in the pivoted dataset
              const hasData = chartData.some((d) => d[param.key] !== undefined);
              if (!hasData) return null;

              return (
                <div
                  key={param.key}
                  className="bg-white p-4 rounded shadow border"
                >
                  <h2 className="text-xl font-semibold text-green-700 mb-3">
                    {param.label}
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="time"
                        stroke="#166534"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis stroke="#166534" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid #166534",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={param.key}
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
