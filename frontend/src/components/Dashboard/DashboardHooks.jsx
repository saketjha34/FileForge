import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useViewMode } from "../../contexts/ViewModeContext";
import toast from "react-hot-toast";
import { Grid, List, Heart } from "lucide-react";

const API_BASE = "http://localhost:8000";

export const useDashboard = ({ isFavoritesPage = false } = {}) => {
  const token = localStorage.getItem("token");
  const { viewMode, updateViewMode } = useViewMode();
  const navigate = useNavigate();
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
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

   const filteredFiles = useMemo(
     () =>
       files.filter((file) =>
         file.filename.toLowerCase().includes(searchQuery.toLowerCase())
       ),
     [files, searchQuery]
   );

   const filteredFolders = useMemo(
     () =>
       folders.filter((folder) =>
         folder.name.toLowerCase().includes(searchQuery.toLowerCase())
       ),
     [folders, searchQuery]
   );

   const isEmpty = useMemo(
     () => filteredFolders.length === 0 && filteredFiles.length === 0,
     [filteredFolders, filteredFiles]
   );

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFolderContents();
    fetchFavorites();
  }, [token, navigate, currentFolder]);

  const uploadFolder = async (e) => {
    const zipFile = e.target.files[0];
    if (!zipFile) return;

    // Check if the file is a ZIP
    if (!zipFile.type.includes("zip") && !zipFile.name.endsWith(".zip")) {
      toast.error("Please upload a ZIP file");
      e.target.value = null;
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("zip_file", zipFile);

      // Construct URL with folder_id as query parameter if currentFolder exists
      const url = currentFolder
        ? `${API_BASE}/upload_zip_file?folder_id=${currentFolder}`
        : `${API_BASE}/upload_zip_file`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload folder");
      }

      const data = await res.json();
      toast.success(`Folder "${data.name}" uploaded successfully`);
      fetchFolderContents();
    } catch (error) {
      console.error("Error uploading folder:", error);
      toast.error(error.message || "Failed to upload folder");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };
  const downloadFolder = async (folderId) => {
    try {
      const res = await fetch(`${API_BASE}/folders/download/${folderId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to download folder");
      }

      // Assuming the API returns a ZIP file
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Get folder name to use as download filename
      const folder = folders.find((f) => f.id === folderId);
      const folderName = folder?.name || "folder";

      // Create download link
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folderName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Folder download started");
    } catch (error) {
      console.error("Error downloading folder:", error);
      toast.error(error.message || "Failed to download folder");
    }
  };

   const fetchFolderContents = async () => {
     setLoading(true);
     try {
       if (currentFolder) {
         // For nested folders, fetch all contents normally
         const url = `${API_BASE}/folders/${currentFolder}/details`;
         const res = await fetch(url, {
           headers: { Authorization: `Bearer ${token}` },
         });
         if (!res.ok) throw new Error("Failed to fetch folder details");
         const data = await res.json();
         setFolders(data.subfolders || []);
         setFiles(data.files || []);
       } else {
         // At root level, apply favorites filter if on favorites page
         if (isFavoritesPage) {
           setFolders(favorites.folders.filter((f) => !f.parent));
           setFiles(favorites.files.filter((f) => !f.parent));
         } else {
           // Normal root folder contents
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
       setFavorites({ files: data.files || [], folders: data.folders || [] });
     } catch (error) {
       console.error("Error fetching favorites:", error);
       toast.error("Failed to load favorites");
     }
   };
  const addToFavorites = async (item) => {
    try {
      const body =
        item.type === "file" ? { file_id: item.id } : { folder_id: item.id };
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to add to favorites");

      toast.success("Added to favorites");
      await fetchFavorites();
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error(error.message || "Failed to add to favorites");
    }
  };

  const removeFromFavorites = async (item) => {
    try {
      const body =
        item.type === "file" ? { file_id: item.id } : { folder_id: item.id };
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to remove from favorites");

      toast.success("Removed from favorites");
      await fetchFavorites();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      toast.error(error.message || "Failed to remove from favorites");
    }
  };

  const toggleFavorite = async (id, type) => {
    const isCurrentlyFavorite = isFavorite(id, type);
    try {
      const endpoint = isCurrentlyFavorite ? "DELETE" : "POST";
      const body = type === "file" ? { file_id: id } : { folder_id: id };

      const res = await fetch(`${API_BASE}/favorites`, {
        method: endpoint,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(
          `Failed to ${isCurrentlyFavorite ? "remove" : "add"} favorite`
        );

      toast.success(
        isCurrentlyFavorite ? "Removed from favorites" : "Added to favorites"
      );
      await fetchFavorites();

      // If we're on favorites page and removing a favorite, refetch contents
      if (isFavoritesPage && isCurrentlyFavorite && !currentFolder) {
        fetchFolderContents();
      }
    } catch (error) {
      console.error(
        `Error ${isCurrentlyFavorite ? "removing" : "adding"} favorite:`,
        error
      );
      toast.error(
        error.message ||
          `Failed to ${isCurrentlyFavorite ? "remove" : "add"} favorite`
      );
    }
  };

  const isFavorite = (id, type) => {
    return type === "file"
      ? favorites.files.some((f) => f.id === id)
      : favorites.folders.some((f) => f.id === id);
  };

  const favoriteIcon = (item) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleFavorite(item.id, item.type || "file");
      }}
      className="text-gray-400 hover:text-yellow-500 transition-colors"
      title={
        isFavorite(item.id, item.type || "file")
          ? "Remove from favorites"
          : "Add to favorites"
      }
    >
      <Heart
        className={`h-4 w-4 ${
          isFavorite(item.id, item.type || "file")
            ? "fill-yellow-500 text-yellow-500"
            : ""
        }`}
      />
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


  return {
    token,
    files,
    folders,
    favorites,
    favoriteFiles: favorites.files,
    favoriteFolders: favorites.folders,
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
    viewModeToggleButtons: (
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
    ),
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
    uploadFolder,
    downloadFolder,
    isFavoritesPage,
    showFavoritesModal,
    setShowFavoritesModal,
  };
};
