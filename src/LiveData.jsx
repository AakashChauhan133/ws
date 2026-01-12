import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "./AuthProvider";
import useLiveDataPolling from "./hooks/useLiveDataPolling";
import API_BASE_URL from "./config";
import axios from "axios";
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
  <div className="bg-white border rounded-lg p-4">
    <h3 className="text-lg font-semibold text-gray-800">Device Location</h3>
    <p className="text-gray-600 mt-2">
      {selectedDevice?.location || "Location not available"}
    </p>
  </div>
);

export default function LiveData() {
  const { devices, devicesLoading, devicesError } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Use the custom polling hook
  const {
    data: liveData,
    loading: liveDataLoading,
    error: liveDataError,
  } = useLiveDataPolling(selectedDevice?.d_id);

  const [historyData, setHistoryData] = useState([]);
  const [extremes, setExtremes] = useState({});
  const [noData, setNoData] = useState(true);

  // Track loading timer
  useEffect(() => {
    let interval;

    if (devicesLoading) {
      console.log("Starting timer...");
      setLoadingSeconds(0);
      interval = setInterval(() => {
        setLoadingSeconds((p) => p + 1);
      }, 1000);
    }

    return () => {
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
    }
  }, [devicesLoading, devices, selectedDevice]);

  // Fetch daily history
  useEffect(() => {
    if (!selectedDevice) return;
    axios
      .get(
        `${API_BASE_URL}/devices/${selectedDevice.d_id}/history?range=daily`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.data.status && res.data.data.length > 0) {
          setHistoryData(res.data.data);
          setNoData(false);
        } else {
          setHistoryData([]);
          setNoData(true);
        }
      })
      .catch(() => {
        setHistoryData([]);
        setNoData(true);
      });
  }, [selectedDevice]);

  // Compute min/max for each field
  useEffect(() => {
    if (!historyData.length) return;

    const fields = [
      "temp",
      "humidity",
      "aqi",
      "light_intensity",
      "rainfall",
      "wind_speed",
      "surface_temp",
      "surface_humidity",
      "depth_temp",
      "depth_humidity",
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

  // Handle live data error
  useEffect(() => {
    if (liveDataError) {
      console.error("Error fetching live data:", liveDataError);
    }
  }, [liveDataError]);

  if (liveDataLoading && !liveData) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white p-6">
        {/* Heading */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">
            Live Device Dashboard
          </h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Device Info Card */}
              <DeviceInfoCard
                selectedDevice={selectedDevice}
                hour={currentHour}
              />

              {/* Device Location Card */}
              <DeviceLocation selectedDevice={selectedDevice} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
              {/* Temperature Card */}
              <TempCard
                tempValue={liveData?.sensors?.temperature}
                minValue={extremes?.temp?.min.value}
                minTime={extremes?.temp?.min.time}
                maxValue={extremes?.temp?.max.value}
                maxTime={extremes?.temp?.max.time}
              />

              {/* Rainfall */}
              <RainfallCard rainfallValue={liveData?.sensors?.rainfall} />

              {/* Light Intensity */}
              <LightIntensityGauge
                luxValue={liveData?.sensors?.lightIntensity}
              />

              {/* Leaf Wetness */}
              <LeafWetnessCard wetnessHours={liveData?.sensors?.leafWetness} />

              {/* Humidity Gauge */}
              <SimpleHumidityCard
                humidityValue={liveData?.sensors?.humidity}
                minValue={extremes?.humidity?.min.value}
                minTime={extremes?.humidity?.min.time}
                maxValue={extremes?.humidity?.max.value}
                maxTime={extremes?.humidity?.max.time}
              />

              {/* Wind Direction */}
              <WindCompass
                windSpeed={liveData?.sensors?.windSpeed}
                windDirection={liveData?.sensors?.windDirection}
              />

              {/* Pressure Card */}
              <PressureCard pressureValue={liveData?.sensors?.pressure} />

              {/* Depth Temperature */}
              <DepthTemperatureGauge
                tempValue={liveData?.sensors?.depth?.temperature}
                minValue={extremes?.depth_temp?.min.value}
                minTime={extremes?.depth_temp?.min.time}
                maxValue={extremes?.depth_temp?.max.value}
                maxTime={extremes?.depth_temp?.max.time}
              />

              {/* Depth Humidity */}
              <DepthHumidityGauge
                humidityValue={liveData?.sensors?.depth?.humidity}
                minValue={extremes?.depth_humidity?.min.value}
                minTime={extremes?.depth_humidity?.min.time}
                maxValue={extremes?.depth_humidity?.max.value}
                maxTime={extremes?.depth_humidity?.max.time}
              />

              {/* Surface Temperature */}
              <SurfaceTemperatureGauge
                tempValue={liveData?.sensors?.surface?.temperature}
                minValue={extremes?.surface_temp?.min.value}
                minTime={extremes?.surface_temp?.min.time}
                maxValue={extremes?.surface_temp?.max.value}
                maxTime={extremes?.surface_temp?.max.time}
              />

              {/* Surface Humidity */}
              <SurfaceHumidityGauge
                humidityValue={liveData?.sensors?.surface?.humidity}
                minValue={extremes?.surface_humidity?.min.value}
                minTime={extremes?.surface_humidity?.min.time}
                maxValue={extremes?.surface_humidity?.max.value}
                maxTime={extremes?.surface_humidity?.max.time}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
