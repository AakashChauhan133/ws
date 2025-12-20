"use client";

import React, { useMemo } from 'react';
import "./styles.css";

// --- Helper function to get details based on wetness hours ---
const getWetnessDetails = (hours) => {
    if (hours <= 0) {
        return { description: 'Dry', bg: 'from-green-100 to-lime-100', textColor: 'text-green-800', state: 'dry' };
    }
    
    return { description: 'Wet', bg: 'from-sky-100 to-teal-100', textColor: 'text-teal-800', state: 'wet' };
};

// --- Droplet Effect Component ---
const DropletEffect = ({ count = 10 }) => {
    const droplets = useMemo(() =>
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            top: `${15 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 3}s`,
            size: `${4 + Math.random() * 4}px`,
        })), [count]);

    return (
        <div className="absolute inset-0">
            {droplets.map(drop => (
                <div
                    key={drop.id}
                    className="droplet bg-sky-300/50 backdrop-blur-sm rounded-full"
                    style={{ top: drop.top, left: drop.left, width: drop.size, height: drop.size, animationDelay: drop.animationDelay }}
                />
            ))}
        </div>
    );
};

// --- The Main Leaf Wetness Component ---
const LeafWetnessCard = ({ wetnessHours }) => {
    const hours = (wetnessHours || 0);
    const details = getWetnessDetails(hours);

    return (
        <div className={`w-full border-2 border-white bg-gradient-to-br ${details.bg} rounded-xl p-8 flex flex-col text-center h-full transition-all duration-500 shadow-md  ease-in-out hover:shadow-lg`}>
            <h3 className={`text-xl font-bold ${details.textColor}`}>Leaf Wetness</h3>

                {/* Reading and Description */}
                <div className="flex flex-col w-full h-full justify-center ">
                    <div className="flex items-baseline justify-center py-12">
                        <p className="text-6xl font-black text-gray-800">{hours}</p>
                        <p className="text-xl font-semibold text-gray-600 ml-2 pr-4">hours</p>
                    </div>
                    <p className={`text-lg font-bold mt-2 ${details.textColor}`}>{details.description}</p>
                </div>

            </div>
    );
};

export default LeafWetnessCard;
