import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useSidebar } from "../../context/SidebarContext";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-72" : "ml-16"
        }`}
      >
        {/* Optional Admin Top Navbar for mobile toggling */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm shrink-0">
          <h2 className="ml-4 font-semibold text-slate-700 text-lg">
            System Administration
          </h2>
        </header>

        {/* Dynamic Page Content (DeviceManager goes here) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
