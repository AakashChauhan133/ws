import React, { useRef, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import {  Loader2 } from 'lucide-react';
import DeviceLocation from './liveData/DeviceLoactions';
import { useAuth } from './AuthProvider';
import API_BASE_URL from './config';
import axios from 'axios';
import TempCard from './liveData/TempCard';
import LightIntensityGauge from './liveData/lightIntensity';
import DepthTemperatureGauge from './liveData/depthTemp';
import DepthHumidityGauge from './liveData/depthHumidity';
import SurfaceTemperatureGauge from './liveData/surfaceTemp';
import SurfaceHumidityGauge from './liveData/surfaceHumidity';
import WindCompass from './liveData/windCompass';
import RainfallCard from './liveData/rainfallCard';
import DeviceInfoCard from './liveData/deviceInfo';
import SimpleHumidityCard from './liveData/humidity';
import Spinner from './components/spinner';
import PressureCard from './liveData/pressure';
import LeafWetnessCard from './liveData/leafWetness';

const now = new Date();
const currentHour = now.getHours();


export default function LiveData() {
  const { devices, devicesLoading, devicesError} = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDevices, setShowDevices] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const [liveData, setLiveData] = useState(null);
  const [liveDataLoading, setLiveDataLoading] = useState(true);

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


  
  useEffect(() => {
  // Guard clause to ensure we have a device to fetch data for
  if (!selectedDevice) {
    // Return a cleanup function that does nothing, to avoid errors
    return () => {}; 
  }

  // Function to fetch the data
  const fetchLiveData = () => {
    setLiveDataLoading(true);
    axios.get(`${API_BASE_URL}/live-data/${selectedDevice.d_id}`, {
      withCredentials: true
    })
    .then(res => {
      if (res.data.status) {
        setLiveData(res.data.data[0]);
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
  };

  // Run the fetch immediately when the component mounts or selectedDevice changess
  fetchLiveData();

  // Set up the interval to run the fetch every 15 minutes (900000 ms)
  const intervalId = setInterval(fetchLiveData, 15 * 60 * 1000); 

  // Return a cleanup function that clears the interval
  return () => {
    clearInterval(intervalId);
    console.log("Interval cleared.");
  };

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
      max: { value: maxEntry[field], time: maxEntry.timestamp }
    };
  });
  setNoData(false);
  setExtremes(result);
}, [historyData]);

if (liveDataLoading) {
  return <Spinner/>
}

// console.log('time',liveData?.timestamp)
// console.log("history data", historyData)
// console.log('min',extremes?.temp?.min.value);

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

              {/* Device Info Card */}
              <DeviceInfoCard 
                selectedDevice={selectedDevice} 
                hour={currentHour}
              />
              
              {/* Device Location Card */}
              <DeviceLocation 
                selectedDevice={selectedDevice}  
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6">
              {/* Temperature Card */}
              <TempCard 
                tempValue={liveData?.temp}
                minValue={extremes?.temp?.min.value} 
                minTime={extremes?.temp?.min.time} 
                maxValue={extremes?.temp?.max.value}
                maxTime={extremes?.temp?.max.time}
              />

              {/* Rainfall */}
              <RainfallCard 
                rainfallValue={liveData?.rainfall} 
              /> 

              {/* Light Intensity */}
              <LightIntensityGauge 
                luxValue={liveData?.light_intensity}
              />

              {/* Leaf Wetness */}
              < LeafWetnessCard wetnessHours={0.6} />

              {/* Humidity Gauge */}
              <SimpleHumidityCard 
                humidityValue={liveData?.humidity}
                minValue={extremes?.humidity?.min.value} 
                minTime={extremes?.humidity?.min.time} 
                maxValue={extremes?.humidity?.max.value}
                maxTime={extremes?.humidity?.max.time} 
              />  

              {/* Wind Direction */}
              <WindCompass 
                windSpeed={liveData?.wind_speed} 
                windDirection={liveData?.wind_direction} 
              />

              {/* Pressure Card */}
              < PressureCard pressureValue={liveData?.pressure} />

              {/* Depth Temperature */}
              <DepthTemperatureGauge 
                tempValue={liveData?.depth_temp}
                minValue={extremes?.depth_temp?.min.value} 
                minTime={extremes?.depth_temp?.min.time} 
                maxValue={extremes?.depth_temp?.max.value}
                maxTime={extremes?.depth_temp?.max.time}
              />

              {/* Depth Humidity */}
              <DepthHumidityGauge 
                humidityValue={liveData?.depth_humidity} 
                minValue={extremes?.depth_humidity?.min.value} 
                minTime={extremes?.depth_humidity?.min.time} 
                maxValue={extremes?.depth_humidity?.max.value}
                maxTime={extremes?.depth_humidity?.max.time}
              />

              {/* Surface Temperature */}
              <SurfaceTemperatureGauge 
                tempValue={liveData?.surface_temp}
                minValue={extremes?.surface_temp?.min.value} 
                minTime={extremes?.surface_temp?.min.time} 
                maxValue={extremes?.surface_temp?.max.value}
                maxTime={extremes?.surface_temp?.max.time}
              />

              {/* Surface Humidity */}
              <SurfaceHumidityGauge 
                humidityValue={liveData?.surface_humidity} 
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
