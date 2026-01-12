import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Download,
  Bug,
  Leaf,
  SprayCan,
  User,
  LogOut,
  Menu,
  X,
  Brain,
} from "lucide-react";

import { useSidebar } from "./context/SidebarContext";
import logo from "./image.png";

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();

  const navItems = [
    { name: "Live Data", path: "/livedata", icon: LayoutDashboard },
    { name: "Kesan AI", path: "/kisan", icon: Brain },
    { name: "Weekly", path: "/weekly", icon: Calendar },
    { name: "Export", path: "/export", icon: Download },
    { name: "Pest", path: "/pest", icon: Bug },
    { name: "Fungus", path: "/fungus", icon: Leaf },
    { name: "Spray", path: "/spray", icon: SprayCan },
    { name: "User", path: "/user", icon: User },
    
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-green-900 text-white
      transition-all duration-300 ease-in-out
      ${isOpen ? "w-72" : "w-16"}`}
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 p-4 border-b border-green-800">
        {/* TOGGLE BUTTON — FIRST */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center
          w-10 h-10
          rounded-md
          bg-green-700 hover:bg-green-600
          transition-all duration-300"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* LOGO — ONLY WHEN OPEN */}
        {isOpen && (
          <img
            src={logo}
            alt="App Logo"
            className="w-32 h-auto object-contain"
          />
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
               ${
                 isActive
                   ? "bg-green-800"
                   : "hover:bg-green-800/60"
               }`
            }
          >
            {({ isActive }) =>
              isActive && (
                <span className="absolute left-0 top-0 h-full w-1 bg-lime-400" />
              )
            }

            <Icon size={22} />
            {isOpen && <span>{name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="absolute bottom-0 w-full">
        <NavLink
          to="/logout"
          className="flex items-center gap-4 px-5 py-4 text-base
          hover:bg-red-600 transition"
        >
          <LogOut size={22} />
          {isOpen && <span>Logout</span>}
        </NavLink>
      </div>
    </aside>
  );
}//changed the icon for Kesan AI to Brain from lucide-react