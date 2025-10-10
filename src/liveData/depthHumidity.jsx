import React from 'react';

// --- Simplified helper function to get status details based on humidity % ---
const getHumidityDetails = (humidity) => {
    // These thresholds define the state of the soil moisture.
    if (humidity < 30) return { description: 'Dry', color: 'bg-red-500', textColor: 'text-red-500' };
    if (humidity <= 70) return { description: 'Moist', color: 'bg-green-500', textColor: 'text-green-500' };
    return { description: 'Wet', color: 'bg-blue-500', textColor: 'text-blue-500' };
};

const formatTime = (timestamp, isShort = false) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isShort) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleString('en-US');
};

// --- The Simplified Depth Humidity Gauge Component ---
const DepthHumidityGauge = ({ humidityValue, minValue, minTime, maxValue, maxTime, noData }) => {
    // Default to 0 if humidityValue is null or undefined, then round it
    const displayHumidity = Math.round(humidityValue || 0);
    const details = getHumidityDetails(displayHumidity);

    return (
        <div className="bg-white rounded-xl p-8 flex flex-col justify-center items-center text-center h-full border-2 shadow-md transition duration-300 ease-in-out hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-500 mb-4">Depth Humidity</h3>
            
            <p className="text-7xl font-black text-gray-800">
                {displayHumidity}%
            </p>
            
            <div className="flex items-center mt-4">
                <div className={`w-3 h-3 rounded-full ${details.color} mr-2`}></div>
                <p className={`text-lg font-bold ${details.textColor}`}>{details.description}</p>
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

export default DepthHumidityGauge;
