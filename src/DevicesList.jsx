import React from "react";

function DevicesList({ devices }) {
  return (
<div className="bg-white rounded-xl shadow p-6 mb-6">
 <h2 className="text-lg font-bold mb-2 text-green-700 flex items-center justify-between">
  <span>Devices Linked</span>

  <div className="flex items-center gap-6">
    <span className="flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
      <span className="text-sm text-green-500">Active</span>
    </span>

    <span className="flex items-center gap-1">
      <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
      <span className="text-sm text-red-500">Inactive</span>
    </span>
  </div>
</h2>



  <div
    className="h-72  overflow-y-auto  space-y-3"
    style={{ scrollbarGutter: 'stable' }}
  >
    {devices.map((d) => (
      <div
        key={d.d_id}
        // className={`rounded-xl p-4 shadow-sm border border-gray-200 transition-all duration-200 
        //   ${d.status === "Online" ? "bg-green-50" : "bg-red-50"}`}
        className=" p-2"
      >
        <div className="flex items-center space-x-2 mb-2">
          <span
            className={`w-3 h-3 rounded-full ${
              d.device_status === "active" ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="font-semibold text-lg">{d.d_id}</span>
        </div>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Farm Name:</span> {d.farm_name}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Status:</span> {d.device_status}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Last Seen:</span> {d.last_seen}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Coordinates:</span> {d.latitude}, {d.longitude}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Address:</span> {d.address}
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium">Upload Frequency:</span> {d.frequency} min
        </p>
      </div>
    ))}
  </div>
</div>

  );
}

export default React.memo(DevicesList);
