import React, { useState, useEffect, useRef } from "react";
import { FileText, Download, MoreVertical, Check, Heart } from "lucide-react";
import FileMenu from "./FileMenu";

const FileGridItem = ({
  file,
  onClick,
  onSelect,
  onDownload,
  onDelete,
  onRename,
  onFavorite,
  isSelected,
  isFavorite,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !menuButtonRef.current?.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleFavorite = (e) => {
    e?.stopPropagation();
    onFavorite(file.id, "file");
    setMenuOpen(false);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(file.id, "file", !isSelected);
  };

  const handleClick = () => {
    onClick?.(file.id);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 ${
        isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"
      } overflow-visible shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuOpen(true);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite icon */}
      <div
        className={`absolute top-3 right-3 z-10 ${
          isHovered || isFavorite ? "opacity-100" : "opacity-0"
        } transition-opacity cursor-pointer`}
        onClick={handleFavorite}
        title="Favorite"
      >
        <Heart
          className={`h-5 w-5 ${
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-400 hover:text-red-500"
          } transition-colors`}
        />
      </div>

      {/* Selection checkbox */}
      <div
        className={`absolute top-3 left-3 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          isSelected
            ? "bg-blue-500 text-white opacity-100"
            : isHovered
            ? "bg-white border border-gray-300 opacity-100"
            : "opacity-0"
        } z-10 cursor-pointer`}
        onClick={handleSelect}
        title="Select"
      >
        {isSelected && <Check size={14} strokeWidth={3} />}
      </div>

      {/* File preview */}
      <div className="p-5 flex flex-col items-center">
        <div className="w-20 h-20 flex items-center justify-center bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
          <FileText className="text-blue-500" size={36} strokeWidth={1.5} />
        </div>
        <div className="text-center w-full">
          <p className="text-sm font-medium text-gray-800 truncate px-2">
            {file.filename}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 group-hover:bg-gray-100/50 transition-colors">
        <span className="text-xs text-gray-500">
          {new Date(file.upload_time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <div className="flex gap-2 relative">
          {/* Download */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            className="text-gray-500 hover:text-blue-500 p-1"
            title="Download"
          >
            <Download size={16} strokeWidth={2} />
          </button>

          {/* More Options */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((prev) => !prev);
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
              aria-label="File options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              title="More"
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 z-[9999]"
                onClick={(e) => e.stopPropagation()}
              >
                <FileMenu
                  file={file}
                  onClose={() => setMenuOpen(false)}
                  onDelete={() => onDelete(file.id)}
                  onRename={() => onRename(file)}
                  onDownload={() => onDownload(file)}
                  onFavorite={handleFavorite}
                  isFavorite={isFavorite}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileGridItem;
