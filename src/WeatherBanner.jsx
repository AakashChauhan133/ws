import React, { useState } from "react";
import image from "./imag1.jpg";
import { PhoneCall } from "lucide-react";
import LoginForm from "./LoginForm";

export default function WeatherBanner() {
  const [showLogin, setShowLogin] = useState(false);
  const [buttonHidden, setButtonHidden] = useState(false); // controls slide-out

  const handleShowLogin = (time = 400) => {
    setButtonHidden(true); // start slide-out
    setTimeout(() => {
      setShowLogin(true); // flip after animation
    }, time);
  };

  const handleBack = () => {
    setShowLogin(false); // flip back
    setTimeout(() => {
      setButtonHidden(false); // slide back in after flip
    }, 500); // must match flip duration
  };

  return (
    <div className="min-h-screen bg-green-900 text-white py-5 px-6 sm:px-8 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center relative ">
        {/* Left Side */}
        <div className="order-2 md:order-1">
          <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-4">MONITOR SMARTLY</h2>
          <p className="text-lg mb-6">
            Weather Monitoring Station, You Can Track Every Change of Your Field!
          </p>

          <ul className="space-y-2 text-base">
            <li>✅ Plan irrigation with precision using real-time data</li>
            <li>✅ Protect crops from sudden climate changes</li>
            <li>✅ Reduce water, energy, and fertilizer costs</li>
            <li>✅ Improve yield with smarter farm decisions</li>
            <li>✅ Access 24/7 live field data via app</li>
            <li className="italic text-sm text-green-300">Built for both farmers and researchers</li>
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <PhoneCall className="text-yellow-300" />
            <span className="text-xl text-green-300 font-bold">+91-82197-65685</span>
          </div>

          {/* Desktop Login Button - Fix Slide Out */}
          <div className="hidden md:block mt-8 h-12 relative overflow-hidden">
            <button
              onClick={handleShowLogin}
              className={`absolute transition-all duration-500 ease-in-out px-6 py-2 rounded-lg font-semibold text-green-900 ${
                buttonHidden
                  ? "translate-x-[400px] opacity-0"
                  : "translate-x-0 opacity-100"
              } bg-yellow-400 hover:bg-yellow-300`}
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Side Flip Card */}
        <div className="relative order-1 md:order-2 perspective">
          <div
            className={`transition-transform duration-700 transform-style-preserve-3d relative w-full rounded-xl shadow-md ${
              showLogin ? "rotate-y-180" : ""
            }`}
            style={{ transformStyle: "preserve-3d", minHeight: "550px" }}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-yellow-100 text-black rounded-xl overflow-hidden z-10">
              <img src={image} alt="Device" className="w-full h-72 md:h-[350px] object-cover object-center" />
              <div className="p-4 bg-yellow-100">
                <h3 className="text-xl font-bold mb-2 text-green-800">Device Features:</h3>
                <ul className="space-y-1 text-sm text-green-900">
                  <li>✅ Multi-Parameter Monitoring</li>
                  <li className="pl-4 text-xs text-gray-700 italic">
                    Air Temp, Humidity, Soil Temp, Soil Moisture, Rainfall, Wind, Pressure, AQI, etc.
                  </li>
                  <li>✅ Real-Time Data Access</li>
                  <li>✅ Solar-Powered Operation</li>
                  <li>✅ Wireless Connectivity</li>
                </ul>
              </div>

              {/* Mobile Login Button */}
              <div className="block md:hidden p-4 mb-4">
                <button
                  onClick={() => {handleShowLogin(10);}}
                  className="bg-green-800 hover:bg-green-700 text-white px-6 py-2 rounded-lg w-full"
                >
                  Login
                </button>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl z-20">
              <LoginForm onBack={handleBack} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
