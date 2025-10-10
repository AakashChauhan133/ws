import React from 'react';

// --- Helper function to get details based on wind data ---
const getWindDetails = (speed, direction) => {
    const directions = {
        'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
        'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
        'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
        'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
    };
    // Ensure direction is a string and uppercase before lookup
    const rotation = directions[(direction || '').toUpperCase()] || 0;

    return { rotation };
};

// --- The Simplified Wind Compass Component ---
const WindCompass = ({ windSpeed, windDirection }) => {
    // Provide default values to prevent errors if props are undefined
    const speed = windSpeed || 0;
    const direction = windDirection || 'N';
    const { rotation } = getWindDetails(speed, direction);

    return (
        <div className="border-2 bg-white rounded-2xl p-8 flex flex-col items-center text-gray-800 h-full justify-between shadow-md transition duration-300 ease-in-out hover:shadow-lg">
            <h3 className="text-lg font-semibold text-gray-500">Wind</h3>
            
            {/* Main Display Area */}
            <div className="flex flex-col items-center justify-center flex-grow text-center">
                {/* Speed Display */}
                <div>
                    <span className="text-7xl font-black text-gray-800">
                        {Math.round(speed)}
                    </span>
                    <span className="text-2xl font-semibold text-gray-500 ml-2">
                        m/s
                    </span>
                </div>
            </div>
            
            {/* Data Display */}
            <div className="text-center z-10">
                <p className="text-lg font-bold text-gray-800">
                   From the {direction} ({Math.round(rotation)}°)
                </p>
            </div>
        </div>
    );
};

export default WindCompass;

