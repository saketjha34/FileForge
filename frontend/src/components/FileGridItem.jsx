import React, { useState, useEffect, useRef } from "react";
import { FileText, Download, MoreVertical, Check } from "lucide-react";
import PropTypes from "prop-types";
import FileMenu from "./FileMenu";

const FileGridItem = ({
  file,
  onClick,
  onSelect,
  onDownload,
  onDelete,
  onRename,
  onShare,
  isSelected,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenuOpen(true);
  };

  const handleClick = (e) => {
    if (!e.target.closest("button") && !e.target.closest(".no-preview")) {
      onClick?.();
    }
  };

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

  return (
    <div
      className={`relative bg-white rounded-xl border-2 ${
        isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"
      } overflow-visible shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection checkbox */}
      <div
        className={`absolute top-3 left-3 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
          isSelected
            ? "bg-blue-500 text-white opacity-100"
            : isHovered
            ? "bg-white border border-gray-300 opacity-100"
            : "opacity-0"
        } no-preview z-10`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(file.id, "file", !isSelected);
        }}
      >
        {isSelected && <Check size={14} strokeWidth={3} />}
      </div>

      {/* File preview/content */}
      <div className="p-5 flex flex-col items-center overflow-visible">
        <div className="w-20 h-20 flex items-center justify-center bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
          <FileText className="text-blue-500" size={36} strokeWidth={1.5} />
        </div>
        <div className="text-center w-full">
          <p className="text-sm font-medium text-gray-800 truncate px-2">
            {file.filename}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>

      {/* Footer with actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 group-hover:bg-gray-100/50 transition-colors overflow-visible">
        <span className="text-xs text-gray-500">
          {new Date(file.upload_time).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <div className="flex gap-2 relative overflow-visible">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            className="text-gray-500 hover:text-blue-500 p-1 no-preview transition-colors"
            title="Download"
            aria-label="Download file"
          >
            <Download size={16} strokeWidth={2} />
          </button>

          <div className="relative no-preview overflow-visible">
            <button
              ref={menuButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-gray-500 hover:text-gray-700 p-1 transition-colors"
              title="More options"
              aria-label="File options"
              aria-haspopup="true"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={16} strokeWidth={2} />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 bottom-full mb-2 z-[9999]"
              >
                <FileMenu
                  onClose={() => setMenuOpen(false)}
                  onDownload={() => onDownload(file)}
                  onDelete={() => onDelete(file.id)}
                  onRename={() => onRename(file)}
                  onShare={() => onShare(file)}
                  file={file}
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
