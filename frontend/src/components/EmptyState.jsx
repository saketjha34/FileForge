import React from "react";
import { Folder, UploadCloud, FolderPlus, Star, Heart } from "lucide-react";

const EmptyState = ({
  searchQuery,
  setSearchQuery,
  setShowCreateFolderModal,
  uploading,
  handleFileUpload,
  isFavoritesPage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
      {isFavoritesPage ? (
        <Heart size={48} className="mb-4 text-red-400" />
      ) : (
        <Folder size={48} className="mb-4" />
      )}
      <p className="text-lg">
        {searchQuery
          ? "No results found"
          : isFavoritesPage
          ? "You don't have any favorites yet"
          : "This folder is empty"}
      </p>
      {!searchQuery && !isFavoritesPage && (
        <div className="mt-4 flex gap-3">
          <label
            htmlFor="upload-input"
            className={`cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-150 ${
              uploading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <UploadCloud size={18} />
            <span>{uploading ? "Uploading..." : "Upload files"}</span>
            <input
              id="upload-input"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              multiple
            />
          </label>
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150 cursor-pointer"
          >
            <FolderPlus size={18} />
            <span>Create folder</span>
          </button>
        </div>
      )}
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="mt-2 text-blue-600 hover:underline cursor-pointer"
        >
          Clear search
        </button>
      )}
    </div>
  );
};

export default EmptyState;
