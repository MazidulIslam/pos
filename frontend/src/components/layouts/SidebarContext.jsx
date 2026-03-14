"use client";

import { createContext, useContext, useState } from "react";

const SidebarContext = createContext({
  isExpanded: false,
  setIsExpanded: () => { },
  isMobileOpen: false,
  setIsMobileOpen: () => { },
});

export const SidebarProvider = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ isExpanded, setIsExpanded, isMobileOpen, setIsMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
