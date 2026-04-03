import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

// --- Real Imports Retained as Requested ---
import { useAuth } from "./AuthProvider";
import API_BASE_URL from "./config";
import TempCard from "./components/tempCard";
import RainfallCard from "./components/rainfallCard";
import LightIntensityGauge from "./components/lightIntensity";
import LeafWetnessCard from "./components/leafWetness";
import SimpleHumidityCard from "./components/humidity";
import WindCompass from "./components/windCompass";
import PressureCard from "./components/pressure";
import DepthTemperatureGauge from "./components/depthTemp";
import DepthHumidityGauge from "./components/depthHumidity";
import SurfaceTemperatureGauge from "./components/surfaceTemp";
import SurfaceHumidityGauge from "./components/surfaceHumidity";
import DeviceInfoCard from "./components/deviceInfo";
import Spinner from "./components/spinner";

const now = new Date();
const currentHour = now.getHours();

// Placeholder component for DeviceLocation - update as needed
const DeviceLocation = ({ selectedDevice }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <h3 className="text-lg font-semibold text-gray-800">Device Location</h3>
    <p className="text-gray-600 mt-2">
      {selectedDevice?.location_name ||
        selectedDevice?.location ||
        "Location not available"}
    </p>
  </div>
);

export default function LiveData() {
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState(null);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Safely get the device ID
  const deviceId = selectedDevice?.id || selectedDevice?.d_id;

  // Local state for the new pivoted API data
  const [liveData, setLiveData] = useState(null);
  const [liveDataLoading, setLiveDataLoading] = useState(true);
  const [liveDataError, setLiveDataError] = useState(null);

  const [historyData, setHistoryData] = useState([]);
  const [sensorMap, setSensorMap] = useState({}); // Stores dynamic sensor ID mapping
  const [extremes, setExtremes] = useState({});
  const [noData, setNoData] = useState(true);

  // 1. Fetch Devices from the backend route
  useEffect(() => {
    const fetchDevices = async () => {
      setDevicesLoading(true);
      const token = localStorage.getItem("access_token");

      try {
        const res = await axios.get(`${API_BASE_URL}/devices/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Ensure we always have an array
        const fetchedDevices = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];
        setDevices(fetchedDevices);
        setDevicesError(null);
      } catch (err) {
        console.error("Error fetching devices:", err);
        setDevicesError("Failed to load devices.");
      } finally {
        setDevicesLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Track loading timer
  useEffect(() => {
    let interval;
    if (devicesLoading) {
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds((p) => p + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
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
    }
  }, [devicesLoading, devices, selectedDevice]);

  // 2. Fetch Installed Sensors to dynamically build the map
  useEffect(() => {
    if (!deviceId) return;

    const token = localStorage.getItem("access_token");

    axios
      .get(`${API_BASE_URL}/sensors/device/${deviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data?.data) {
          const mapping = {};
          // Map each sensor's dynamic ID to its string label (e.g., 3 -> "temp")
          res.data.data.forEach((sensor) => {
            mapping[sensor.id] = sensor.sensor_label;
          });
          setSensorMap(mapping);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch sensor configuration:", err);
      });
  }, [deviceId]);

  // 3. ⏱️ Fetch Live Data directly using the newly optimized pivoted endpoint
  useEffect(() => {
    if (!deviceId) return;
    let isMounted = true;
    setLiveDataLoading(true);

    const fetchLive = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await axios.get(
          `${API_BASE_URL}/devices/${deviceId}/live-data`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (isMounted) {
          if (res.data?.data && res.data.data.length > 0) {
            setLiveData(res.data.data[0]);
          } else {
            setLiveData(null);
          }
          setLiveDataError(null);
          setLiveDataLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Live data fetch error:", err);
          setLiveDataError("Failed to fetch live data.");
          setLiveDataLoading(false);
        }
      }
    };

    fetchLive();
    // Poll the FastAPI backend every 30 seconds
    const interval = setInterval(fetchLive, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [deviceId]);

  // 4. Fetch device history using the new device history API endpoint
  useEffect(() => {
    if (!deviceId) return;

    const token = localStorage.getItem("access_token");

    axios
      .get(`${API_BASE_URL}/devices/${deviceId}/history`, {
        params: { range: "daily" }, // Apply time range filtering
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setHistoryData(res.data.data);
          setNoData(false);
        } else {
          setHistoryData([]);
          setNoData(true);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch historical data:", err);
        setHistoryData([]);
        setNoData(true);
      });
  }, [deviceId]);

  // Compute min/max for each field dynamically mapping using the API configuration
  useEffect(() => {
    if (!historyData.length || Object.keys(sensorMap).length === 0) return;

    const result = {};

    historyData.forEach((reading) => {
      // Find what UI field this ID belongs to dynamically via the API response
      const field = sensorMap[reading.device_sensor_id];

      if (!field) return;

      if (!result[field]) {
        // Initialize min and max for this field on its first occurrence
        result[field] = {
          min: { value: reading.value, time: reading.recorded_at },
          max: { value: reading.value, time: reading.recorded_at },
        };
      } else {
        if (reading.value < result[field].min.value) {
          result[field].min = {
            value: reading.value,
            time: reading.recorded_at,
          };
        }
        if (reading.value > result[field].max.value) {
          result[field].max = {
            value: reading.value,
            time: reading.recorded_at,
          };
        }
      }
    });

    setNoData(false);
    setExtremes(result);
  }, [historyData, sensorMap]);

  useEffect(() => {
    if (liveDataError) {
      console.error("Error fetching live data:", liveDataError);
    }
  }, [liveDataError]);

  if (liveDataLoading && !liveData && !devicesLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 max-w-full mx-auto">
        {/* Heading */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-green-800">
            Live Device Dashboard
          </h1>
          {!devicesLoading && devices.length > 0 && (
            <div className="relative">
              <button
                ref={buttonRef}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
                onClick={() => setShowDevices((prev) => !prev)}
              >
                Switch Device
              </button>

              {showDevices && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl w-72 z-[1000]"
                >
                  <h2 className="text-lg font-semibold p-4 border-b border-gray-100 text-gray-800">
                    Select Device
                  </h2>
                  <ul className="max-h-[300px] overflow-y-auto p-2">
                    {devices.map((device) => (
                      <li key={device.id || device.d_id}>
                        <button
                          onClick={() => {
                            setSelectedDevice(device);
                            setShowDevices(false);
                          }}
                          className="w-full text-left p-3 hover:bg-green-50 rounded-md transition-colors text-gray-700"
                        >
                          {device.device_name ||
                            device.farm_name ||
                            `Device ${device.id || device.d_id}`}
                          <span className="block text-xs text-gray-400 mt-1 uppercase">
                            {device.status || device.device_status}
                          </span>
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
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-lg text-green-800 font-semibold">
              Loading devices... ({loadingSeconds}s)
            </p>
          </div>
        ) : devicesError ? (
          <div className="p-4 mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {devicesError}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Device Info Card */}
              <DeviceInfoCard
                selectedDevice={selectedDevice}
                hour={currentHour}
              />

              {/* Device Location Card */}
              <DeviceLocation selectedDevice={selectedDevice} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pt-6 pb-12">
              {/* Temperature Card */}
              <TempCard
                tempValue={liveData?.temp}
                minValue={extremes?.temp?.min?.value}
                minTime={extremes?.temp?.min?.time}
                maxValue={extremes?.temp?.max?.value}
                maxTime={extremes?.temp?.max?.time}
              />

              {/* Rainfall */}
              <RainfallCard rainfallValue={liveData?.rain} />

              {/* Light Intensity */}
              <LightIntensityGauge luxValue={liveData?.light} />

              {/* Leaf Wetness */}
              <LeafWetnessCard wetnessHours={liveData?.leaf} />

              {/* Humidity Gauge */}
              <SimpleHumidityCard
                humidityValue={liveData?.humidity}
                minValue={extremes?.humidity?.min?.value}
                minTime={extremes?.humidity?.min?.time}
                maxValue={extremes?.humidity?.max?.value}
                maxTime={extremes?.humidity?.max?.time}
              />

              {/* Wind Direction */}
              <WindCompass
                windSpeed={liveData?.wind}
                windDirection={liveData?.wind_direction}
              />

              {/* Pressure Card */}
              <PressureCard pressureValue={liveData?.pressure} />

              {/* Depth Temperature */}
              <DepthTemperatureGauge
                tempValue={liveData?.depth_temp}
                minValue={extremes?.depth_temp?.min?.value}
                minTime={extremes?.depth_temp?.min?.time}
                maxValue={extremes?.depth_temp?.max?.value}
                maxTime={extremes?.depth_temp?.max?.time}
              />

              {/* Depth Humidity */}
              <DepthHumidityGauge
                humidityValue={liveData?.depth_humidity}
                minValue={extremes?.depth_humidity?.min?.value}
                minTime={extremes?.depth_humidity?.min?.time}
                maxValue={extremes?.depth_humidity?.max?.value}
                maxTime={extremes?.depth_humidity?.max?.time}
              />

              {/* Surface Temperature */}
              <SurfaceTemperatureGauge
                tempValue={liveData?.surface_temp}
                minValue={extremes?.surface_temp?.min?.value}
                minTime={extremes?.surface_temp?.min?.time}
                maxValue={extremes?.surface_temp?.max?.value}
                maxTime={extremes?.surface_temp?.max?.time}
              />

              {/* Surface Humidity */}
              <SurfaceHumidityGauge
                humidityValue={liveData?.surface_humidity}
                minValue={extremes?.surface_humidity?.min?.value}
                minTime={extremes?.surface_humidity?.min?.time}
                maxValue={extremes?.surface_humidity?.max?.value}
                maxTime={extremes?.surface_humidity?.max?.time}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
