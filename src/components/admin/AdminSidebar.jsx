import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

export default function AdminSidebar() {
  const { isOpen } = useSidebar();

  // Admin-specific navigation links
  const navItems = [
    { name: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Device Manager", path: "/admin/devices", icon: Server },
    { name: "Sensor Manager", path: "/admin/sensors", icon: Cpu },
    { name: "User Management", path: "/admin/users", icon: Users },
    { name: "System Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-white
      transition-all duration-300 ease-in-out z-50 shadow-2xl
      ${isOpen ? "w-72" : "w-16"}`}
    >
      {/* ADMIN HEADER */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-800 ${isOpen ? "justify-start gap-3" : "justify-center"}`}
      >
        <ShieldCheck className="text-lime-400 min-w-[24px]" size={28} />
        {isOpen && (
          <span className="font-bold text-lg tracking-wide text-white overflow-hidden whitespace-nowrap">
            Admin Portal
          </span>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="mt-6 flex flex-col gap-2">
        {navItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `relative flex items-center gap-4 px-5 py-4 text-base
               transition-all duration-200
               ${isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800/60 hover:text-white"}`
            }
          >
            {/* ACTIVE SECTION BAR */}
            {({ isActive }) =>
              isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-lime-400" />
              )
            }

            <Icon size={22} className="min-w-[22px]" />
            {isOpen && (
              <span className="whitespace-nowrap overflow-hidden">{name}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full border-t border-slate-800">
        <NavLink
          to="/logout"
          className="flex items-center gap-4 px-5 py-4 text-base text-slate-300
          hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut size={22} className="min-w-[22px]" />
          {isOpen && <span className="whitespace-nowrap">Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
}
