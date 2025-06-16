// src/contexts/ViewModeContext.js
import React, { createContext, useContext, useState } from "react";

const ViewModeContext = createContext();

export const ViewModeProvider = ({ children }) => {
  // Try to get the saved view mode from localStorage, default to 'grid'
  const [viewMode, setViewMode] = useState(() => {
    const savedViewMode = localStorage.getItem("viewMode");
    return savedViewMode || "grid";
  });

  const updateViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem("viewMode", mode);
  };

  return (
    <ViewModeContext.Provider value={{ viewMode, updateViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = () => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
};
