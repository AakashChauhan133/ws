import React from "react";
import Sidebar from "../Sidebar";

export default function Disease() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-green-900 mb-4">
          Disease Monitoring
        </h1>

        <p className="text-gray-700 mb-6">
          This section helps in monitoring and predicting crop diseases using
          AI-powered models, weather data, and soil conditions. Early detection
          can reduce crop loss and optimize pesticide usage.
        </p>

        {/* Example cards for disease data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Current Risk Level
            </h2>
            <p className="mt-2 text-gray-600">Low (based on recent weather)</p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Last Detected
            </h2>
            <p className="mt-2 text-gray-600">
              No major disease reported in the last 7 days.
            </p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Recommendations
            </h2>
            <ul className="mt-2 list-disc list-inside text-gray-600">
              <li>Maintain soil moisture at optimum level.</li>
              <li>Spray preventive fungicide if humidity rises above 80%.</li>
              <li>Check crop leaves daily for early symptoms.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
