import React, { useState, useEffect } from 'react';
import Sidebar from "../Sidebar";
import { useAuth } from "../AuthProvider"; // To get the selected device
import WeatherTimeline from "../timeline"; // Your timeline component

// --- Main Spray Component ---
export default function Spray() {
    const { devices, devicesLoading } = useAuth();
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [weatherData, setWeatherData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Automatically select the first device from the list when it becomes available
    useEffect(() => {
        if (!devicesLoading && devices.length > 0 && !selectedDevice) {
            setSelectedDevice(devices[0]);
        }
    }, [devicesLoading, devices, selectedDevice]);

    // This effect runs when a device is selected to fetch the weather forecast
    useEffect(() => {
        // Don't run if we don't have a device with location data yet
        if (!selectedDevice || !selectedDevice.latitude || !selectedDevice.longitude) {
            return;
        }

        const getWeatherData = async () => {
            setLoading(true);
            setError(null);

            const apiKey = "371b716c25a9e70d9b96b6dc52443a7a"; // Your OpenWeatherMap API key
            const { latitude, longitude } = selectedDevice;
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=8&appid=${apiKey}&units=metric`;

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();

                // Process the API data to fit the timeline's expected structure
                const processedData = result.list.map((forecast, index) => {
                    const date = new Date(forecast.dt * 1000);
                    const readableDate = date.toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    });

                    return {
                        id: index,
                        date: readableDate,
                        title: `${Math.round(forecast.main.temp)}°C with ${forecast.weather[0].description}`,
                        description: `Humidity: ${forecast.main.humidity}%. Wind: ${forecast.wind.speed} m/s.`,
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
    }, [selectedDevice]); // This dependency ensures the fetch runs when the device changes

    return (
        <div className="flex bg-gray-50 text-gray-800 h-full min-h-screen">
            {/* Sidebar */}
            <div className="hidden md:block w-64 flex-shrink-0 bg-white border-r shadow">
                <Sidebar />
            </div>

            <div className="flex-1 p-6">
                {/* Mobile Responsive Sidebar */}
                <div className="-mx-6 -mt-6 md:hidden mb-4">
                    <Sidebar />
                </div>
                <h1 className="text-3xl font-bold text-green-900 mb-2">Spray Decision Support</h1>
                <p className="text-gray-600 mb-6">
                    Real-time spray recommendations and 30-hour weather forecast.
                </p>

                <div className="w-full mx-auto">
                    {error && <p className="text-red-500 text-center">Error fetching data: {error}</p>}
                    {/* The WeatherTimeline component now receives the correct prop */}
                    <WeatherTimeline weatherData={weatherData} />
                </div>
            </div>
        </div>
    );
}

