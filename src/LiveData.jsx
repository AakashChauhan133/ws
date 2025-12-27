import React, { useRef, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Loader2 } from "lucide-react";
import DeviceLocation from "./components/deviceLocation";
import { useAuth } from "./AuthProvider";

import TempCard from "./components/tempCard";
import LightIntensityGauge from "./components/lightIntensity";
import DepthTemperatureGauge from "./components/depthTemp";
import DepthHumidityGauge from "./components/depthHumidity";
import SurfaceTemperatureGauge from "./components/surfaceTemp";
import SurfaceHumidityGauge from "./components/surfaceHumidity";
import WindCompass from "./components/windCompass";
import RainfallCard from "./components/rainfallCard";
import DeviceInfoCard from "./components/deviceInfo";
import SimpleHumidityCard from "./components/humidity";
import Spinner from "./components/spinner";
import PressureCard from "./components/pressure";
import LeafWetnessCard from "./components/leafWetness";

import useLiveDataPolling from "./hooks/useLiveDataPolling";

const now = new Date();
const currentHour = now.getHours();

export default function LiveData() {
  const { devices, devicesLoading, devicesError } = useAuth();

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  //  ONLY source of live data
  const {
    data: liveData,
    loading: liveDataLoading,
    error: liveDataError,
  } = useLiveDataPolling(selectedDevice?.d_id);

  // ⏱ Device loading timer
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

  //  Close dropdown on outside click
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

  //  Auto-select first device
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  //  ERROR STATES
  if (devicesError) {
    return <p className="text-red-500">{devicesError}</p>;
  }

  if (liveDataError) {
    return <p className="text-red-500">{liveDataError}</p>;
  }

  // ⏳ LOADING
  if (devicesLoading || liveDataLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-green-700 mb-4" />
        {devicesLoading && (
          <p className="text-green-800 font-semibold">
            Loading devices… ({loadingSeconds}s)
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r shadow">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto bg-white p-6">
        {/* Mobile Sidebar */}
        <div className="-mx-6 -mt-6 md:hidden mb-4">
          <Sidebar />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-green-800">
            Live Device Dashboard
          </h1>

          {!devicesLoading && devices.length > 0 && (
            <div className="relative">
              <button
                ref={buttonRef}
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={() => setShowDevices((p) => !p)}
              >
                Switch Device
              </button>

              {showDevices && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 bg-white border rounded shadow w-64 z-50"
                >
                  <h2 className="p-3 font-semibold border-b">
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
          )}
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <DeviceInfoCard
            selectedDevice={selectedDevice}
            hour={currentHour}
          />
          <DeviceLocation selectedDevice={selectedDevice} />
        </div>

        {/* Sensor cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
          <TempCard
            tempValue={liveData?.sensors?.temperature}
          />
          <RainfallCard
            rainfallValue={liveData?.sensors?.rainfall}
          />
          <LightIntensityGauge
            luxValue={liveData?.sensors?.lightIntensity}
          />
          <LeafWetnessCard
            wetnessHours={liveData?.sensors?.leafWetness}
          />
          <SimpleHumidityCard
            humidityValue={liveData?.sensors?.humidity}
          />
          <WindCompass
            windSpeed={liveData?.sensors?.windSpeed}
          />
          <PressureCard
            pressureValue={liveData?.sensors?.pressure}
          />
          <DepthTemperatureGauge
            tempValue={liveData?.sensors?.depth?.temperature}
          />
          <DepthHumidityGauge
            humidityValue={liveData?.sensors?.depth?.humidity}
          />
          <SurfaceTemperatureGauge
            tempValue={liveData?.sensors?.surface?.temperature}
          />
          <SurfaceHumidityGauge
            humidityValue={liveData?.sensors?.surface?.humidity}
          />
        </div>
      </div>
    </div>
  );
}
