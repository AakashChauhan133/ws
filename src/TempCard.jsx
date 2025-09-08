import React from "react";
import { ThermometerSun } from "lucide-react";

const TempCard = ({ liveData, liveDataLoading, extremes, noData }) => {
  const temp = liveData?.temp ?? 0;

  // Theme selection
  let colorTheme = {
    from: "from-blue-100",
    to: "to-blue-50",
    text: "text-blue-700",
    icon: "text-blue-600",
    barBg: "bg-blue-200",
    barFill: "bg-blue-500",
  };

  if (temp >= 40) {
    colorTheme = {
      from: "from-orange-100",
      to: "to-red-50",
      text: "text-red-700",
      icon: "text-red-600",
      barBg: "bg-red-200",
      barFill: "bg-red-500",
    };
  } else if (temp >= 28) {
    colorTheme = {
      from: "from-yellow-100",
      to: "to-green-50",
      text: "text-yellow-700",
      icon: "text-yellow-600",
      barBg: "bg-yellow-200",
      barFill: "bg-yellow-500",
    };
  }

  // Format time as Day dd/mm/yy hh:mm
  const formatTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const dayName = dayNames[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const time = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return ` ${time}`;
  };

  const barWidth = `${Math.min((temp / 50) * 100, 100)}%`;

  return (
    <div
      className={`border border-gray-200 p-4 rounded-xl shadow-sm bg-gradient-to-br ${colorTheme.from} ${colorTheme.to} hover:shadow-lg transition-all duration-500`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-semibold ${colorTheme.text}`}>Temperature</h3>
        <ThermometerSun className={`${colorTheme.icon} w-6 h-6`} />
      </div>

      {liveDataLoading ? (
        <div className="animate-pulse">
          <div className="w-full h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
          <div className="mt-3 w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-3/4 bg-gray-300 animate-pulse" />
          </div>
          <div className="h-4 bg-gray-200 rounded mt-2 w-2/3" />
        </div>
      ) : (
        <>
          {/* Current Reading */}
          <div className={`text-5xl font-extrabold ${colorTheme.text} tracking-tight`}>
            {temp}°C
          </div>

          {/* Progress bar */}
          <div className={`mt-2 h-2 w-full ${colorTheme.barBg} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${colorTheme.barFill} rounded-full transition-all duration-700`}
              style={{ width: barWidth }}
            />
          </div>

          <p className="text-sm text-gray-600 mt-2">Device-reported reading</p>

          {/* Min/Max with theme */}
          {!noData ?  (
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-700 font-medium">Minimum</span>
                <span className={`${colorTheme.text} font-semibold`}>
                  {extremes?.temp?.min.value}°C ({formatTime(extremes?.temp?.min.time)})
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-700 font-medium">Maximum</span>
                <span className={`${colorTheme.text} font-semibold`}>
                  {extremes?.temp?.max.value}°C ({formatTime(extremes?.temp?.max.time)})
                </span>
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-700 font-medium">Minimum</span>
                <span className={`${colorTheme.text} font-semibold`}>
                  N/A
                </span>
              </p>
              <p className="flex justify-between">
                <span className="text-gray-700 font-medium">Maximum</span>
                <span className={`${colorTheme.text} font-semibold`}>
                  N/A
                </span>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TempCard;
