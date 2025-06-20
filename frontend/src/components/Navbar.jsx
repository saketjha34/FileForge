import React, { useState, useEffect } from "react";
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
  User,
  Settings,
} from "lucide-react";

const Navbar = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const user = (localStorage.getItem("name")) || '';
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-2 sticky top-0 z-50 w-full shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Cloud className="h-6 w-6 text-blue-500" />
          <Link
            to="/"
            className="text-xl font-bold text-gray-900 hover:text-blue-500 transition-colors"
          >
            FileForge
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Link>

          {token ? (
            <div className="flex items-center space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Dashboard
              </Link>

              {/* Profile Dropdown */}
              <div className="relative profile-menu ml-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  {user?.charAt(0).toUpperCase() || "U"}
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user || "User"}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 mr-2 text-gray-500" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 ml-2">
              <Link
                to="/login"
                className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-1 pb-2 space-y-1 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4 mr-3 text-gray-500" />
            Home
          </Link>

          {token ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <HardDrive className="h-4 w-4 mr-3 text-gray-500" />
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4 mr-3 text-gray-500" />
                Profile
              </Link>
              <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                Signed in as {user?.email || "User"}
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center px-4 py-2.5 text-sm font-medium text-blue-500 hover:bg-blue-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="h-4 w-4 mr-3 text-blue-500" />
                Login
              </Link>
              <Link
                to="/register"
                className="flex items-center mx-4 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <UserPlus className="h-4 w-4 mr-3" />
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
