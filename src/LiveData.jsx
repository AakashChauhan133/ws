import React, { useRef, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import GaugeChart from 'react-gauge-chart';
import {
  XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import {  Loader2 } from 'lucide-react';
import WindDirectionCard from './WindDirection';
import RainfallCard from './RainfallCard';
import DeviceLocation from './DeviceLoactions';
import { useAuth } from './AuthProvider';
import API_BASE_URL from './config';
import axios from 'axios';
import TempCard from './TempCard';

export default function LiveData() {
  const { devices, devicesLoading, devicesError} = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [liveData, setLiveData] = useState(null);
  const [liveDataLoading, setLiveDataLoading] = useState(false);

  const [historyData, setHistoryData] = useState([]);
  const [extremes, setExtremes] = useState({});
  const [noData, setNoData] = useState(true);

  // Track loading timer
useEffect(() => {
  // console.log("devicesLoading changed:", devicesLoading);
  let interval;

  if (devicesLoading) {
    console.log("Starting timer...");
    setLoadingSeconds(0);
    interval = setInterval(() => {
      setLoadingSeconds((prev) => prev + 1);
    }, 1000);
  } 

  return () => {
    // console.log("Clearing interval...");
    clearInterval(interval);
  };
}, [devicesLoading]);



  // Close dropdown if clicking outside
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

  // Select first device automatically when loaded
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
      console.log(devices)
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Fetch live data whenever device changes
  useEffect(() => {
    if (!selectedDevice) return;

    setLiveDataLoading(true);
    axios.get(`${API_BASE_URL}/live-data/${selectedDevice.d_id}`, {
      withCredentials: true
    })
    .then(res => {
      if (res.data.status) {
        // console.log(res.data);
        setLiveData(res.data.data[0]); // store first object
      } else {
        console.error(res.data.message);
      }
    })
    .catch(err => {
      console.error("Error fetching live data:", err);
    })
    .finally(() => {
      setLiveDataLoading(false);
    });

  }, [selectedDevice]);

  // Fetch daily history
useEffect(() => {
  if (!selectedDevice) return;
  axios
    .get(`${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=daily`, {
      withCredentials: true,
    })
    .then((res) => {
      if (res.data.status && res.data.data.length > 0) {
        setHistoryData(res.data.data);
        setNoData(false); // ✅ reset message
      } else {
        setHistoryData([]); 
        setNoData(true); // ✅ show "no data" message
      }
    })
    .catch(() => {
      setHistoryData([]);
      setNoData(true); // ✅ also handle API error
    });
}, [selectedDevice]);

// Compute min/max for each field
useEffect(() => {
  if (!historyData.length) return;

  const fields = [
    "temp", "humidity", "aqi", "light_intensity",
    "rainfall", "wind_speed", "surface_temp", "surface_humidity",
    "depth_temp", "depth_humidity"
  ];

  const result = {};

  fields.forEach((field) => {
    let minEntry = historyData[0];
    let maxEntry = historyData[0];

    historyData.forEach((entry) => {
      if (entry[field] != null) {
        if (entry[field] < minEntry[field]) minEntry = entry;
        if (entry[field] > maxEntry[field]) maxEntry = entry;
      }
    });

    result[field] = {
      min: { value: minEntry[field], time: minEntry.timestamp },
      max: { value: maxEntry[field], time: maxEntry.timestamp },
    };
  });
  setNoData(false);
  setExtremes(result);
}, [historyData]);

// Format timestamp as Day dd/mm/yy hh:mm AM/PM
const formatTime = (timestamp, onlyTime = false) => {
  const date = new Date(timestamp);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayNames[date.getDay()];

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if(!onlyTime){
    return `${dayName} ${day}/${month}/${year} ${time}`;
  }
  return `${time}`;
};



  const Skeleton = ({ className }) => (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );




  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-6">
        {/* Mobile Sidebar */}
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>

        {/* Heading */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">Live Device Dashboard</h1>
          {!devicesLoading && devices.length > 0 && (
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
          )}
        </div>

        {/* Loading state */}
        {devicesLoading ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Loader2 className="w-12 h-12 text-green-700 animate-spin mb-4" />
            <p className="text-lg text-green-800 font-semibold">
              Loading devices... ({loadingSeconds}s)
            </p>
          </div>
        ) : devicesError ? (
          <p className="text-red-500 mt-6">{devicesError}</p>
        ) : (
          <>
            {/* Device Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="border p-4 rounded shadow hover:shadow-lg">
                <h2 className="text-lg font-semibold mb-2 text-green-700">Device Info</h2>
                <p><strong>ID:</strong> {selectedDevice?.d_id}</p>
                <p><strong>Status:</strong> {selectedDevice?.device_status}</p>
                <p><strong>Last Seen:</strong> {formatTime(selectedDevice?.last_seen)}</p>
              </div>

              <DeviceLocation selectedDevice={selectedDevice} />
            </div>

            
            {/* Sensor Data Cards */}
            {/* Sensor Data Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
  {/* Temperature Card */}
  <TempCard liveData={liveData} liveDataLoading={liveDataLoading} extremes={extremes} noData = {noData}/>

  {/* Humidity Gauge */}
<div className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white text-center hover:shadow-lg">
  <h3 className="text-lg font-semibold text-blue-700 mb-2">Humidity (%)</h3>

  {liveDataLoading ? (
    <Skeleton className="w-full h-[180px] mx-auto" />
  ) : (
    <>
      <GaugeChart
        id="humidity-gauge"
        nrOfLevels={4}
        percent={ (liveData?.humidity ?? 0) / 100}
        colors={["#a7f3d0", "#059669"]}
        arcWidth={0.3}
        textColor="#1f2937"
        style={{ width: "320px", height: "120px", margin: "0 auto" }}
      />

      <div className="mt-3 space-y-1 text-sm">
        <p className="flex justify-between">
          <span className="text-gray-700 font-medium">Minimum</span>
          <span className={` font-semibold`}>
            {noData ? "N/A" : `${extremes?.humidity?.min.value}% (${formatTime(extremes?.humidity?.min.time, true)})`}
          </span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-700 font-medium">Maximum</span>
          <span className={`font-semibold`}>
            {noData ? "N/A" : `${extremes?.humidity?.max.value}% (${formatTime(extremes?.humidity?.max.time, true)})`}
          </span>
        </p>
      </div>
    </>
  )}
</div>

  {/* AQI Gauge */}
  <div className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white text-center hover:shadow-lg">
    <h3 className="text-lg font-semibold text-yellow-700 mb-2">AQI</h3>
    {liveDataLoading ? (
      <Skeleton className="w-full h-[180px] mx-auto" />
    ) : (
      <GaugeChart
        id="aqi-gauge"
        nrOfLevels={4}
        percent={(liveData?.aqi ?? 0) / 100}
        colors={["#22c55e", "#facc15", "#ef4444"]}
        arcWidth={0.3}
        textColor="#1f2937"
      />
    )}
  </div>

  {/* Light Intensity */}
  <div className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white hover:shadow-lg">
    <h3 className="text-lg font-semibold text-indigo-700 mb-2">Light Intensity (Lux)</h3>
    {liveDataLoading ? (
      <Skeleton className="w-full h-[200px]" />
    ) : (
      <div style={{ width: '100%', aspectRatio: '2 / 1' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={[{ name: liveData?.light_intensity, value: liveData?.light_intensity }]}>
            <XAxis dataKey="name" stroke="#4b5563" />
            <YAxis stroke="#4b5563" />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    )}
  </div>

  {/* Rainfall */}
  
  <RainfallCard liveDataLoading = {liveDataLoading} rainfall={liveData?.rainfall}/>
  

  {/* Wind Direction */}
  <WindDirectionCard liveDataLoading={liveDataLoading} windDirection={liveData?.wind_direction} windSpeed={liveData?.wind_speed}/>

  {/* Surface & Depth Metrics */}
  {[
    { label: "Depth Humidity", value: liveData?.depth_humidity, color: "text-green-700" },
    { label: "Depth Temperature", value: liveData?.depth_temp, color: "text-green-700" },
    { label: "Surface Humidity", value: liveData?.surface_humidity, color: "text-green-700" },
    { label: "Surface Temperature", value: liveData?.surface_temp, color: "text-green-700" },
  ].map((item, idx) => (
    <div
      key={idx}
      className="border border-gray-200 p-4 rounded-xl shadow-sm bg-white hover:shadow-lg"
    >
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{item.label}</h3>
      {liveDataLoading ? (
        <Skeleton className="w-16 h-8" />
      ) : (
        <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
      )}
    </div>
  ))}
</div>

          </>
        )}
      </div>
    </div>
  );
}
