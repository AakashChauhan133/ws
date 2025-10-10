import React from 'react';

// --- Time-Based Background Component ---
const TimeBasedBackground = ({ hour }) => {
    let skyGradient, SunMoon;

    if (hour >= 5 && hour < 12) { // Morning
        skyGradient = 'from-sky-300 to-blue-500';
        SunMoon = () => <div className="sun-animation absolute top-1/2 left-1/4 w-16 h-16 bg-amber-200 rounded-full transition-all duration-1000"></div>;
    } else if (hour >= 12 && hour < 17) { // Noon
        skyGradient = 'from-sky-400 to-blue-600';
        SunMoon = () => <div className="sun-animation absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-300 rounded-full transition-all duration-1000"></div>;
    } else if (hour >= 17 && hour < 20) { // Evening
        skyGradient = 'from-orange-400 via-red-500 to-indigo-800';
        SunMoon = () => <div className="sun-animation absolute top-1/2 right-1/4 w-16 h-16 bg-orange-400 rounded-full transition-all duration-1000"></div>;
    } else { // Night
        skyGradient = 'from-indigo-800 via-purple-800 to-slate-900';
        SunMoon = () => <div className="moon-animation absolute top-8 right-1/4 w-12 h-12 bg-indigo-100 rounded-full transition-all duration-1000"></div>;
    }

    return (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
            <div className={`absolute inset-0 bg-gradient-to-b ${skyGradient} transition-all duration-1000`}></div>
            <SunMoon />
            {/* Mountain Layers */}
            <svg viewBox="0 0 100 20" className="absolute bottom-0 w-full h-1/3" preserveAspectRatio="none">
                <path d="M -5 20 L 25 8 L 55 18 L 80 12 L 105 20 Z" fill="rgba(0, 0, 0, 0.1)" />
                <path d="M -5 20 L 35 12 L 65 19 L 85 15 L 105 20 Z" fill="rgba(0, 0, 0, 0.2)" />
            </svg>
        </div>
    );
};

// --- Helper function to format the timestamp ---
const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${dayName} ${time}`;
};

// --- The Main Device Info Component ---
const DeviceInfoCard = ({ selectedDevice, hour }) => {
    const isDeviceActive = selectedDevice?.device_status === 'active';

    return (
        <div className="relative  rounded-xl shadow-lg overflow-hidden">
            {/* Background Component */}
            <TimeBasedBackground hour={hour} />
            
            {/* Foreground Content with "Glassmorphism" effect */}
            <div className="relative z-10 w-full h-full bg-black/10 backdrop-blur-sm p-6 flex flex-col justify-between text-white ">
                <div>
                    <h2 className="text-xl font-bold" style={{textShadow: '0 1px 3px rgba(0,0,0,0.3)'}}>Device Info</h2>
                </div>
                <div className="space-y-2">
                     <div>
                        <p className="text-sm font-semibold opacity-70">ID</p>
                        <p className="text-lg font-bold">{selectedDevice?.d_id || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold opacity-70">Status</p>
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isDeviceActive ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                            <p className="text-lg font-bold">
                                {selectedDevice?.device_status || 'N/A'}
                            </p>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-semibold opacity-70">Last Seen</p>
                        <p className="text-lg font-bold">{formatTime(selectedDevice?.last_seen)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeviceInfoCard;
