import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useViewMode } from "../../contexts/ViewModeContext";
import toast from "react-hot-toast";
import { Grid, List, Heart } from "lucide-react";

const API_BASE = "http://localhost:8000";

export const useDashboard = () => {
  const { token } = useAuth();
  const { viewMode, updateViewMode } = useViewMode();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [favorites, setFavorites] = useState({
    files: [],
    folders: [],
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([]);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
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
    fetchFavorites();
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

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to load favorites");
    }
  };

  const addToFavorites = async (item) => {
    try {
      const body = {};
      if (item.type === "file") {
        body.file_id = item.id;
      } else {
        body.folder_id = item.id;
      }

      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add to favorites");
      }

      toast.success("Added to favorites");
      await fetchFavorites();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error(error.message || "Failed to add to favorites");
    }
  };

  const removeFromFavorites = async (item) => {
    try {
      const body = {};
      if (item.type === "file") {
        body.file_id = item.id;
      } else {
        body.folder_id = item.id;
      }

      const res = await fetch(`${API_BASE}/favorites`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to remove from favorites");
      }

      toast.success("Removed from favorites");
      await fetchFavorites();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast.error(error.message || "Failed to remove from favorites");
    }
  };

  const isFavorite = (id, type) => {
    if (type === "file") {
      return favorites.files.some((file) => file.id === id);
    } else {
      return favorites.folders.some((folder) => folder.id === id);
    }
  };

  const toggleFavorite = (id, type) => {
    const item = { id, type };
    if (isFavorite(id, type)) {
      removeFromFavorites(item);
    } else {
      addToFavorites(item);
    }
  };

  const favoriteIcon = (item) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite({ id: item.id, type: item.type || "file" });
      }}
      className="text-gray-400 hover:text-yellow-500 transition-colors"
      title={isFavorite(item.id, item.type || "file") ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite(item.id, item.type || "file") ? (
        <Heart className="h-4 w-4 fill-yellow-500 text-yellow-500" />
      ) : (
        <Heart className="h-4 w-4" />
      )}
    </button>
  );

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
      fetchFavorites(); // Update favorites after deletion
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
      fetchFavorites(); // Update favorites after deletion
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
      fetchFavorites(); // Update favorites after rename
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

  const favoriteFiles = favorites.files || [];
  const favoriteFolders = favorites.folders || [];

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

  return {
    token,
    files,
    folders,
    favorites,
    favoriteFiles,
    favoriteFolders,
    loading,
    uploading,
    searchQuery,
    setSearchQuery,
    currentFolder,
    folderPath,
    setCurrentFolder,
    setFolderPath,
    showCreateFolderModal,
    setShowCreateFolderModal,
    showRenameModal,
    setShowRenameModal,
    showShareModal,
    setShowShareModal,
    showFavoritesModal,
    setShowFavoritesModal,
    newFolderName,
    setNewFolderName,
    renameData,
    setRenameData,
    shareData,
    setShareData,
    selectedItems,
    setSelectedItems,
    isSearchFocused,
    setIsSearchFocused,
    filteredFiles,
    filteredFolders,
    viewMode,
    viewModeToggleButtons,
    fetchFolderContents,
    fetchFavorites,
    createFolder,
    deleteFile,
    deleteFolder,
    downloadFile,
    uploadFile,
    renameItem,
    handleRenameClick,
    handleShareClick,
    handleSelectItem,
    navigateToFolder,
    navigateUp,
    navigate,
    isFavorite,
    toggleFavorite,
    favoriteIcon,
    addToFavorites,
    removeFromFavorites,
  };
};