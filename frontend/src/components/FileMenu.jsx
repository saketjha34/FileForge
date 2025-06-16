// src/components/FileMenu.js
import React, { forwardRef } from "react";
import { Edit2, Share2, Trash2, Download, Star, Link } from "lucide-react";
import toast from "react-hot-toast";

const FileMenu = forwardRef(
  ({ onClose, onDownload, onDelete, onRename, onShare, file }, ref) => {
    const handleAction = (action) => {
      action();
      onClose();
    };

    const handleCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        onClose();
      } catch (err) {
        toast.error("Failed to copy link");
        console.error("Clipboard error:", err);
      }
    };

    return (
      <div
        ref={ref}
        className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[999]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => handleAction(onDownload)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Download size={14} className="mr-3" />
          Download
        </button>

        <button
          onClick={() => handleAction(onRename)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Edit2 size={14} className="mr-3" />
          Rename
        </button>

        <button
          onClick={() => handleAction(onShare)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Share2 size={14} className="mr-3" />
          Share
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Link size={14} className="mr-3" />
          Copy Link
        </button>

        <button
          onClick={() => toast("Favorite feature coming soon!")}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Star size={14} className="mr-3" />
          Add to favorites
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={() => handleAction(onDelete)}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
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
