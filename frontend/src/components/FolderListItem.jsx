import React, { useState, useRef } from "react";
import { Folder, MoreVertical } from "lucide-react";
import FolderMenu from "./FolderMenu";

const FolderListItem = ({ folder, navigateToFolder, deleteFolder }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => navigateToFolder(folder.id)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
            <Folder className="text-blue-600" size={20} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {folder.name}
            </div>
            <div className="text-sm text-gray-500 md:hidden">
              {folder.item_count} items
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-500">
          {new Date(folder.created_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-500">{folder.item_count} items</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 relative"
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
      </td>
    </tr>
  );
};

export default FolderListItem;
