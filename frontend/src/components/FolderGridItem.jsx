import React, { useState, useRef } from "react";
import { Folder, MoreVertical } from "lucide-react";
import FolderMenu from "./FolderMenu";

const FolderGridItem = ({ folder, navigateToFolder, deleteFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  return (
    <div
      key={folder.id}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigateToFolder(folder.id)}
    >
      <div className="p-4 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-lg mb-3">
          <Folder className="text-blue-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 truncate w-full px-2">
            {folder.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {folder.item_count} items
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-2 flex justify-between items-center bg-gray-50">
        <span className="text-xs text-gray-500">
          {new Date(folder.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 relative"
            title="More options"
          >
            <MoreVertical size={16} />
            {menuOpen && (
              <FolderMenu
                ref={menuRef}
                folder={folder}
                onClose={() => setMenuOpen(false)}
                onDelete={() => deleteFolder(folder.id)}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderGridItem;
