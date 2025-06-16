import React, { forwardRef } from "react";
import { Edit2, Share2, Trash2, Link } from "lucide-react";
import toast from "react-hot-toast";

const FolderMenu = forwardRef(
  ({ folder, onClose, onDelete, onRename,  }, ref) => {
   const handleAction = (action, e) => {
     if (e && e.stopPropagation) e.stopPropagation(); // Safer event check
     action(e); // Pass the event through
     onClose();
   };

    const handleCopyLink = async (e) => {
      e?.stopPropagation();
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
        className="w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >

        <button
          onClick={(e) => handleAction(onRename, e)}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          role="menuitem"
        >
          <Edit2 size={14} className="mr-3" />
          Rename
        </button>

        <button
          onClick={handleCopyLink}
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
          role="menuitem"
        >
          <Link size={14} className="mr-3" />
          Copy Link
        </button>

        <div className="border-t border-gray-200 my-1" />

        <button
          onClick={(e) => handleAction(onDelete, e)}
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
          role="menuitem"
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
