import React from "react";
import { Link } from "react-router-dom";
import { HardDrive, Folder, Star, Users, Trash2 } from "lucide-react";

const Sidebar = ({ currentFolder, navigateUp, user }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <HardDrive className="text-blue-600" />
          FileForge
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${
                  !currentFolder
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={navigateUp}
              >
                <Folder className="text-blue-600" size={16} />
                All Files
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                <Star className="text-yellow-500" size={16} />
                Starred
              </button>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                <Users className="text-green-500" size={16} />
                Shared with me
              </button>
            </li>
            <li>
              <Link
                to="/trash"
                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Trash2 className="text-gray-500" size={16} />
                Trash
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div className="text-sm font-medium text-gray-700 truncate">
            {user?.email}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
