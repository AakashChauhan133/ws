import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthProvider";
import WeatherTimeline from "../timeline";

// --- Main Spray Component ---
export default function Spray() {
  const { devices, devicesLoading } = useAuth();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* 🔌 Auto-select first device */
  useEffect(() => {
    if (!devicesLoading && devices.length > 0 && !selectedDevice) {
      setSelectedDevice(devices[0]);
    }
  }, [devicesLoading, devices, selectedDevice]);

  /* 🌦 Fetch weather forecast */
  useEffect(() => {
    if (!selectedDevice?.latitude || !selectedDevice?.longitude) return;

    const getWeatherData = async () => {
      setLoading(true);
      setError(null);

      const apiKey = "371b716c25a9e70d9b96b6dc52443a7a";
      const { latitude, longitude } = selectedDevice;

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=8&appid=${apiKey}&units=metric`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const result = await response.json();

        const processedData = result.list.map((forecast, index) => {
          const date = new Date(forecast.dt * 1000);
          return {
            id: index,
            date: date.toLocaleString("en-IN", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
            title: `${Math.round(
              forecast.main.temp
            )}°C – ${forecast.weather[0].description}`,
            description: `Humidity: ${forecast.main.humidity}% | Wind: ${forecast.wind.speed} m/s`,
          };
        });
        setWeatherData(processedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    getWeatherData();
  }, [selectedDevice]);

  return (
    /* ✅ PURE CONTENT CONTAINER */
    <div className="p-6 bg-gray-50 min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-green-900 mb-2">
        Spray Decision Support
      </h1>

      <p className="text-gray-600 mb-6">
        Real-time spray recommendations and 30-hour weather forecast.
      </p>

      {loading && (
        <p className="text-gray-500">Fetching weather forecast…</p>
      )}

      {error && (
        <p className="text-red-500">
          Error fetching data: {error}
        </p>
      )}

      {!loading && !error && (
        <div className="w-full">
          <WeatherTimeline weatherData={weatherData} />
        </div>
      )}
    </div>
  );
}
