import React, { useState, useEffect } from 'react';

// --- Helper function to get UI details based on Lux value ---
const getLuxDetails = (lux) => {
    const MAX_LUX = 65000; // Realistic max for direct sunlight
    
    if (lux < 1000) return { description: 'Very Dim', emoji: '🌙', bg: 'from-slate-800 to-sky-900', textColor: 'text-green-200' };
    if (lux < 25000) return { description: 'Overcast', emoji: '☁️', bg: 'from-sky-400 to-gray-500', textColor: 'text-yellow-300' };
    if (lux < 50000) return { description: 'Bright Daylight', emoji: '⛅️', bg: 'from-sky-500 to-blue-600', textColor: 'text-orange-300' };
    return { description: 'Full Sun', emoji: '☀️', bg: 'from-yellow-400 to-orange-500', textColor: 'text-red-300' };
};

// --- Starfield Component for the night sky effect ---
const Starfield = ({ starCount = 50 }) => {
    const [stars, setStars] = useState([]);
    useEffect(() => {
        const newStars = Array.from({ length: starCount }, (_, i) => ({
            id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
            width: `${Math.random() * 1.5 + 0.5}px`, height: `${Math.random() * 1.5 + 0.5}px`,
            animationDelay: `${Math.random() * 4}s`,
        }));
        setStars(newStars);
    }, [starCount]);
    return <div className="absolute inset-0 z-0">{stars.map(star => <div key={star.id} className="star" style={star} />)}</div>;
};

// --- The Main Light Intensity Component ---
const LightIntensityGauge = ({ luxValue }) => {
    const displayLux = Math.round(luxValue || 0);
    const details = getLuxDetails(displayLux);

    return (
        <div className={`relative bg-gradient-to-br ${details.bg} rounded-xl p-8 flex flex-col justify-between items-center text-center border-2 border-white transition-all duration-1000 overflow-hidden shadow-md transition duration-300 ease-in-out hover:shadow-lg`}>
            {displayLux < 1000 && <Starfield />}
            
            <div className="relative z-10 w-full">
                <h3 className="text-lg font-semibold text-white opacity-80">Light Intensity</h3>
            </div>

            {/* Emoji Visualization Area */}
            <div className="relative z-10 text-8xl emoji-animation" style={{filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))'}}>
                {details.emoji}
            </div>

            <div className="relative z-10">
                <div className="flex items-baseline justify-center" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    <p className="text-6xl font-black text-white">
                        {displayLux}
                    </p>
                    <span className="text-xl font-semibold text-white/80 ml-2">
                        LUX
                    </span>
                </div>
                <p className={`text-lg font-bold mt-2 ${details.textColor}`}>{details.description}</p>
            </div>
        </div>
    );
};

export default LightIntensityGauge;

