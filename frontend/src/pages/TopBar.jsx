import React from "react";
import {
  ChevronDown,
  Search,
  Grid,
  List,
  FolderPlus,
  UploadCloud,
} from "lucide-react";

const TopBar = ({
  currentFolder,
  navigateUp,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  setShowCreateFolderModal,
  uploadFile,
  uploading,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={navigateUp}
          disabled={!currentFolder}
          className={`p-2 rounded-lg ${
            currentFolder ? "hover:bg-gray-100" : "text-gray-300 cursor-default"
          }`}
          title="Go up"
        >
          <ChevronDown className="transform rotate-90" size={20} />
        </button>

        <div className="relative flex-1 max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={18} />
          </div>
          <input
            type="text"
            placeholder="Search files and folders"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          title={viewMode === "grid" ? "List view" : "Grid view"}
        >
          {viewMode === "grid" ? <List size={20} /> : <Grid size={20} />}
        </button>

        <button
          onClick={() => setShowCreateFolderModal(true)}
          className="hidden md:flex items-center gap-2 text-sm bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition duration-150"
          title="New Folder"
        >
          <FolderPlus size={18} />
          <span>New Folder</span>
        </button>

        <label
          htmlFor="upload-input"
          className={`cursor-pointer inline-flex items-center gap-2 ${
            uploading ? "bg-blue-400" : "bg-blue-600"
          } text-white font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition duration-150`}
          title="Upload File"
        >
          <UploadCloud size={18} />
          <span className="hidden md:inline">
            {uploading ? "Uploading..." : "Upload"}
          </span>
          <input
            id="upload-input"
            type="file"
            onChange={uploadFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};

export default TopBar;
