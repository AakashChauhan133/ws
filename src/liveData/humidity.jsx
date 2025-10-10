import React from 'react';

// --- Simplified helper function to get status details ---
const getHumidityDetails = (humidity) => {
    if (humidity < 40) return { description: 'Dry', color: 'bg-amber-500', textColor: 'text-amber-500' };
    if (humidity <= 70) return { description: 'Normal', color: 'bg-green-500', textColor: 'text-green-500' };
    return { description: 'Humid', color: 'bg-blue-500', textColor: 'text-blue-500' };
};

// --- Helper function to format time from a timestamp ---
const formatTime = (timestamp, isShort = false) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isShort) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleString('en-US');
};

// --- The Enhanced Humidity Component ---
const SimpleHumidityCard = ({ humidityValue, minValue, minTime, maxValue, maxTime, noData = true }) => {
    const displayHumidity = Math.round(humidityValue || 0);
    const details = getHumidityDetails(displayHumidity);

    return (
        <div className=" bg-white rounded-xl border-2 p-6 flex flex-col justify-between items-center text-center h-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
            {/* Main Display */}
            <div>
                <h3 className="text-lg font-semibold text-gray-500 mb-4">Humidity</h3>
                <div className="flex items-baseline">
                    <p className="text-7xl font-black text-gray-800">
                        {displayHumidity}
                    </p>
                    <span className="text-3xl font-bold text-gray-500">%</span>
                </div>
                <div className="flex items-center mt-4 justify-center">
                    <div className={`w-3 h-3 rounded-full ${details.color} mr-2`}></div>
                    <p className={`text-lg font-bold ${details.textColor}`}>{details.description}</p>
                </div>
            </div>
            
            {/* Min/Max Section */}
            <div className="w-full mt-6 text-sm">
                <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Minimum</span>
                    <span className="font-semibold text-gray-800">
                        {noData ? "N/A" : `${minValue}% (${formatTime(minTime, true)})`}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-100">
                    <span className="text-gray-600 font-medium">Maximum</span>
                    <span className="font-semibold text-gray-800">
                         {noData ? "N/A" : `${maxValue}% (${formatTime(maxTime, true)})`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SimpleHumidityCard;

