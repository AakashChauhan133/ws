import React from 'react';

// --- Reusable WeatherTimeline Component ---
// This component's only responsibility is to display the weather data it receives.
// It does not fetch its own data or manage complex state.
const WeatherTimeline = ({ weatherData }) => {

  // --- Render logic for the component ---

  // Display a loading/empty state message if no data is provided.
  // The parent component is responsible for showing more specific loading/error states.
  if (!weatherData || weatherData.length === 0) {
    return (
      <div className="text-center p-10 bg-white rounded-2xl shadow">
        <p className="text-gray-500">Loading Weather Forecast...</p>
      </div>
    );
  }

  // A helper function to determine if a forecast indicates ideal spray conditions
  // This function now safely parses the description string passed in the props.
  const isIdeal = (item) => {
    const description = item.title.toLowerCase();
    // Safely extract wind speed from the description string using a regular expression
    const windMatch = item.description.match(/Wind: ([\d.]+) m\/s/);
    const windSpeed = windMatch ? parseFloat(windMatch[1]) : 0;
    
    // Ideal conditions: no rain and wind speed is low (e.g., less than 2 m/s)
    return !description.includes('rain') && windSpeed < 3;
  };

  return (
    <div className="w-full lg:w-1/3 md:p-5">
      <div className="relative wrap px-4">
        {/* --- Timeline Items (Mapping over weather data) --- */}
        {weatherData.map((item, index) => (
          <div key={item.id || index} className="mb-8 flex items-center w-full">
            
            {/* Content Card (Responsive) */}
            <div className="order-1 bg-green-800 rounded-lg shadow-xl ml-4 px-6 py-4 flex-1">
              <h3 className="font-bold text-lg text-white mb-1">{item.title}</h3>
              <p className="text-sm font-medium text-white mb-2">{item.date}</p>
              <p className="text-sm leading-snug tracking-wide text-white">
                {item.description}
              </p>
              
              {isIdeal(item) ? (
                <p className="mt-3 text-sm font-semibold text-green-300 bg-green-900/50 p-2 rounded-md">
                  Ideal conditions for spraying.
                </p>
              ) : (
                <p className="mt-3 text-sm font-semibold text-amber-300 bg-amber-900/50 p-2 rounded-md">
                  Conditions not ideal for spraying.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherTimeline;

