import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import * as XLSX from "xlsx"; 
import { useAuth } from './AuthProvider';
import axios from 'axios';
import API_BASE_URL from './config';

const todayDate = new Date().toISOString().split("T")[0];

export default function Export() {
  const { devices, devicesLoading, devicesError } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(todayDate);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [tableData, setTableData] = useState([]);

  // Timer for loading seconds
  useEffect(() => {
    let interval;
    if (devicesLoading) {
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [devicesLoading]);

  // Select first device automatically
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Close dropdown on outside click
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

  // Fetch table data (weekly by default)
  useEffect(() => {
    if (!selectedDevice) return;

    const fetchTableData = async () => {
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

        // getting the data on the basis of start date and end date
        const response = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${startDate}&to=${endDate}`,
          { withCredentials: true }
        );
        const data = response.data.data || [];

        // Reversing the rows
        data.reverse();

        // console.log(data);  debugging

        setTableData(data);
      } catch (err) {
        console.error("Failed to fetch table data:", err);
        setTableData([]);
      }
    };

    fetchTableData();
  }, [selectedDevice]);

  // Export handler
  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${startDate}&to=${endDate}`,
        { withCredentials: true }
      );

      const data = response.data.data || [];

      if (!data.length) {
        alert("No records found for the selected date range.");
        return;
      }

      // Convert to Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");

      XLSX.writeFile(workbook, `${selectedDevice?.d_id || "device"}_data.xlsx`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
        <Sidebar />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">Export Device Data</h1>
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

        {/* Selected Device Card */}
        {selectedDevice && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-700 p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">{selectedDevice.d_id}</h3>
              <p className="text-sm text-gray-700">
                Status: <span className="font-medium">{selectedDevice.device_status}</span>
              </p>
              <p className="text-sm text-gray-700">Last Seen: {selectedDevice.last_seen}</p>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                Location: <span className="font-medium">{selectedDevice.address}</span>
              </p>
              <p>
                Lat: {selectedDevice.latitude} | Lng: {selectedDevice.longitude}
              </p>
            </div>
          </div>
        )}

        {/* Export Panel */}
        <div className="mt-4 space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Start Date */}
            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="start-date" className="mb-2 font-semibold text-green-700">
                Start Date:
              </label>
              <input
                type="date"
                id="start-date"
                className="px-4 py-2 rounded-md border border-gray-300"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col w-full md:w-1/3">
              <label htmlFor="end-date" className="mb-2 font-semibold text-green-700 flex justify-between">
                End Date:
                <button
                  className="text-sm text-green-600 underline"
                  onClick={() => setEndDate(todayDate)}
                >
                  Set Today
                </button>
              </label>
              <input
                type="date"
                id="end-date"
                className="px-4 py-2 rounded-md border border-gray-300"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={todayDate}
              />
            </div>

            {/* Export Button */}
            <div className="flex items-end w-full md:w-1/3">
              <button
                className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
                onClick={handleExport}
              >
                Export From Date to Date
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mt-16 bg-white rounded-md shadow-sm">
          <h3 className="text-xl font-semibold mb-4 border-b border-green-500 pb-2 text-green-800">
            DATA TABLE (ONE WEEK)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm table-auto border-collapse">
              <thead>
                <tr className="bg-green-100 text-green-800 font-semibold border-y border-green-300">
                  <th className="p-3 text-left">TIMESTAMP</th>
                  <th className="p-3 text-left">TEMPERATURE (°C)</th>
                  <th className="p-3 text-left">HUMIDITY (%)</th>
                  <th className="p-3 text-left">LIGHT INTENSITY (lx)</th>
                  <th className="p-3 text-left">AIR QUALITY INDEX (AQI)</th>
                  <th className="p-3 text-left">RAINFALL (mm)</th>
                  <th className="p-3 text-left">WIND SPEED (m/s)</th>
                  <th className="p-3 text-left">WIND DIRECTION (°)</th>
                  <th className="p-3 text-left">SURFACE TEMP (°C)</th>
                  <th className="p-3 text-left">SURFACE HUMIDITY (%)</th>
                  <th className="p-3 text-left">DEPTH TEMP (°C)</th>
                  <th className="p-3 text-left">DEPTH HUMIDITY (%)</th>
                </tr>
              </thead>
              <tbody className="text-green-900">
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b border-green-100 ${
                        index % 2 === 0 ? "bg-green-50" : "bg-white"
                      } hover:bg-green-100 transition duration-150`}
                    >
                      <td className="p-3">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="p-3">{row.temp} °C</td>
                      <td className="p-3">{row.humidity} %</td>
                      <td className="p-3">{row.light_intensity} lx</td>
                      <td className="p-3">{row.aqi}</td>
                      <td className="p-3">{row.rainfall} mm</td>
                      <td className="p-3">{row.wind_speed} m/s</td>
                      <td className="p-3">
                        {{
                          N: "NORTH",
                          S: "SOUTH",
                          E: "EAST",
                          W: "WEST",
                          NE: "NORTH EAST",
                          NW: "NORTH WEST",
                          SE: "SOUTH EAST",
                          SW: "SOUTH WEST"
                        }[row.wind_direction] || row.wind_direction?.toUpperCase()}
                      </td>

                      <td className="p-3">{row.surface_temp} °C</td>
                      <td className="p-3">{row.surface_humidity} %</td>
                      <td className="p-3">{row.depth_temp} °C</td>
                      <td className="p-3">{row.depth_humidity} %</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="p-4 text-left text-gray-500">
                      No data found for this device in the last week.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
