import React, { useState, useEffect, useRef } from "react";
import { FileText, Download, MoreVertical, Heart } from "lucide-react";
import FileMenu from "./FileMenu";

const FileListItem = ({
  file,
  onDownload,
  onDelete,
  onRename,
  onFavorite,
  onClick,
  isSelected,
  isFavorite,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleRowClick = (e) => {
    if (!e.target.closest("button") && !e.target.closest(".no-preview")) {
      onClick?.(file.id);
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    onFavorite(file.id, "file");
    setMenuOpen(false);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(file.id);
    setMenuOpen(false);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    onRename(file);
    setMenuOpen(false);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    onDownload(file);
    setMenuOpen(false);
  };

  return (
    <tr
      className={`hover:bg-gray-50 cursor-pointer relative ${
        isSelected ? "bg-blue-50" : ""
      }`}
      onClick={handleRowClick}
    >
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
              {formatFileSize(file.size)}
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
        <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2 no-preview">
          <button
            onClick={handleDownload}
            className="text-gray-400 hover:text-blue-600 p-1 transition-colors"
            title="Download"
          >
            <Download size={16} />
          </button>

          <button
            onClick={handleFavorite}
            className={`p-1 ${
              isFavorite
                ? "text-red-500 hover:text-red-600"
                : "text-gray-400 hover:text-gray-600"
            } transition-colors`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="More options"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <FileMenu
                  file={file}
                  onClose={() => setMenuOpen(false)}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  onRename={handleRename}
                  onFavorite={handleFavorite}
                  isFavorite={isFavorite}
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
