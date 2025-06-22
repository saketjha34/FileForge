import React, { forwardRef } from "react";
import { Edit2, Link, Star, Trash2, Download } from "lucide-react";
import toast from "react-hot-toast";

const FileMenu = forwardRef(
  (
    { file, onClose, onDownload, onDelete, onRename, onFavorite, isFavorite },
    ref
  ) => {
    const handleCopyLink = async (e) => {
      
    };

    const handleAction = (e, action) => {
      e?.stopPropagation();
      action();
      onClose();
    };

    return (
      <div
        ref={ref}
        className="w-48 bg-white rounded-md shadow-lg py-1 focus:outline-none cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleAction(e, onDownload)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
        >
          <Download size={14} className="mr-3" />
          Download
        </button>

        <button
          onClick={(e) => handleAction(e, onRename)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
        >
          <Edit2 size={14} className="mr-3" />
          Rename
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
        >
          <Link size={14} className="mr-3" />
          Copy Link
        </button>

        <button
          onClick={(e) => handleAction(e, onFavorite)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
        >
          <Star
            size={14}
            className="mr-3"
            fill={isFavorite ? "currentColor" : "none"}
          />
          {isFavorite ? "Remove favorite" : "Add to favorites"}
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={(e) => handleAction(e, onDelete)}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left cursor-pointer"
        >
          <Trash2 size={14} className="mr-3" />
          Delete
        </button>
      </div>
    );
  }
);

FileMenu.displayName = "FileMenu";

export default FileMenu;
