import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2 } from "lucide-react";
import API_BASE_URL from "../../config";
import DeviceModal from "../../components/admin/DeviceModal";

export default function DeviceManager() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceToEdit, setDeviceToEdit] = useState(null);

  const fetchDevices = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await axios.get(`${API_BASE_URL}/devices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = () => {
    setDeviceToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditDevice = (device) => {
    setDeviceToEdit(device);
    setIsModalOpen(true);
  };

  const handleDeleteDevice = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete ${name}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      await axios.delete(`${API_BASE_URL}/devices/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove from UI without re-fetching
      setDevices((prev) => prev.filter((d) => (d.id || d.d_id) !== id));
    } catch (err) {
      console.error("Error deleting device:", err);
      alert("Failed to delete the device.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-green-800">
            Device Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Add, update, or remove hardware nodes.
          </p>
        </div>
        <button
          onClick={handleAddDevice}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Add Device
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-green-50 text-green-900 border-b border-green-200">
              <tr>
                <th className="p-4 font-semibold">UID</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold text-center">Frequency</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Loading devices...
                  </td>
                </tr>
              ) : devices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No devices found.
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const id = device.id || device.d_id;
                  return (
                    <tr
                      key={id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm font-medium text-gray-900">
                        {device.device_uid}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {device.device_name}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {device.location_name || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-center text-gray-600">
                        {device.frequency}m
                      </td>
                      <td className="p-4 flex justify-end gap-3">
                        <button
                          onClick={() => handleEditDevice(device)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Device"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDevice(id, device.device_name)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Device"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <DeviceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDevices} // Re-fetch the table when saved!
        editingDevice={deviceToEdit}
      />
    </div>
  );
}
