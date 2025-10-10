import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issue in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component to move map on coordinate change
function MapUpdater({ latitude, longitude }) {
  const map = useMap();

  useEffect(() => {
    if (latitude && longitude) {
      map.flyTo([latitude, longitude], 13, { duration: 1.5 }); // smooth transition
    }
  }, [latitude, longitude, map]);

  return null;
}

export default function DeviceLocation({ selectedDevice }) {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [address, setAddress] = useState("");

  // Update states whenever selectedDevice changes
  useEffect(() => {
    if (selectedDevice) {
      setLatitude(selectedDevice.latitude || null);
      setLongitude(selectedDevice.longitude || null);
      setAddress(selectedDevice.address || "");
    }
  }, [selectedDevice]);

  return (
    <div className="border p-4 rounded-lg shadow hover:shadow-lg">
      <h2 className="text-lg font-semibold mb-2 text-green-700">Device Location</h2>
      <p><strong>Latitude:</strong> {latitude}</p>
      <p><strong>Longitude:</strong> {longitude}</p>
      <p><strong>Address:</strong> {address}</p>

      {latitude && longitude ? (
        <MapContainer
          center={[latitude, longitude]}
          zoom={13}
          scrollWheelZoom={false}
          className="mt-3 rounded"
          style={{ height: "160px", width: "100%", zIndex: 1}}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>Device Location</Popup>
          </Marker>

          {/* This updates map position when coordinates change */}
          <MapUpdater latitude={latitude} longitude={longitude} />
        </MapContainer>
      ) : (
        <p className="text-sm text-red-500 mt-2">No valid coordinates provided.</p>
      )}
    </div>
  );
}
