import React from "react";
import { HardDrive, Star, Share2, Heart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", icon: HardDrive, label: "My Files" },
    { path: "/dashboard/favorites", icon: Heart, label: "Favorites" },
    { path: "/dashboard/shared", icon: Share2, label: "Shared" },
  ];

  return (
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
  );
};

export default DashboardSidebar;
