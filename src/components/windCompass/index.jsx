"use client";

import React from 'react';

// --- Helper function to get details based on wind data ---
const getWindDetails = (speed, direction) => {
    let description = 'Calm';
    let bg = 'from-sky-100 to-blue-100';
    let textColor = 'text-sky-700';

    if (speed > 1 && speed <= 11) {
        description = 'Light Breeze';
        bg = 'from-green-100 to-teal-50';
        textColor = 'text-green-700';
    }
    if (speed > 11 && speed <= 28) {
        description = 'Moderate Breeze';
        bg = 'from-yellow-100 to-orange-50';
        textColor = 'text-orange-700';
    }
    if (speed > 28) {
        description = 'Strong Wind';
        bg = 'from-orange-100 to-red-100';
        textColor = 'text-red-700';
    }

    const directions = {
        'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
        'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
        'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
        'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    const rotation = directions[(direction || '').toUpperCase()] || 0;

    return { rotation, description, bg, textColor };
};

// --- The Simplified Wind Compass Component ---
const WindCompass = ({ windSpeed, windDirection }) => {
    const speed = windSpeed || 0;
    const direction = windDirection || 'N';
    const details = getWindDetails(speed, direction);

    return (
        <div className={`bg-gradient-to-br ${details.bg} rounded-xl border-2 border-white p-8 flex flex-col items-center text-gray-800 h-full justify-between shadow-md transition-all duration-500 ease-in-out hover:shadow-lg`}>
            <h3 className={`text-lg font-semibold ${details.textColor} opacity-80`}>Wind</h3>
            
            {/* Main Display Area */}
            <div className="flex flex-col items-center justify-center flex-grow text-center">
                {/* Speed Display */}
                <div className='py-8'>
                    <span className="text-7xl font-black text-gray-800">
                        {speed}
                    </span>
                    <span className="text-2xl font-semibold text-gray-500 ml-2">
                        m/s
                    </span>
                </div>
            </div>
            
            {/* Data Display */}
            <div className="text-center z-10 py-4">
                <p className={`text-lg font-bold ${details.textColor}`}>
                   From the {direction} ({Math.round(details.rotation)}°)
                </p>
                 <p className={`text-md font-semibold ${details.textColor}`}>{details.description}</p>
            </div>
        </div>
    );
};

export default WindCompass;

