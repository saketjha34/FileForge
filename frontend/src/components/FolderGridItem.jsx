import React, { useState, useEffect, useRef } from "react";
import { Folder, MoreVertical, Check, Heart, Download } from "lucide-react";
import FolderMenu from "./FolderMenu";

const FolderGridItem = ({
  folder,
  onDownload,
  navigateToFolder,
  onDelete,
  onSelect,
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

  const handleFavorite = (e) => {
    e?.stopPropagation();
    onFavorite(folder.id, "folder");
    setMenuOpen(false);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(folder.id, "folder", !isSelected);
  };

  const handleClick = () => {
    navigateToFolder(folder.id, folder.name);
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 ${
        isSelected ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"
      } overflow-visible shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuOpen(true);
      }}
    >
      {/* Favorite icon */}
      <div
        className={`absolute top-3 right-3 z-10 ${
          isHovered || isFavorite ? "opacity-100" : "opacity-0"
        } transition-opacity cursor-pointer`}
        onClick={handleFavorite}
        title="Toggle favorite"
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
        } no-preview z-10 cursor-pointer`}
        onClick={handleSelect}
        title="Select folder"
      >
        {isSelected && <Check size={14} strokeWidth={3} />}
      </div>

      {/* Folder preview */}
      <div className="p-5 flex flex-col items-center overflow-visible">
        <div className="w-20 h-20 flex items-center justify-center bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
          <Folder className="text-blue-500" size={36} strokeWidth={1.5} />
        </div>
        <div className="text-center w-full">
          <p
            className="text-sm font-medium text-gray-800 truncate px-2"
            title={folder.name}
          >
            {folder.name}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {folder.item_count || 0} item{folder.item_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Footer with actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center bg-gray-50/50 group-hover:bg-gray-100/50 transition-colors overflow-visible">
        <span className="text-xs text-gray-500">
          {folder.created_at
            ? new Date(folder.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Unknown Date"}
        </span>
        <div className="flex gap-2 relative overflow-visible">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(folder);
            }}
            className="text-gray-400 hover:text-blue-600 p-1 transition-colors cursor-pointer"
            title="Download folder"
          >
            <Download size={16} />
          </button>
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 transition-colors cursor-pointer"
            title="More options"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            aria-label="Folder options"
          >
            <MoreVertical size={16} strokeWidth={2} />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 z-[9999] cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              <FolderMenu
                folder={folder}
                onClose={() => setMenuOpen(false)}
                onDelete={() => onDelete(folder.id)}
                onRename={() => onRename(folder)}
                onFavorite={handleFavorite}
                isFavorite={isFavorite}
                onDownload={() => onDownload(folder)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FolderGridItem;
