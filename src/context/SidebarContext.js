import { createContext, useContext, useState } from "react";

// 1️ Create context (magic notebook)
const SidebarContext = createContext();

// 2️ Provider (the notebook owner)
export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false); // sidebar starts open

  function toggleSidebar() {
    setIsOpen((prev) => !prev);
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

// 3️ Helper hook
export function useSidebar() {
  return useContext(SidebarContext);
}
