import React from "react";
import Dashboard from "./Dashboard";
import { useDashboard } from "../components/Dashboard/DashboardHooks";
import EmptyState from "../components/EmptyState";

const FavoritesPage = () => {
  const dashboardProps = useDashboard();
  const {
    folders,
    files,
    isFavorite,
    searchQuery,
    setSearchQuery,
    uploading,
    handleFileUpload,
    setShowCreateFolderModal,
    isFavoritesPage = true,
  } = dashboardProps;

  const filteredFolders = folders.filter((folder) =>
    isFavorite(folder.id, "folder")
  );
  const filteredFiles = files.filter((file) => isFavorite(file.id, "file"));

  const noFavorites =
    filteredFolders.length === 0 && filteredFiles.length === 0;

  return (
    <Dashboard
      {...dashboardProps}
      filteredFolders={filteredFolders}
      filteredFiles={filteredFiles}
      isFavoritesPage={true}
      customEmptyState={
        noFavorites && (
          <EmptyState
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowCreateFolderModal={setShowCreateFolderModal}
            uploading={uploading}
            handleFileUpload={handleFileUpload}
            isFavoritesPage={isFavoritesPage}
          />
        )
      }
    />
  );
};

export default FavoritesPage;
