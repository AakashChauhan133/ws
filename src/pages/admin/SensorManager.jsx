import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Cpu, Settings2, X } from "lucide-react";
import API_BASE_URL from "../../config";

export default function SensorManager() {
  const [activeTab, setActiveTab] = useState("types"); // 'types' | 'devices'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Data states
  const [sensorTypes, setSensorTypes] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceSensors, setDeviceSensors] = useState([]);

  // Modal states
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isDeviceSensorModalOpen, setIsDeviceSensorModalOpen] = useState(false);
  const [editingDeviceSensor, setEditingDeviceSensor] = useState(null);

  // Form states
  const [typeForm, setTypeForm] = useState({
    name: "",
    code: "",
    unit: "",
    data_type: "float",
    category: "",
    min_value: 0,
    max_value: 100,
  });
  const [deviceSensorForm, setDeviceSensorForm] = useState({
    sensor_type_id: "",
    sensor_label: "",
    hardware_port: "",
    calibration_offset: 0,
    calibration_scale: 1,
    is_active: true,
  });

  // --- API Fetching ---
  const fetchSensorTypes = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/sensors/types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensorTypes(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch sensor types:", err);
    }
  };

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/devices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedDevices = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setDevices(fetchedDevices);
      if (fetchedDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(fetchedDevices[0].id || fetchedDevices[0].d_id);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    }
  };

  const fetchDeviceSensors = async (deviceId) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `${API_BASE_URL}/sensors/device/${deviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setDeviceSensors(
        Array.isArray(res.data) ? res.data : res.data.data || [],
      );
    } catch (err) {
      console.error("Failed to fetch device sensors:", err);
      setDeviceSensors([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchSensorTypes();
    fetchDevices();
  }, []);

  // Fetch device sensors when selected device changes
  useEffect(() => {
    if (activeTab === "devices" && selectedDeviceId) {
      fetchDeviceSensors(selectedDeviceId);
    }
  }, [activeTab, selectedDeviceId]);

  // --- Global Sensor Types Logic ---
  const handleCreateType = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(`${API_BASE_URL}/sensors/types`, typeForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsTypeModalOpen(false);
      setTypeForm({
        name: "",
        code: "",
        unit: "",
        data_type: "float",
        category: "",
        min_value: 0,
        max_value: 100,
      });
      fetchSensorTypes();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create sensor type.");
    }
  };

  const handleDeleteType = async (typeId, name) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the sensor type: ${name}?`,
      )
    )
      return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/sensors/types/${typeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSensorTypes();
    } catch (err) {
      alert("Failed to delete sensor type.");
    }
  };

  // --- Device Sensor Logic ---
  const openDeviceSensorModal = (sensor = null) => {
    setError("");
    setEditingDeviceSensor(sensor);
    if (sensor) {
      setDeviceSensorForm({
        sensor_type_id: sensor.sensor_type_id,
        sensor_label: sensor.sensor_label,
        hardware_port: sensor.hardware_port,
        calibration_offset: sensor.calibration_offset,
        calibration_scale: sensor.calibration_scale,
        is_active: sensor.is_active !== undefined ? sensor.is_active : true,
      });
    } else {
      setDeviceSensorForm({
        sensor_type_id: sensorTypes.length > 0 ? sensorTypes[0].id : "",
        sensor_label: "",
        hardware_port: "",
        calibration_offset: 0,
        calibration_scale: 1,
        is_active: true,
      });
    }
    setIsDeviceSensorModalOpen(true);
  };

  const handleSaveDeviceSensor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      if (editingDeviceSensor) {
        // PATCH
        await axios.patch(
          `${API_BASE_URL}/sensors/device/sensor/${editingDeviceSensor.id}`,
          deviceSensorForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } else {
        // POST
        await axios.post(
          `${API_BASE_URL}/sensors/device`,
          { ...deviceSensorForm, device_id: selectedDeviceId },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
      setIsDeviceSensorModalOpen(false);
      fetchDeviceSensors(selectedDeviceId);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save device sensor.");
    }
  };

  const handleDeleteDeviceSensor = async (sensorId, label) => {
    if (!window.confirm(`Are you sure you want to uninstall sensor: ${label}?`))
      return;
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/sensors/device/sensor/${sensorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDeviceSensors(selectedDeviceId);
    } catch (err) {
      alert("Failed to uninstall device sensor.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Sensor Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage global sensor types and node installations.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("types")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "types"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Global Sensor Types
          </button>
          <button
            onClick={() => setActiveTab("devices")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "devices"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Device Installations
          </button>
        </div>
      </div>

      {/* --- TAB 1: Global Sensor Types --- */}
      {activeTab === "types" && (
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Cpu size={20} /> Sensor Catalog
            </h2>
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white text-sm rounded hover:bg-slate-700 transition"
            >
              <Plus size={16} /> Add Type
            </button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-sm">
                <tr>
                  <th className="p-3 font-semibold">Name / Code</th>
                  <th className="p-3 font-semibold">Category</th>
                  <th className="p-3 font-semibold">Unit</th>
                  <th className="p-3 font-semibold">Data Type</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sensorTypes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No sensor types defined.
                    </td>
                  </tr>
                ) : (
                  sensorTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="border-b border-gray-50 hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <div className="font-medium text-slate-800">
                          {type.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {type.code}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 capitalize">
                        {type.category}
                      </td>
                      <td className="p-3 text-sm text-slate-600">
                        {type.unit || "-"}
                      </td>
                      <td className="p-3 text-sm text-slate-600 font-mono">
                        {type.data_type}
                      </td>
                      <td className="p-3 flex justify-end gap-2">
                        <button
                          onClick={() => handleDeleteType(type.id, type.name)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Type"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: Device Sensor Installations --- */}
      {activeTab === "devices" && (
        <div className="flex-1 flex flex-col space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <label className="font-semibold text-slate-700">
              Select Device:
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="flex-1 max-w-sm p-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="" disabled>
                -- Choose a Device --
              </option>
              {devices.map((d) => (
                <option key={d.id || d.d_id} value={d.id || d.d_id}>
                  {d.device_name || `Device UID: ${d.device_uid}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Settings2 size={20} /> Installed Sensors
              </h2>
              <button
                onClick={() => openDeviceSensorModal()}
                disabled={!selectedDeviceId}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                <Plus size={16} /> Install Sensor
              </button>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-sm">
                  <tr>
                    <th className="p-3 font-semibold">Label</th>
                    <th className="p-3 font-semibold">Hardware Port</th>
                    <th className="p-3 font-semibold text-center">
                      Cal. Offset / Scale
                    </th>
                    <th className="p-3 font-semibold text-center">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Loading installed sensors...
                      </td>
                    </tr>
                  ) : !selectedDeviceId ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        Please select a device above.
                      </td>
                    </tr>
                  ) : deviceSensors.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-500">
                        No sensors installed on this device.
                      </td>
                    </tr>
                  ) : (
                    deviceSensors.map((sensor) => (
                      <tr
                        key={sensor.id}
                        className="border-b border-gray-50 hover:bg-slate-50"
                      >
                        <td className="p-3 font-medium text-slate-800">
                          {sensor.sensor_label}
                        </td>
                        <td className="p-3 text-sm text-slate-600 font-mono">
                          {sensor.hardware_port || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-slate-600 text-center">
                          {sensor.calibration_offset}{" "}
                          <span className="text-slate-300">/</span>{" "}
                          {sensor.calibration_scale}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${sensor.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                          >
                            {sensor.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-3 flex justify-end gap-2">
                          <button
                            onClick={() => openDeviceSensorModal(sensor)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit Sensor"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDeviceSensor(
                                sensor.id,
                                sensor.sensor_label,
                              )
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Uninstall Sensor"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Create Sensor Type --- */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Create Sensor Type</h2>
              <button onClick={() => setIsTypeModalOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreateType} className="p-4 space-y-3">
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    required
                    className="w-full p-2 border rounded"
                    value={typeForm.name}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    required
                    className="w-full p-2 border rounded"
                    value={typeForm.code}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, code: e.target.value })
                    }
                    placeholder="e.g. temp_c"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={typeForm.category}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, category: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <input
                    className="w-full p-2 border rounded"
                    value={typeForm.unit}
                    onChange={(e) =>
                      setTypeForm({ ...typeForm, unit: e.target.value })
                    }
                    placeholder="e.g. °C"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Min Value
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={typeForm.min_value}
                    onChange={(e) =>
                      setTypeForm({
                        ...typeForm,
                        min_value: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Max Value
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={typeForm.max_value}
                    onChange={(e) =>
                      setTypeForm({
                        ...typeForm,
                        max_value: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Install/Edit Device Sensor --- */}
      {isDeviceSensorModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingDeviceSensor
                  ? "Update Device Sensor"
                  : "Install Sensor"}
              </h2>
              <button onClick={() => setIsDeviceSensorModalOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSaveDeviceSensor} className="p-4 space-y-3">
              {error && <p className="text-red-500 text-sm">{error}</p>}

              {!editingDeviceSensor && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sensor Type *
                  </label>
                  <select
                    required
                    className="w-full p-2 border rounded"
                    value={deviceSensorForm.sensor_type_id}
                    onChange={(e) =>
                      setDeviceSensorForm({
                        ...deviceSensorForm,
                        sensor_type_id: e.target.value,
                      })
                    }
                  >
                    <option value="" disabled>
                      Select a sensor type...
                    </option>
                    {sensorTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Sensor Label (Variable Name) *
                </label>
                <input
                  required
                  className="w-full p-2 border rounded"
                  value={deviceSensorForm.sensor_label}
                  onChange={(e) =>
                    setDeviceSensorForm({
                      ...deviceSensorForm,
                      sensor_label: e.target.value,
                    })
                  }
                  placeholder="e.g. temp_1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Hardware Port
                </label>
                <input
                  className="w-full p-2 border rounded"
                  value={deviceSensorForm.hardware_port}
                  onChange={(e) =>
                    setDeviceSensorForm({
                      ...deviceSensorForm,
                      hardware_port: e.target.value,
                    })
                  }
                  placeholder="e.g. A0, I2C"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Cal. Offset
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border rounded"
                    value={deviceSensorForm.calibration_offset}
                    onChange={(e) =>
                      setDeviceSensorForm({
                        ...deviceSensorForm,
                        calibration_offset: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Cal. Scale
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-2 border rounded"
                    value={deviceSensorForm.calibration_scale}
                    onChange={(e) =>
                      setDeviceSensorForm({
                        ...deviceSensorForm,
                        calibration_scale: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {editingDeviceSensor && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={deviceSensorForm.is_active}
                    onChange={(e) =>
                      setDeviceSensorForm({
                        ...deviceSensorForm,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-gray-700"
                  >
                    Is Active?
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsDeviceSensorModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  {editingDeviceSensor ? "Update" : "Install"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
