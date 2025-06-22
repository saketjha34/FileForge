import React from "react";
import {
  Upload,
  FolderPlus,
  Trash2,
  Share2,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  FolderInput,
} from "lucide-react";
import Breadcrumbs from "../BreadCrumbs";

const DashboardHeader = ({
  currentFolder,
  setCurrentFolder,
  folderPath,
  setFolderPath,
  navigateUp,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  viewModeToggleButtons,
  uploading,
  uploadFile,
  uploadFolder,
  setShowCreateFolderModal,
  selectedItems,
  setSelectedItems,
  deleteFile,
  deleteFolder,
  handleShareClick,
  loading,
  fetchFolderContents,
}) => {
  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={navigateUp}
            disabled={!currentFolder}
            className={`p-1.5 rounded-full cursor-pointer ${
              currentFolder
                ? "hover:bg-gray-100 text-gray-700"
                : "text-gray-400 cursor-not-allowed"
            } transition-colors duration-150`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Breadcrumbs
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            folderPath={folderPath}
            setFolderPath={setFolderPath}
          />
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={`relative flex items-center px-3 py-2 rounded-md transition-all duration-150 cursor-text ${
              isSearchFocused
                ? "bg-white ring-2 ring-blue-500 shadow-sm"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <Search
              className={`h-4 w-4 ${
                isSearchFocused ? "text-blue-500" : "text-gray-500"
              }`}
            />
            <input
              type="text"
              placeholder="Search files and folders"
              className="ml-2 bg-transparent outline-none text-sm w-64 placeholder-gray-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-gray-500 hover:text-gray-700 transition-colors duration-150 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {viewModeToggleButtons}
        </div>
      </div>
      <div className="px-6 pb-4 flex items-center justify-between border-t border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentFolder
            ? folderPath[folderPath.length - 1]?.name
            : "All Files"}
        </h2>
        <div className="flex items-center space-x-3">
          <label
            htmlFor="file-upload"
            className={`flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-150 ${
              uploading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
            {uploading && <RefreshCw className="ml-2 h-3 w-3 animate-spin" />}
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={uploadFile}
            disabled={uploading}
            multiple
          />

          <label
            htmlFor="folder-upload"
            className={`flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors duration-150 ${
              uploading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <FolderInput className="h-4 w-4 mr-2" />
            Upload Folder (ZIP)
            {uploading && <RefreshCw className="ml-2 h-3 w-3 animate-spin" />}
          </label>
          <input
            id="folder-upload"
            type="file"
            className="hidden"
            onChange={uploadFolder}
            disabled={uploading}
            accept=".zip,application/zip"
          />

          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition-colors duration-150 cursor-pointer"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </button>
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-2 ml-2">
              <button
                onClick={() => {
                  selectedItems.forEach((item) => {
                    if (item.type === "file") {
                      deleteFile(item.id);
                    } else {
                      deleteFolder(item.id);
                    }
                  });
                  setSelectedItems([]);
                }}
                className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-red-600 transition-colors duration-150 cursor-pointer"
                title="Delete selected"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              <button
                onClick={() => {
                  if (selectedItems.length === 1) {
                    const item = selectedItems[0];
                    handleShareClick({ id: item.id }, item.type);
                  }
                }}
                className={`flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md ${
                  selectedItems.length === 1
                    ? "hover:bg-gray-50 text-gray-700 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                } transition-colors duration-150`}
                title={
                  selectedItems.length === 1
                    ? "Share selected"
                    : "Select one item to share"
                }
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          )}
          <button
            onClick={fetchFolderContents}
            className={`p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors duration-150 cursor-pointer ${
              loading ? "animate-spin" : ""
            }`}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
