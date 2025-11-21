"use client";

import React from 'react';
import "./styles.css";

// --- Helper function to get details based on pressure (hPa) ---
const getPressureDetails = (hpa, trend) => {
    let description = 'Normal';
    let bg = 'white-100';
    let textColor = 'text-gray-700';

    if (hpa < 1000) {
        description = 'Low Pressure';
    } else if (hpa > 1020) {
        description = 'High Pressure';
    }
    
    return { description, bg, textColor, trend };
};

// --- The Simplified Pressure Component ---
const PressureCard = ({ pressureValue, pressureTrend }) => {
    const hpa = Math.round(pressureValue || 0);
    const details = getPressureDetails(hpa, pressureTrend);

    return (
        <div className={`   border-2 bg-gradient-to-br ${details.bg} rounded-2xl shadow-md p-8 flex flex-col justify-between items-center text-center h-full transition duration-300 ease-in-out hover:shadow-lg`}>
            <h3 className={`text-xl font-bold ${details.textColor}`}>Atmospheric Pressure</h3>
            
            {/* Main Display Area */}
            <div className="flex items-center justify-center gap-4 my-6">
                <div>
                    <p className="text-7xl font-black text-gray-800">
                        {hpa}
                        <span className="text-lg font-semibold text-gray-500 -mt-2">hPa</span>
                    </p>
                    
                </div>
            </div>

            {/* Description */}
            <div className="w-full">
                 <p className={`text-lg font-bold ${details.textColor}`}>{details.description}</p>
            </div>
        </div>
    );
};


export default PressureCard;
