// src/components/FolderMenu.js
import React, { forwardRef } from "react";
import { Edit2, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FolderMenu = forwardRef(
  ({ folder, onClose, onDelete, onRename }, ref) => {
    const handleAction = (action) => {
      action();
      onClose();
    };

    return (
      <div
        ref={ref}
        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[999]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            toast("Share feature coming soon!");
            onClose();
          }}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Share2 size={14} className="mr-2" />
          Share
        </button>

        <button
          onClick={() => handleAction(onRename)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Edit2 size={14} className="mr-2" />
          Rename
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={() => handleAction(onDelete)}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
        >
          <Trash2 size={14} className="mr-2" />
          Delete
        </button>
      </div>
    );
  }
);

FolderMenu.displayName = "FolderMenu";
export default FolderMenu;
