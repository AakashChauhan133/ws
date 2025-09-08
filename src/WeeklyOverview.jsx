import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import axios from 'axios';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useAuth } from './AuthProvider';
import API_BASE_URL from './config';

// Generic fetch function
const fetchDeviceData = async (deviceId, range) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/devices/${deviceId}/history?range=${range}`,
      { withCredentials: true }
    );

    const rawData = response.data.data || [];

    // Map API keys to chart keys
    const mappedData = rawData.map((item) => ({
      time: item.timestamp, // adjust if API has a proper timestamp
      temperature: parseFloat(item.temp),
      humidity: parseFloat(item.humidity),
      aqi: parseFloat(item.aqi),
      light: parseFloat(item.light_intensity),
      rainfall: parseFloat(item.rainfall),
      wind: parseFloat(item.wind_speed),
      depthHumidity: parseFloat(item.depth_humidity),
      depthTemp: parseFloat(item.depth_temp),
      surfaceHumidity: parseFloat(item.surface_humidity),
      surfaceTemp: parseFloat(item.surface_temp),
    }));

    return mappedData;
  } catch (err) {
    console.error(`Error fetching ${range} data:`, err);
    return [];
  }
};


const fetchDailyData = (deviceId) => fetchDeviceData(deviceId, "daily");
const fetchWeeklyData = (deviceId) => fetchDeviceData(deviceId, "weekly");
const fetchMonthlyData = (deviceId) => fetchDeviceData(deviceId, "monthly");

export default function WeeklyOverview() {
  const { devices, devicesLoading } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [selectedRange, setSelectedRange] = useState('weekly');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleRangeChange = async (range) => {
    setSelectedRange(range);
    if (!selectedDevice) return;

    setLoading(true);
    let data = [];

    if (range === 'daily') data = await fetchDailyData(selectedDevice.d_id);
    if (range === 'weekly') data = await fetchWeeklyData(selectedDevice.d_id);
    if (range === 'monthly') data = await fetchMonthlyData(selectedDevice.d_id);

    setChartData(data);
    setLoading(false);
  };

  // Fetch default range when device changes
  useEffect(() => {
    if (selectedDevice) {
      handleRangeChange(selectedRange);
    }
  }, [selectedDevice]);

  const parameters = [
    { key: 'temperature', label: 'Temperature (°C)' },
    { key: 'humidity', label: 'Humidity (%)' },
    { key: 'aqi', label: 'AQI' },
    { key: 'light', label: 'Light Intensity (lx)' },
    { key: 'rainfall', label: 'Rainfall (mm)' },
    { key: 'wind', label: 'Wind Speed (m/s)' },
    { key: 'depthHumidity', label: 'Depth Humidity (%)' },
    { key: 'depthTemp', label: 'Depth Temperature (°C)' },
    { key: 'surfaceHumidity', label: 'Surface Humidity (%)' },
    { key: 'surfaceTemp', label: 'Surface Temperature (°C)' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
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
            >
              Switch Device
            </button>
            {showDevices && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-64 z-[1000]"
              >
                <h2 className="text-lg font-semibold p-3 border-b">Select Device</h2>
                <ul className="max-h-[200px] overflow-y-auto">
                  {devices.map((device) => (
                    <li key={device.d_id}>
                      <button
                        onClick={() => {
                          setSelectedDevice(device);
                          setShowDevices(false);
                        }}
                        className="w-full text-left p-3 hover:bg-green-100"
                      >
                        {device.d_id} - {device.device_status}
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
              <h3 className="text-lg font-semibold text-green-800">{selectedDevice.d_id}</h3>
              <p className="text-sm text-gray-700">Status: <span className="font-medium">{selectedDevice.device_status}</span></p>
              <p className="text-sm text-gray-700">Last Seen: {selectedDevice.last_seen}</p>
            </div>
            <div className="text-sm text-gray-700">
              <p>Location: <span className="font-medium">{selectedDevice.address}</span></p>
              <p>Lat: {selectedDevice.latitude} | Lng: {selectedDevice.longitude}</p>
            </div>
          </div>
        )}

        {/* Range buttons */}
        <div className="mt-6 flex flex-wrap gap-4">
          {['daily', 'weekly', 'monthly'].map((range) => (
            <button
              key={range}
              className={`px-5 py-2 rounded-md border font-medium transition duration-200
                ${selectedRange === range 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-white text-green-700 border-green-600 hover:bg-green-50'}
              `}
              onClick={() => handleRangeChange(range)}
            >
              {`${range.charAt(0).toUpperCase() + range.slice(1)} Data`}
            </button>
          ))}
        </div>

        {/* Charts */}
        <div className="mt-6 space-y-8">
          {loading ? (
            <p className="text-center text-gray-600">Loading data...</p>
          ) : chartData.length === 0 ? (
            <p className="text-center text-gray-600">No data available for {selectedRange} range.</p>
          ) : (
            parameters.map(param => (
              <div key={param.key} className="bg-white p-4 rounded shadow border">
                <h2 className="text-xl font-semibold text-green-700 mb-3">{param.label}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="time" stroke="#166534" />
                    <YAxis stroke="#166534" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey={param.key} stroke="#16a34a" strokeWidth={2} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
