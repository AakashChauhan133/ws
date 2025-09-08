import React from "react";
import Sidebar from "../Sidebar";

export default function Pest() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-green-900 mb-4">
          Pest Management
        </h1>

        <p className="text-gray-700 mb-6">
          This page will show pest detection data and preventive measures to
          safeguard crops. AI-based pest monitoring can reduce crop damage and
          minimize pesticide use.
        </p>

        {/* Example cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Current Pest Risk
            </h2>
            <p className="mt-2 text-gray-600">Moderate (based on weather & crop data)</p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Last Reported
            </h2>
            <p className="mt-2 text-gray-600">
              Aphid infestation detected 3 days ago.
            </p>
          </div>

          <div className="bg-white shadow rounded-2xl p-4">
            <h2 className="text-lg font-semibold text-green-800">
              Recommendations
            </h2>
            <ul className="mt-2 list-disc list-inside text-gray-600">
              <li>Use yellow sticky traps to monitor flying pests.</li>
              <li>Maintain crop hygiene by removing infected leaves.</li>
              <li>Apply biological control agents where possible.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
