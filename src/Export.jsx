import React, { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import * as XLSX from "xlsx";
import { useAuth } from "./AuthProvider";
import axios from "axios";
import API_BASE_URL from "./config";

const todayDate = new Date().toISOString().split("T")[0];

export default function Export() {
  const { devices, devicesLoading, devicesError } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayDate);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [tableData, setTableData] = useState([]);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  /* ⏱ Loading timer */
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

  /* 🔌 Auto select first device */
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  /* 🖱 Close dropdown on outside click */
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
    }

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showDevices]);

  /* 📊 Fetch weekly table data */
  useEffect(() => {
    if (!selectedDevice) return;

    const fetchTableData = async () => {
      try {
        // --- 1. Robust Date Calculation ---
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
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${format(
            start
          )}&to=${format(today)}`,
          { withCredentials: true }
        );

        const data = response.data.data || [];

        const data = response.data.data || [];
        setTableData(data.reverse());
      } catch (err) {
        console.error("Failed to fetch table data:", err);
        setTableData([]);
      }
    };

    fetchTableData();
  }, [selectedDevice]);

  /* ⬇️ Export handler */
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
        alert("No records found.");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");

      XLSX.writeFile(
        workbook,
        `${selectedDevice?.d_id || "device"}_data.xlsx`
      );
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white text-black">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">
            Export Device Data
          </h1>
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
                <h2 className="text-lg font-semibold p-3 border-b">
                  Select Device
                </h2>
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
      </div>

        {/* Selected Device Card */}
        {selectedDevice && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-700 p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-green-800">
                {selectedDevice.d_id}
              </h3>
              <p className="text-sm text-gray-700">
                Status:{" "}
                <span className="font-medium">
                  {selectedDevice.device_status}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Last Seen: {selectedDevice.last_seen}
              </p>
            </div>
            <div className="text-sm text-gray-700">
              <p>
                Location:{" "}
                <span className="font-medium">{selectedDevice.address}</span>
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
              <label
                htmlFor="start-date"
                className="mb-2 font-semibold text-green-700"
              >
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
              <label
                htmlFor="end-date"
                className="mb-2 font-semibold text-green-700 flex justify-between"
              >
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

        <div>
          <label className="font-semibold text-green-700">End Date</label>
          <input
            type="date"
            className="w-full mt-2 border rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={todayDate}
          />
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
                  <th className="p-3 text-left">Leafwetness (lwd)</th>
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
                      <td className="p-3">
                        {new Date(row.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">{row.temp} °C</td>
                      <td className="p-3">{row.humidity} %</td>
                      <td className="p-3">{row.light_intensity} lx</td>
                      <td className="p-3">{row.leafwetness}</td>
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
                          SW: "SOUTH WEST",
                        }[row.wind_direction] ||
                          row.wind_direction?.toUpperCase()}
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

      {/* Table */}
      {/* DATA TABLE (ONE WEEK STYLE) */}
<div className="mt-10 overflow-x-auto border rounded-lg">
  <table className="min-w-[1600px] w-full text-sm border-collapse">
    <thead className="bg-green-100 text-green-900">
      <tr>
        <th className="p-3 text-left">Timestamp</th>
        <th className="p-3 text-left">Temperature (°C)</th>
        <th className="p-3 text-left">Humidity (%)</th>
        <th className="p-3 text-left">Light Intensity (lx)</th>
        <th className="p-3 text-left">Leaf Wetness (lwd)</th>
        <th className="p-3 text-left">Rainfall (mm)</th>
        <th className="p-3 text-left">Wind Speed (m/s)</th>
        <th className="p-3 text-left">Wind Direction (°)</th>
        <th className="p-3 text-left">Surface Temp (°C)</th>
        <th className="p-3 text-left">Surface Humidity (%)</th>
        <th className="p-3 text-left">Depth Temp (°C)</th>
        <th className="p-3 text-left">Depth Humidity (%)</th>
      </tr>
    </thead>

    <tbody>
      {tableData.length ? (
        tableData.map((row, i) => (
          <tr
            key={i}
            className={i % 2 === 0 ? "bg-green-50" : "bg-white"}
          >
            <td className="p-3">
              {new Date(row.timestamp).toLocaleString()}
            </td>

            <td className="p-3">
              {Number(row.temp) || 0} °C
            </td>

            <td className="p-3">
              {Number(row.humidity) || 0} %
            </td>

            <td className="p-3">
              {Number(row.light_intensity) || 0} lx
            </td>

            <td className="p-3">
              {Number(row.leafwetness) || 0}
            </td>

            <td className="p-3">
              {Number(row.rainfall) || 0} mm
            </td>

            <td className="p-3">
              {Number(row.wind_speed) || 0} m/s
            </td>

            <td className="p-3">
              {Number(row.wind_direction) || 0}
            </td>

            <td className="p-3">
              {Number(row.surface_temp) || 0} °C
            </td>

            <td className="p-3">
              {Number(row.surface_humidity) || 0} %
            </td>

            <td className="p-3">
              {Number(row.depth_temp) || 0} °C
            </td>

            <td className="p-3">
              {Number(row.depth_humidity) || 0} %
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={12} className="p-6 text-center text-gray-500">
            No data available
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
    </div>
  );
}
