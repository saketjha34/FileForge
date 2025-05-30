import React, { forwardRef } from "react";
import { Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FolderMenu = forwardRef(({ folder, onClose, onDelete }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
    >
      <div className="py-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast("Share feature coming soon!");
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Share2 size={14} className="mr-2" />
          Share
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
});

export default FolderMenu;
