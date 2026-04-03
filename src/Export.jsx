import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import API_BASE_URL from "./config";

const todayDate = new Date().toISOString().split("T")[0];

export default function Export() {
  // 1. Local state for Devices (Replacing useAuth to ensure strict JWT flow)
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [sensorMap, setSensorMap] = useState({});

  // Calculate 7 days ago natively in YYYY-MM-DD for the default start date
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const defaultStartDate = lastWeek.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [isPivoting, setIsPivoting] = useState(false);

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

  /* 📡 Fetch Devices */
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDevices]);

  /* 🗺️ Fetch Installed Sensors to dynamically build the map */
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
        console.error("Failed to fetch sensor configuration:", err);
      }
    };
    fetchSensorMap();
  }, [selectedDevice]);

  /* 🔄 Core Data Fetching and Pivoting Logic (Like pandas.pivot_table) */
  const fetchAndPivotData = async (range, fromDate = null, toDate = null) => {
    if (!selectedDevice || Object.keys(sensorMap).length === 0) return [];

    setIsPivoting(true);
    const deviceId = selectedDevice.id || selectedDevice.d_id;
    const token = localStorage.getItem("access_token");

    try {
      const params = { range };
      if (range === "custom") {
        params.from = fromDate;
        params.to = toDate;
      }

      const response = await axios.get(
        `${API_BASE_URL}/devices/${deviceId}/history`,
        {
          params,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const rawData = response.data?.data || [];
      const groupedData = {};

      // Pivot the long-format EAV rows into wide-format rows based on Timestamp
      rawData.forEach((item) => {
        const timeVal = item.recorded_at || item.timestamp;

        if (!groupedData[timeVal]) {
          groupedData[timeVal] = {
            timestamp: timeVal,
            _timestamp: new Date(timeVal).getTime(), // Used for exact sorting
          };
        }

        const label = sensorMap[item.device_sensor_id];
        if (label) {
          groupedData[timeVal][label] = parseFloat(item.value);
        }
      });

      // Convert to array and sort descending (newest first)
      const pivotedArray = Object.values(groupedData).sort(
        (a, b) => b._timestamp - a._timestamp,
      );
      return pivotedArray;
    } catch (err) {
      console.error(`Failed to fetch/pivot ${range} data:`, err);
      return [];
    } finally {
      setIsPivoting(false);
    }
  };

  /* 📊 Fetch Initial table data (Weekly Default) */
  useEffect(() => {
    const loadInitialData = async () => {
      // Use the FastAPI built-in 'weekly' range for standard loads
      const data = await fetchAndPivotData("weekly");
      setTableData(data);
    };

    // Ensure sensor map is ready before trying to pivot
    if (Object.keys(sensorMap).length > 0) {
      loadInitialData();
    }
  }, [selectedDevice, sensorMap]);

  /* ⬇️ Custom Range Table & Export handler */
  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    // Fetch the new custom range
    const data = await fetchAndPivotData("custom", startDate, endDate);

    if (!data.length) {
      alert("No records found for this date range.");
      return;
    }

    // Update the UI table to show what they just exported
    setTableData(data);

    // Clean data for Excel (Remove sorting metadata, format date)
    const exportData = data.map((row) => {
      const { _timestamp, ...cleanRow } = row;
      cleanRow.timestamp = new Date(cleanRow.timestamp).toLocaleString();
      return cleanRow;
    });

    try {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sensor Data");

      const fileName = `${selectedDevice?.device_name || selectedDevice?.device_uid || "device"}_export.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export data to Excel.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-black">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-green-800">
            Export Device Data
          </h1>
          {!devicesLoading && devices.length > 0 && (
            <div className="relative">
              <button
                ref={buttonRef}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow-sm"
                onClick={() => setShowDevices((prev) => !prev)}
              >
                Switch Device
              </button>
              {showDevices && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-72 z-[1000]"
                >
                  <h2 className="text-lg font-semibold p-4 border-b border-gray-100">
                    Select Device
                  </h2>
                  <ul className="max-h-[200px] overflow-y-auto p-2">
                    {devices.map((device) => (
                      <li key={device.id || device.d_id}>
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowDevices(false);
                          }}
                          className="w-full text-left p-3 hover:bg-green-50 rounded-md transition-colors"
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
          )}
        </div>

        {/* Selected Device Card */}
        {selectedDevice && (
          <div className="mt-8 bg-green-50 border-l-4 border-green-700 p-5 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-green-800">
                {selectedDevice.device_name ||
                  selectedDevice.farm_name ||
                  "Sensor Node"}
              </h3>
              <p className="text-sm text-gray-700">
                UID:{" "}
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
            <div className="text-sm text-gray-700 bg-white p-3 rounded border border-green-100">
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

        {/* Export Panel */}
        <div className="mt-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
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
                className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
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
                  className="text-sm text-green-600 hover:underline font-normal"
                  onClick={() => setEndDate(todayDate)}
                >
                  Set Today
                </button>
              </label>
              <input
                type="date"
                id="end-date"
                className="px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={todayDate}
              />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isPivoting}
              className={`w-full md:w-1/3 px-6 py-2.5 text-white rounded font-semibold transition-colors shadow-sm ${
                isPivoting
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isPivoting ? "Processing..." : "Export to Excel"}
            </button>
          </div>

          {/* Table Section */}
          <div className="mt-8 rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-green-800">DATA PREVIEW</h3>
              <span className="text-sm text-green-700 bg-green-200 px-2 py-1 rounded">
                {tableData.length} records
              </span>
            </div>
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full min-w-[1200px] text-sm table-auto border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="text-gray-600 font-semibold border-b border-gray-200">
                    <th className="p-3 text-left">TIMESTAMP</th>
                    <th className="p-3 text-left">TEMP (°C)</th>
                    <th className="p-3 text-left">HUMIDITY (%)</th>
                    <th className="p-3 text-left">LIGHT (lx)</th>
                    <th className="p-3 text-left">LEAF WETNESS</th>
                    <th className="p-3 text-left">RAINFALL (mm)</th>
                    <th className="p-3 text-left">WIND (m/s)</th>
                    <th className="p-3 text-left">SURFACE TEMP (°C)</th>
                    <th className="p-3 text-left">SURFACE HUM (%)</th>
                    <th className="p-3 text-left">DEPTH TEMP (°C)</th>
                    <th className="p-3 text-left">DEPTH HUM (%)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <tr
                        key={index}
                        className={`border-b border-gray-100 hover:bg-green-50 transition duration-150 ${
                          index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-900 whitespace-nowrap">
                          {new Date(row.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3">
                          {row.temp ?? row.temperature ?? "-"}
                        </td>
                        <td className="p-3">{row.humidity ?? "-"}</td>
                        <td className="p-3">
                          {row.light_intensity ?? row.light ?? "-"}
                        </td>
                        <td className="p-3">
                          {row.leaf_wetness ?? row.leafwetness ?? "-"}
                        </td>
                        <td className="p-3">{row.rainfall ?? "-"}</td>
                        <td className="p-3">
                          {row.wind_speed ?? row.wind ?? "-"}
                        </td>
                        <td className="p-3">{row.surface_temp ?? "-"}</td>
                        <td className="p-3">{row.surface_humidity ?? "-"}</td>
                        <td className="p-3">{row.depth_temp ?? "-"}</td>
                        <td className="p-3">{row.depth_humidity ?? "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="p-8 text-center text-gray-500"
                      >
                        {isPivoting
                          ? "Pivoting database records..."
                          : "No data found for this device in the selected timeframe."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
