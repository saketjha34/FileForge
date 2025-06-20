import React, { forwardRef } from "react";
import { Edit2, Link, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const FolderMenu = forwardRef(
  ({ folder, onClose, onDelete, onRename, onFavorite, isFavorite }, ref) => {
    const handleCopyLink = async (e) => {
      e?.stopPropagation();
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
        onClose();
      } catch (err) {
        toast.error("Failed to copy link");
      }
    };

    const handleFavorite = (e) => {
      e?.stopPropagation();
      onFavorite();
      onClose();
    };

    const handleDelete = (e) => {
      e?.stopPropagation();
      onDelete(folder.id);
      onClose();
    };

    const handleRename = (e) => {
      e?.stopPropagation();
      onRename(folder);
      onClose();
    };

    return (
      <div
        ref={ref}
        className="w-48 bg-white rounded-md shadow-lg py-1 focus:outline-none"
      >
        <button
          onClick={handleRename}
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
          onClick={handleFavorite}
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
          onClick={handleDelete}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
        >
          <Trash2 size={14} className="mr-3" />
          Delete
        </button>
      </div>
    );
  }
);

FolderMenu.displayName = "FolderMenu";

export default FolderMenu;
