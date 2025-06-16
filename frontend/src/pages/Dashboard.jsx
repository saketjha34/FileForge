import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useViewMode } from "../contexts/ViewModeContext";
import toast from "react-hot-toast";
import {
  Grid,
  List,
  Upload,
  FolderPlus,
  Trash2,
  Share2,
  Star,
  HardDrive,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

import Breadcrumbs from "../components/BreadCrumbs";
import EmptyState from "../components/EmptyState";
import FileGridItem from "../components/FileGridItem";
import FolderGridItem from "../components/FolderGridItem";
import FileListItem from "../components/FileListItem";
import FolderListItem from "../components/FolderListItem";
import CreateFolderModal from "../components/CreateFolderModal";
import RenameModal from "../components/RenameModal";


const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const { token, user } = useAuth();
  const { viewMode, updateViewMode } = useViewMode();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameData, setRenameData] = useState({
    id: null,
    name: "",
    type: "",
  });
  const [shareData, setShareData] = useState({
    id: null,
    type: "",
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFolderContents();
  }, [token, navigate, currentFolder]);

  const fetchFolderContents = async () => {
    setLoading(true);
    try {
      if (currentFolder) {
        const res = await fetch(
          `${API_BASE}/folders/${currentFolder}/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch folder details");

        const data = await res.json();
        setFolders(data.subfolders || []);
        setFiles(data.files || []);
      } else {
        const [foldersRes, filesRes] = await Promise.all([
          fetch(`${API_BASE}/folders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE}/myfiles`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!foldersRes.ok || !filesRes.ok)
          throw new Error("Failed to fetch root contents");

        setFolders(await foldersRes.json());
        setFiles(await filesRes.json());
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load contents");
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/folders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName,
          parent_id: currentFolder || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      toast.success("Folder created successfully");
      setShowCreateFolderModal(false);
      setNewFolderName("");
      fetchFolderContents();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create folder");
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const res = await fetch(`${API_BASE}/myfiles/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("File deleted");
      fetchFolderContents();
    } catch {
      toast.error("Error deleting file");
    }
  };

  const deleteFolder = async (id) => {
    if (!window.confirm("Delete this folder and its contents?")) return;
    try {
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Folder deleted");
      fetchFolderContents();
    } catch {
      toast.error("Error deleting folder");
    }
  };

  const downloadFile = async (file) => {
    try {
      const res = await fetch(`${API_BASE}/myfiles/download/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Download failed");
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadUrl = currentFolder
        ? `${API_BASE}/upload_files?folder_id=${currentFolder}`
        : `${API_BASE}/upload_files`;

      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();
      toast.success("Uploaded");
      fetchFolderContents();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const renameItem = async () => {
    if (!renameData.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      let endpoint, requestBody;

      if (renameData.type === "folder") {
        endpoint = `${API_BASE}/folders/rename`;
        requestBody = {
          folder_id: renameData.id,
          new_name: renameData.name,
        };
      } else {
        endpoint = `${API_BASE}/myfiles/rename`;
        requestBody = {
          file_id: renameData.id,
          new_name: renameData.name,
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Rename failed");
      }

      toast.success("Renamed successfully");
      setShowRenameModal(false);
      fetchFolderContents();
    } catch (error) {
      toast.error(error.message || "Rename failed");
      console.error("Rename error:", error);
    }
  };

  const handleRenameClick = (item, type) => {
    setRenameData({
      id: item.id,
      name: type === "folder" ? item.name : item.filename,
      type,
    });
    setShowRenameModal(true);
  };

  const handleShareClick = (item, type) => {
    setShareData({
      id: item.id,
      type,
    });
    setShowShareModal(true);
  };

  const handleSelectItem = (id, type, isSelected) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, { id, type }]);
    } else {
      setSelectedItems(
        selectedItems.filter((item) => !(item.id === id && item.type === type))
      );
    }
  };

  const navigateToFolder = (folderId, folderName) => {
    setCurrentFolder(folderId);
    setFolderPath((prev) => [...prev, { id: folderId, name: folderName }]);
    setSelectedItems([]);
  };

  const navigateUp = () => {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    setCurrentFolder(newPath.length ? newPath[newPath.length - 1].id : null);
    setSelectedItems([]);
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) return null;
  const viewModeToggleButtons = (
    <div className="flex items-center space-x-0.5 bg-gray-100 rounded-md p-0.5">
      <button
        onClick={() => updateViewMode("grid")}
        className={`p-2 rounded ${
          viewMode === "grid"
            ? "bg-white shadow-sm text-blue-600"
            : "text-gray-600 hover:bg-gray-200"
        } transition-colors duration-150`}
        title="Grid view"
      >
        <Grid className="h-4 w-4" />
      </button>
      <button
        onClick={() => updateViewMode("list")}
        className={`p-2 rounded ${
          viewMode === "list"
            ? "bg-white shadow-sm text-blue-600"
            : "text-gray-600 hover:bg-gray-200"
        } transition-colors duration-150`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-blue-600">FileForge</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md bg-blue-50 text-blue-700 transition-colors duration-150">
              <HardDrive className="mr-3 h-5 w-5 text-blue-600" />
              My Files
            </button>
            <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              <Star className="mr-3 h-5 w-5 text-gray-500" />
              Starred
            </button>
            <button className="flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-150">
              <Share2 className="mr-3 h-5 w-5 text-gray-500" />
              Shared
            </button>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <ChevronDown className="ml-auto h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateUp()}
                disabled={!currentFolder}
                className={`p-1.5 rounded-full ${
                  currentFolder
                    ? "hover:bg-gray-100 text-gray-700"
                    : "text-gray-400"
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
                className={`relative flex items-center px-3 py-2 rounded-md transition-all duration-150 ${
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
                    className="ml-2 text-gray-500 hover:text-gray-700 transition-colors duration-150"
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
                Upload
                {uploading && (
                  <RefreshCw className="ml-2 h-3 w-3 animate-spin" />
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={uploadFile}
                disabled={uploading}
              />
              <button
                onClick={() => setShowCreateFolderModal(true)}
                className="flex items-center px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition-colors duration-150"
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
                    className="flex items-center px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-red-600 transition-colors duration-150"
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
                        ? "hover:bg-gray-50 text-gray-700"
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
                className={`p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors duration-150 ${
                  loading ? "animate-spin" : ""
                }`}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* File/Folder Content */}
        <div className="flex-1 overflow-y-auto overflow-visible bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowCreateFolderModal={setShowCreateFolderModal}
              uploading={uploading}
              handleFileUpload={uploadFile}
            />
          ) : viewMode === "grid" ? (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFolders.map((folder) => (
                <FolderGridItem
                  key={folder.id}
                  folder={folder}
                  navigateToFolder={() =>
                    navigateToFolder(folder.id, folder.name)
                  }
                  onDelete={() => deleteFolder(folder.id)}
                  onRename={() => handleRenameClick(folder, "folder")}
                  isSelected={selectedItems.some(
                    (item) => item.id === folder.id && item.type === "folder"
                  )}
                  onSelect={handleSelectItem}
                />
              ))}
              {filteredFiles.map((file) => (
                <FileGridItem
                  key={file.id}
                  file={file}
                  onDownload={() => downloadFile(file)}
                  onDelete={() => deleteFile(file.id)}
                  onRename={() => handleRenameClick(file, "file")}
                  onClick={() => navigate(`/preview/${file.id}`)}
                  isSelected={selectedItems.some(
                    (item) => item.id === file.id && item.type === "file"
                  )}
                  onSelect={handleSelectItem}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 overflow-visible">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
                <table className="min-w-full divide-y divide-gray-200 overflow-visible">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                      >
                        Modified
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                      >
                        Size
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 overflow-visible">
                    {filteredFolders.map((folder) => (
                      <FolderListItem
                        key={folder.id}
                        folder={folder}
                        navigateToFolder={() =>
                          navigateToFolder(folder.id, folder.name)
                        }
                        onDelete={() => deleteFolder(folder.id)}
                        onRename={() => handleRenameClick(folder, "folder")}
                      />
                    ))}
                    {filteredFiles.map((file) => (
                      <FileListItem
                        key={file.id}
                        file={file}
                        onDownload={() => downloadFile(file)}
                        onDelete={() => deleteFile(file.id)}
                        onRename={() => handleRenameClick(file, "file")}
                        onClick={() => navigate(`/preview/${file.id}`)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateFolderModal
        show={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        createFolder={createFolder}
      />

      <RenameModal
        show={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        name={renameData.name}
        setName={(name) => setRenameData({ ...renameData, name })}
        onRename={renameItem}
        type={renameData.type}
      />
    </div>
  );
};

export default Dashboard;
