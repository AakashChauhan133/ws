import React from "react";
import Sidebar from "../Sidebar";

export default function Spray() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-green-900 mb-4">
          Spray Timing
        </h1>

        <p className="text-gray-700 mb-6">
          This page provides smart recommendations for optimal pesticide and
          fungicide spray timing based on weather, soil, and crop conditions.
        </p>

        {/* Example cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Ideal Spray Window
            </h2>
            <p className="mt-2 text-gray-600">
              Between 6:00 AM – 9:00 AM (low wind, optimal humidity).
            </p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Weather Check
            </h2>
            <p className="mt-2 text-gray-600">
              No rain expected in the next 24 hours – spraying is safe.
            </p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Recommendations
            </h2>
            <ul className="mt-2 list-disc list-inside text-gray-600">
              <li>Spray early in the morning or late evening.</li>
              <li>Use protective gear while spraying.</li>
              <li>Follow correct dosage to avoid residue on crops.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
