import React, { useState, useEffect, useRef } from "react";
import { Folder, MoreVertical } from "lucide-react";
import FolderMenu from "./FolderMenu";

const FolderListItem = ({
  folder,
  navigateToFolder,
  deleteFolder,
  onRename,
  onClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleRowClick = (e) => {
    if (!e.target.closest("button") && !e.target.closest(".no-preview")) {
      onClick?.();
      navigateToFolder();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !menuButtonRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <tr className="hover:bg-gray-50 cursor-pointer" onClick={handleRowClick}>
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
              {folder.items_count || 0} items
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-500">
          {new Date(folder.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-500">
          {folder.items_count || 0} items
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2 no-preview">
          <div className="relative z-[60]">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="More options"
              aria-label="Folder options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-6 z-[60] menu-container">
                <FolderMenu
                  ref={menuRef}
                  folder={folder}
                  onClose={() => setMenuOpen(false)}
                  onDelete={() => deleteFolder(folder.id)}
                  onRename={() => onRename(folder)}
                />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default FolderListItem;
