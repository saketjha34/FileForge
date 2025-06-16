import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Menu,
  X,
  Cloud,
  Home,
  HardDrive,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

const Navbar = () => {
  const { token, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sticky top-0 z-50 w-full shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Cloud className="h-6 w-6 text-blue-600" />
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 tracking-tight hover:text-blue-600 transition-colors"
          >
            FileForge
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>

          {token ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-white hover:bg-blue-600 rounded-md border border-blue-600 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-2 pb-3 space-y-1 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
          >
            <Home className="h-5 w-5 mr-3 text-gray-500" />
            Home
          </Link>

          {token ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HardDrive className="h-5 w-5 mr-3 text-gray-500" />
                Dashboard
              </Link>
              <div className="px-4 py-3 text-sm text-gray-500 border-t border-gray-100">
                Signed in as {user?.email || "User"}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <LogIn className="h-5 w-5 mr-3 text-blue-600" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-4 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 mx-4 rounded-md transition-colors"
              >
                <UserPlus className="h-5 w-5 mr-3" />
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
