import React from 'react';

// --- Helper function to get status details ---
const getHumidityDetails = (humidity) => {
    // Returns different UI properties based on the humidity level
    if (humidity < 40) return { 
        description: 'Dry', 
        color: 'bg-amber-500', 
        textColor: 'text-amber-700', 
        bg: 'from-amber-100 to-yellow-50' 
    };
    if (humidity <= 70) return { 
        description: 'Normal', 
        color: 'bg-green-500', 
        textColor: 'text-green-700', 
        bg: 'from-green-100 to-teal-50' 
    };
    return { 
        description: 'Humid', 
        color: 'bg-blue-500', 
        textColor: 'text-blue-700', 
        bg: 'from-sky-100 to-blue-100' 
    };
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
const SimpleHumidityCard = ({ humidityValue, minValue, minTime, maxValue, maxTime, noData }) => {
    const displayHumidity = Math.round(humidityValue || 0);
    const details = getHumidityDetails(displayHumidity);

    return (
        <div className={`bg-gradient-to-br border-2 border-white ${details.bg} rounded-xl p-6 flex flex-col justify-between items-center text-center h-full shadow-md transition-all duration-500 ease-in-out hover:shadow-lg`}>
            {/* Main Display */}
            <div>
                <h3 className={`text-xl font-bold ${details.textColor} opacity-80 mb-4`}>Humidity</h3>
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
                <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Minimum</span>
                    <span className={`font-semibold ${details.textColor}`}>
                        {noData ? "N/A" : `${minValue}% (${formatTime(minTime, true)})`}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Maximum</span>
                    <span className={`font-semibold ${details.textColor}`}>
                         {noData ? "N/A" : `${maxValue}% (${formatTime(maxTime, true)})`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SimpleHumidityCard;

