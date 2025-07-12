import React, { forwardRef } from "react";
import { Download, Edit2, Link, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FolderMenu = forwardRef(
  (
    { folder, onClose, onDelete, onRename, onFavorite, isFavorite, onDownload },
    ref
  ) => {
    const handleCopyLink = async (e) => {
      e.stopPropagation();
      try {
        const shareableLink = `${window.location.origin}/folder/${folder.id}`;
        await navigator.clipboard.writeText(shareableLink);
        toast.success("Link copied to clipboard");
      } catch (err) {
        toast.error("Failed to copy link");
      }
      onClose();
    };

    const handleAction = (e, action) => {
      e.stopPropagation();
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
          onClick={(e) => handleAction(e, onRename)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Edit2 size={14} className="mr-3" />
          Rename
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Link size={14} className="mr-3" />
          Copy Link
        </button>

        <button
          onClick={(e) => handleAction(e, onDownload)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
        >
          <Download size={14} className="mr-3" />
          Download
        </button>

        <button
          onClick={(e) => handleAction(e, onFavorite)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
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
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
        >
          <Trash2 size={14} className="mr-3" />
          Delete
        </button>
      </div>
    );
  }
);


export default FolderMenu;
