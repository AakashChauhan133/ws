import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useSidebar } from "./context/SidebarContext";

export default function DashboardLayout() {
  const { isOpen } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <Sidebar />

      {/* Content area */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out
        ${isOpen ? "ml-72" : "ml-16"}
        overflow-y-auto`}
      >
        <Outlet />
      </main>
    </div>
  );
}
