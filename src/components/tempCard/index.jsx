import React from 'react';

// --- Helper function to get theme details based on temperature ---
const getTempDetails = (temp) => {
    const MAX_TEMP = 50; // The top of our thermometer's scale
    const percentage = Math.min(Math.max(temp / MAX_TEMP, 0) * 100, 100);

    if (temp < 15) {
        return { percentage, bg: 'from-blue-100 to-sky-100', text: 'text-blue-700', fill: 'fill-blue-500' };
    } else if (temp < 30) {
        return { percentage, bg: 'from-green-100 to-yellow-50', text: 'text-green-700', fill: 'fill-green-500' };
    } else if (temp < 40) {
        return { percentage, bg: 'from-yellow-100 to-orange-50', text: 'text-orange-700', fill: 'fill-orange-500' };
    } else {
        return { percentage, bg: 'from-orange-100 to-red-100', text: 'text-red-700', fill: 'fill-red-500' };
    }
};

// --- Helper function to format time ---
const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// --- The Redesigned Temperature Card Component ---
const TempCard = ({ tempValue, minValue, minTime, maxValue, maxTime, noData }) => {
    const temp = Math.round(tempValue || 0);
    const details = getTempDetails(temp);

    return (
        <div className={`bg-gradient-to-br ${details.bg} rounded-xl border-2 border-white p-6 flex flex-col justify-between text-center h-full shadow-md transition duration-300 ease-in-out hover:shadow-lg`}>
            <h3 className={`text-xl font-bold ${details.text}`}>Temperature</h3>
            
            <div className="flex items-center justify-center gap-4 my-4">                
                {/* Temperature Reading */}
                <div className={`text-7xl font-black ${details.text} tracking-tight`}>
                    {temp}°C
                </div>
            </div>

            {/* Min/Max with theme */}
            <div className="w-full text-sm">
                <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Minimum</span>
                    <span className={`${details.text} font-semibold`}>
                        {noData ? "N/A" : `${minValue}°C (${formatTime(minTime)})`}
                    </span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Maximum</span>
                    <span className={`${details.text} font-semibold`}>
                        {noData ? "N/A" : `${maxValue}°C (${formatTime(maxTime)})`}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TempCard;
