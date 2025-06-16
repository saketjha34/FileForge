import React, { useState, useRef, useEffect } from "react";
import { FileText, Download, MoreVertical } from "lucide-react";
import FileMenu from "./FileMenu";

const FileListItem = ({
  file,
  onDownload,
  onDelete,
  onRename,
  onClick,
  isSelected,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const menuButtonRef = useRef();

  const handleRowClick = (e) => {
    if (!e.target.closest("button") && !e.target.closest(".no-preview")) {
      onClick?.();
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
    <tr
      className={`hover:bg-gray-50 cursor-pointer relative ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onClick={handleRowClick}
    >
      {/* File details cells */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
            <FileText className="text-blue-600" size={20} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {file.filename}
            </div>
            <div className="text-sm text-gray-500 md:hidden">
              {(file.size / 1024).toFixed(2)} KB
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-500">
          {new Date(file.upload_time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-500">
          {(file.size / 1024).toFixed(2)} KB
        </div>
      </td>

      {/* Action buttons cell */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2 no-preview">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
            title="Download"
          >
            <Download size={16} />
          </button>

          {/* Menu button and dropdown */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              title="More options"
            >
              <MoreVertical size={16} />
            </button>

            {/* Menu dropdown */}
            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                style={{ top: "100%", zIndex: 9999 }}
              >
                <FileMenu
                  onClose={() => setMenuOpen(false)}
                  onDownload={() => {
                    onDownload(file);
                    setMenuOpen(false);
                  }}
                  onDelete={() => {
                    onDelete(file.id);
                    setMenuOpen(false);
                  }}
                  onRename={() => {
                    onRename(file);
                    setMenuOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default FileListItem;
