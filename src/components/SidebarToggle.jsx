import { Menu, X } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

export default function SidebarToggle() {
  const { isOpen, toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 rounded hover:bg-gray-100"
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
}
