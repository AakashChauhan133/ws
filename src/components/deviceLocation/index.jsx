"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet with modern Bundlers (Vite/Webpack 5)
// Using ES6 imports instead of require() prevents compilation crashes!
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Component to move map on coordinate change
function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    // Ensure both are valid numbers before trying to fly
    if (latitude != null && longitude != null) {
      map.flyTo([latitude, longitude], 13, { duration: 1.5 }); // smooth transition
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function DeviceLocation({ selectedDevice }) {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");

  // Update states whenever selectedDevice changes from the GET /devices/ API
  useEffect(() => {
    if (selectedDevice) {
      // Safely parse to Floats (React-Leaflet will crash if these are strings)
      const lat = selectedDevice.latitude
        ? parseFloat(selectedDevice.latitude)
        : null;
      const lng = selectedDevice.longitude
        ? parseFloat(selectedDevice.longitude)
        : null;

      setLatitude(lat);
      setLongitude(lng);

      // Fallback: Check 'location_name' if the new database schema doesn't use 'address'
      setAddress(
        selectedDevice.address ||
          selectedDevice.location_name ||
          "Location not available",
      );
    }
  }, [selectedDevice]);

  return (
    <div className="border border-gray-200 p-5 rounded-xl shadow-md bg-white transition duration-300 ease-in-out hover:shadow-lg h-full min-h-[250px] flex flex-col">
      <h2 className="text-xl mb-4 text-green-800 font-bold">Device Location</h2>

      <div className="text-sm text-gray-700 mb-4 space-y-1">
        <p>
          <strong className="text-gray-900 font-semibold">Address:</strong>{" "}
          {address}
        </p>
        {latitude && longitude && (
          <p>
            <strong className="text-gray-900 font-semibold">
              Coordinates:
            </strong>{" "}
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </div>

      {latitude && longitude ? (
        <div className="flex-1 w-full rounded-lg overflow-hidden border border-gray-300">
          <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{
              height: "100%",
              width: "100%",
              minHeight: "180px",
              zIndex: 1,
            }}
            dragging={true}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <span className="font-semibold text-green-700">
                  {selectedDevice?.device_name || "Device"}
                </span>
              </Popup>
            </Marker>

            {/* This updates map position when coordinates change */}
            <MapUpdater latitude={latitude} longitude={longitude} />
          </MapContainer>
        </div>
      ) : (
        <div className="flex-1 w-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 min-h-[180px]">
          <p className="text-sm text-gray-500 font-medium">
            No valid coordinates provided.
          </p>
        </div>
      )}
    </div>
  );
}
