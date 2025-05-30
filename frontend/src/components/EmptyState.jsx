import React from "react";
import { Folder, UploadCloud, FolderPlus } from "lucide-react";

const EmptyState = ({
  searchQuery,
  setSearchQuery,
  setShowCreateFolderModal,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      <Folder size={48} className="mb-4" />
      <p className="text-lg">
        {searchQuery ? "No results found" : "This folder is empty"}
      </p>
      {!searchQuery && (
        <div className="mt-4 flex gap-3">
          <label
            htmlFor="upload-input"
            className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-150"
          >
            <UploadCloud size={18} />
            <span>Upload files</span>
          </label>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150"
          >
            <FolderPlus size={18} />
            <span>Create folder</span>
          </button>
        </div>
      )}
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="mt-2 text-blue-600 hover:underline"
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default EmptyState;
