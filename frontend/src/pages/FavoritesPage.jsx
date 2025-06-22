import React from "react";
import Dashboard from "./Dashboard";
import { useDashboard } from "../components/Dashboard/DashboardHooks";
import EmptyState from "../components/EmptyState";

const FavoritesPage = () => {
  const dashboardProps = useDashboard({ isFavoritesPage: true });

  const {
    currentFolder,
    searchQuery,
    setSearchQuery,
    uploading,
    uploadFile,
    setShowCreateFolderModal,
    isEmpty,
    favoriteFolders,
    favoriteFiles,
  } = dashboardProps;

  // Check if we're at the root favorites page with no favorites
  const noFavorites =
    !currentFolder &&
    favoriteFolders.length === 0 &&
    favoriteFiles.length === 0;

  return (
    <Dashboard
      {...dashboardProps}
      isFavoritesPage={true}
      customEmptyState={
        noFavorites && (
          <EmptyState
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            setShowCreateFolderModal={setShowCreateFolderModal}
            uploading={uploading}
            handleFileUpload={uploadFile}
            isFavoritesPage={true}
          />
        )
      }
    />
  );
};

export default FavoritesPage;
