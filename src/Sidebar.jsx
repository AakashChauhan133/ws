import React, { useState } from "react";
import {
  Menu,
  X,
  BarChart3,
  CalendarDays,
  User2,
  Download,
  LogOut,
  Bug,
  Skull,
  Leaf,
  Droplet,
  Bot,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "./image.png";

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navItems = [
    { label: "Live Data", icon: <BarChart3 size={18} />, to: "/livedata" },
    { label: "KeSAN", icon: <Bot size={18} />, to: "/kisan" },
    { label: "Overview", icon: <CalendarDays size={18} />, to: "/weekly" },
    { label: "Export", icon: <Download size={18} />, to: "/export" },
    { label: "Fungus", icon: <Skull size={18} />, to: "/fungus" },
    { label: "Pest", icon: <Bug size={18} />, to: "/pest" },
    { label: "Spray Timing", icon: <Droplet size={18} />, to: "/spray" }, 
    { label: "User Details", icon: <User2 size={18} />, to: "/user" },
    { label: "Logout", icon: <LogOut size={18} />, to: "/logout" },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-green-900 text-white p-4 shadow-md">
        <img src={logo} alt="Logo" className="h-10" />
        <button onClick={toggleMenu} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-green-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          menuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-green-800">
          <img src={logo} alt="Logo" className="h-10" />
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="mt-6 space-y-2 px-4">
          {navItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-800 transition"
              onClick={() => setMenuOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Backdrop when menu is open (mobile only) */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
          onClick={toggleMenu}
        />
      )}
    </>
  );
}
