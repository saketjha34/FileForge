import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import TopBar from "./TopBar";
import Breadcrumbs from "../components/BreadCrumbs";
import EmptyState from "../components/EmptyState";
import FileGridItem from "../components/FileGridItem";
import FolderGridItem from "../components/FolderGridItem";
import FileListItem from "../components/FileListItem";
import FolderListItem from "../components/FolderListItem";
import CreateFolderModal from "../components/CreateFolderModal";

const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFiles();
    fetchFolders();
  }, [token, navigate, currentFolder]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const url = currentFolder
        ? `${API_BASE}/folders/${currentFolder}/files`
        : `${API_BASE}/myfiles`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error("fetchFiles error:", error);
      toast.error("Error fetching files");
    } finally {
      setLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const url = currentFolder
        ? `${API_BASE}/folders/${currentFolder}/subfolders`
        : `${API_BASE}/folders`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch folders");
      const data = await res.json();
      setFolders(data);
    } catch (error) {
      console.error("fetchFolders error:", error);
      toast.error("Error fetching folders");
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
          parent_id: currentFolder,
        }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      toast.success("Folder created successfully");
      setShowCreateFolderModal(false);
      setNewFolderName("");
      fetchFolders();
    } catch (error) {
      console.error("createFolder error:", error);
      toast.error("Error creating folder");
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete file");
      toast.success("File moved to trash");
      fetchFiles();
    } catch (error) {
      console.error("deleteFile error:", error);
      toast.error("Error deleting file");
    }
  };

  const deleteFolder = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this folder and its contents?"
      )
    )
      return;
    try {
      const res = await fetch(`${API_BASE}/folders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      toast.success("Folder moved to trash");
      fetchFolders();
    } catch (error) {
      console.error("deleteFolder error:", error);
      toast.error("Error deleting folder");
    }
  };

  const downloadFile = async (file) => {
    try {
      const res = await fetch(`${API_BASE}/download/${file.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Network response was not ok");

      const blob = await res.blob();
      const contentDisposition = res.headers.get("content-disposition");
      let filename = file.filename || "downloaded_file";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        filename = contentDisposition
          .split("filename=")[1]
          .replace(/"/g, "")
          .trim();
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (error) {
      console.error("downloadFile error:", error);
      toast.error("Error downloading file");
    }
  };

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) {
        formData.append("folder_id", currentFolder);
      }

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      await res.json();
      toast.success("File uploaded successfully");
      fetchFiles();
    } catch (error) {
      console.error("uploadFile error:", error);
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const navigateToFolder = (folderId) => {
    setCurrentFolder(folderId);
  };

  const navigateUp = () => {
    setCurrentFolder(null);
  };

  const filteredFiles = files.filter((file) =>
    file.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!token) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentFolder={currentFolder}
        navigateUp={navigateUp}
        user={user}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          currentFolder={currentFolder}
          navigateUp={navigateUp}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          setShowCreateFolderModal={setShowCreateFolderModal}
          uploadFile={uploadFile}
          uploading={uploading}
        />

        <Breadcrumbs
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
        />

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredFiles.length === 0 && filteredFolders.length === 0 ? (
            <EmptyState
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              setShowCreateFolderModal={setShowCreateFolderModal}
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredFolders.map((folder) => (
                <FolderGridItem
                  key={folder.id}
                  folder={folder}
                  navigateToFolder={navigateToFolder}
                  deleteFolder={deleteFolder}
                />
              ))}
              {filteredFiles.map((file) => (
                <FileGridItem
                  key={file.id}
                  file={file}
                  downloadFile={downloadFile}
                  deleteFile={deleteFile}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Size
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFolders.map((folder) => (
                    <FolderListItem
                      key={`folder-${folder.id}`}
                      folder={folder}
                      navigateToFolder={navigateToFolder}
                      deleteFolder={deleteFolder}
                    />
                  ))}
                  {filteredFiles.map((file) => (
                    <FileListItem
                      key={`file-${file.id}`}
                      file={file}
                      downloadFile={downloadFile}
                      deleteFile={deleteFile}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateFolderModal
        show={showCreateFolderModal}
        onClose={() => {
          setShowCreateFolderModal(false);
          setNewFolderName("");
        }}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        createFolder={createFolder}
      />
    </div>
  );
};

export default Dashboard;
