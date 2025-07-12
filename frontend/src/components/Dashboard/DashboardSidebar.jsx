import React, { useState } from "react";
import { HardDrive, Share2, Heart, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: HardDrive, label: "My Files" },
    { path: "/dashboard/favorites", icon: Heart, label: "Favorites" },
    { path: "/dashboard/shared", icon: Share2, label: "Shared" },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600 cursor-default">
              FileForge
            </h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile hamburger toggle */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="text-gray-600 hover:text-blue-600"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 z-50 w-64 h-full bg-white border-r transform transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">FileForge</h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                setMobileOpen(false);
                navigate(item.path);
              }}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                isActive(item.path)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default DashboardSidebar;
