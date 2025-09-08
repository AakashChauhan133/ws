import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react"; // icon package, can replace with Heroicons or SVG
import logo from './image.png'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

//   useEffect(() =>{
//     console.log(logo);
//   })

  return (
    <nav className="bg-[oklch(39.3%_0.095_152.535)] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl font-bold text-blue-600">
            <img src={logo} alt="logo" className="h-10 w-auto " />
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 text-gray-700">
            
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 focus:outline-none">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 text-gray-700">
          
        </div>
      )}
    </nav>
  );
}