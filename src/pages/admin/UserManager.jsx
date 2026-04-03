import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Shield, User as UserIcon } from "lucide-react";
import API_BASE_URL from "../../config";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      // Assuming a standard GET /users route exists on your FastAPI backend
      const res = await axios.get(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      // Fallback dummy data if endpoint isn't ready yet
      setUsers([
        {
          id: 1,
          name: "Admin User",
          email: "admin@example.com",
          phone: "1234567890",
          role: "admin",
        },
        {
          id: 2,
          name: "Test Farmer",
          email: "farmer@example.com",
          phone: "0987654321",
          role: "user",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    // To be implemented: Open a modal to edit user details / change role
    alert(`Editing user: ${user.name}`);
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the user ${name}?`)) {
      return;
    }

    const token = localStorage.getItem("access_token");
    try {
      // Assuming a standard DELETE /users/{id} route
      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. The API endpoint might not be set up yet.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage farmers, researchers, and system administrators.
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 shadow-sm transition-colors"
          onClick={() => alert("Add User modal to be implemented!")}
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-800 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 text-sm font-medium text-gray-900 flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-green-100 text-green-600"}`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={16} />
                        ) : (
                          <UserIcon size={16} />
                        )}
                      </div>
                      {user.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{user.email}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {user.phone || "N/A"}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit User"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
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
  );
}
