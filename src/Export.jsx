import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

import { useAuth } from "./AuthProvider";
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
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);

        const format = (d) =>
          `${String(d.getDate()).padStart(2, "0")}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${d.getFullYear()}`;

        const response = await axios.get(
          `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=custom&from=${format(
            start
          )}&to=${format(today)}`,
          { withCredentials: true }
        );

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

  /* ❌ Error states */
  if (devicesError) {
    return <p className="text-red-500 p-6">{devicesError}</p>;
  }

  /* ⏳ Loading */
  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-green-700 font-semibold">
          Loading devices… ({loadingSeconds}s)
        </p>
      </div>
    );
  }

  return (
    /* ✅ SINGLE SCROLLABLE CONTENT AREA */
    <div className="p-6 overflow-y-auto">
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
              className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-64 z-50"
            >
              <h2 className="text-lg font-semibold p-3 border-b">
                Select Device
              </h2>
              <ul className="max-h-48 overflow-y-auto">
                {devices.map((device) => (
                  <li key={device.d_id}>
                    <button
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowDevices(false);
                      }}
                      className="w-full text-left p-3 hover:bg-green-100"
                    >
                      {device.d_id} – {device.device_status}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Device Info */}
      {selectedDevice && (
        <div className="mt-6 bg-green-50 border-l-4 border-green-700 p-4 rounded shadow">
          <p className="font-semibold text-green-800">
            Device ID: {selectedDevice.d_id}
          </p>
          <p>Status: {selectedDevice.device_status}</p>
          <p>Last Seen: {selectedDevice.last_seen}</p>
        </div>
      )}

      {/* Export Controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="font-semibold text-green-700">Start Date</label>
          <input
            type="date"
            className="w-full mt-2 border rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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

        <div className="flex items-end">
          <button
            onClick={handleExport}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
          >
            Export From Date to Date
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-12 overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm border-collapse">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="p-3 text-left">Timestamp</th>
              <th className="p-3 text-left">Temp (°C)</th>
              <th className="p-3 text-left">Humidity (%)</th>
              <th className="p-3 text-left">Rainfall</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length ? (
              tableData.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="p-3">{row.temp}</td>
                  <td className="p-3">{row.humidity}</td>
                  <td className="p-3">{row.rainfall}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
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
