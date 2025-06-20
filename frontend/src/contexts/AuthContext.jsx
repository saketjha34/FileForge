import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };
    const user = (newToken) => {
      localStorage.setItem("name", newToken);
      setToken(newToken);
    };

  const logout = () => {
    localStorage.removeItem("token"); // Delete token from storage
    setToken(null); // Update state to logged out
  };

  // Optional: keep token in sync with localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout,user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
