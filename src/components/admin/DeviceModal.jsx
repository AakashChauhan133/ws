import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config";

export default function DeviceModal({
  isOpen,
  onClose,
  onSuccess,
  editingDevice,
}) {
  const [formData, setFormData] = useState({
    device_uid: "",
    device_name: "",
    description: "",
    frequency: 5,
    location_name: "",
    latitude: 0,
    longitude: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill form if we are editing an existing device
  useEffect(() => {
    if (editingDevice) {
      setFormData({
        device_uid: editingDevice.device_uid || "",
        device_name: editingDevice.device_name || "",
        description: editingDevice.description || "",
        frequency: editingDevice.frequency || 5,
        location_name: editingDevice.location_name || "",
        latitude: editingDevice.latitude || 0,
        longitude: editingDevice.longitude || 0,
      });
    } else {
      // Reset if creating new
      setFormData({
        device_uid: "",
        device_name: "",
        description: "",
        frequency: 5,
        location_name: "",
        latitude: 0,
        longitude: 0,
      });
    }
    setError("");
  }, [editingDevice, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");

    try {
      if (editingDevice) {
        // PATCH: Update existing device
        const deviceId = editingDevice.id || editingDevice.d_id;
        await axios.patch(`${API_BASE_URL}/devices/${deviceId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // POST: Create new device
        await axios.post(`${API_BASE_URL}/devices/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess(); // Refresh the list in the parent component
      onClose(); // Close modal
    } catch (err) {
      console.error("Error saving device:", err);
      setError(err.response?.data?.detail || "Failed to save device data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-green-800">
            {editingDevice ? "Edit Device" : "Register New Device"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded border border-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* UID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device UID *
              </label>
              <input
                required
                type="text"
                name="device_uid"
                value={formData.device_uid}
                onChange={handleChange}
                disabled={!!editingDevice} // Usually UID shouldn't be changed after creation
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
              />
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Name *
              </label>
              <input
                required
                type="text"
                name="device_name"
                value={formData.device_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
                rows="2"
              />
            </div>
            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency (mins)
              </label>
              <input
                type="number"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            {/* Location Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded text-white font-semibold ${
                loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Saving..."
                : editingDevice
                  ? "Update Device"
                  : "Create Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
