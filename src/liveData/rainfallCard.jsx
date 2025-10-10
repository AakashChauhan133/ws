import React from 'react';

// --- Helper function to get details based on rainfall value (mm) ---
const getRainDetails = (mm) => {
    if (mm <= 0) return { 
        description: 'Clear Skies', 
        bg: 'bg-gradient-to-br from-sky-400 to-blue-500', 
        textColor: 'text-white',
        state: 'none' 
    };
    if (mm < 5) return { 
        description: 'Light Drizzle', 
        bg: 'bg-gradient-to-br from-gray-400 to-gray-600', 
        textColor: 'text-white',
        state: 'light' 
    };
    return { 
        description: 'Heavy Downpour', 
        bg: 'bg-gradient-to-br from-slate-700 to-slate-900', 
        textColor: 'text-white',
        state: 'heavy' 
    };
};

// --- Effect components ---
const RainEffect = ({ count = 50, heavy = false }) => {
    const drops = React.useMemo(() => 
        Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -100}px`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
            animationDelay: `${Math.random() * 3}s`,
            width: heavy ? '3px' : '2px',
            height: heavy ? '20px' : '10px',
        })), [count, heavy]);

    return <>{drops.map(drop => <div key={drop.id} className="raindrop" style={drop} />)}</>;
};

const ThunderstormEffect = () => <div className="lightning"></div>;

const ClearSkyEffect = () => {
    const clouds = React.useMemo(() => 
        Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            top: `${10 + Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            width: `${100 + Math.random() * 100}px`,
            height: `${40 + Math.random() * 40}px`,
            animationDuration: `${20 + Math.random() * 20}s`,
            animationDelay: `${Math.random() * -40}s`
        })), []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            
            {clouds.map(cloud => (
                <div key={cloud.id} className="cloud" style={cloud}></div>
            ))}
        </div>
    );
};

// --- The Main Rainfall Component ---
const RainfallCard = ({ rainfallValue }) => {
    const displayValue = rainfallValue;
    const details = getRainDetails(displayValue);

    return (
        <div className={`relative ${details.bg} rounded-xl p-8 border-2 border-white flex flex-col justify-center items-center text-center overflow-hidden transition-all duration-500 shadow-md transition duration-300 ease-in-out hover:shadow-lg`}>
            {details.state === 'none' && <ClearSkyEffect />}
            {details.state === 'light' && <RainEffect />}
            {details.state === 'heavy' && <><RainEffect count={150} heavy={true} /><ThunderstormEffect /></>}

            <div className="relative z-10">
                <h3 className={`text-lg font-semibold ${details.textColor} opacity-80 mb-4`}>Rainfall</h3>
                <p className={`text-7xl font-black ${details.textColor}`} style={{textShadow: '0 2px 4px rgba(0,0,0,0.2)'}}>
                    {displayValue}
                </p>
                <p className={`text-sm ${details.textColor} opacity-80`}>mm</p>
                <p className={`text-lg font-bold ${details.textColor} mt-6`}>{details.description}</p>
            </div>
        </div>
    );
};

export default RainfallCard;
