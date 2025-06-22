import React, { useMemo } from "react";
import { useLocation, Navigate } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardContent from "../components/Dashboard/DashboardContent";
import DashboardModals from "../components/Dashboard/DashboardModals";
import { useDashboard } from "../components/Dashboard/DashboardHooks";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = ({ isFavoritesPage = false, customEmptyState, ...props }) => {
  const location = useLocation();
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const dashboardProps = useDashboard({
    ...props,
    isFavoritesPage:
      isFavoritesPage || location.pathname === "/dashboard/favorites",
  });

  const { filteredFolders, filteredFiles } = useMemo(() => {
    const searchQuery = dashboardProps.searchQuery || "";
    const searchLower = searchQuery.toLowerCase();

    if (isFavoritesPage && !dashboardProps.currentFolder) {
      return {
        filteredFolders: dashboardProps.favoriteFolders
          .filter((f) => !f.parent)
          .filter((f) =>
            searchQuery ? f.name.toLowerCase().includes(searchLower) : true
          ),
        filteredFiles: dashboardProps.favoriteFiles
          .filter((f) => !f.parent)
          .filter((f) =>
            searchQuery ? f.filename.toLowerCase().includes(searchLower) : true
          ),
      };
    }
    return {
      filteredFolders: dashboardProps.filteredFolders,
      filteredFiles: dashboardProps.filteredFiles,
    };
  }, [
    dashboardProps.searchQuery,
    dashboardProps.currentFolder,
    dashboardProps.favoriteFolders,
    dashboardProps.favoriteFiles,
    dashboardProps.filteredFolders,
    dashboardProps.filteredFiles,
    isFavoritesPage,
  ]);

  const isEmpty = filteredFolders.length === 0 && filteredFiles.length === 0;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <DashboardSidebar currentPath={location.pathname} {...dashboardProps} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader {...dashboardProps} isSpecialPage={isFavoritesPage} />
        <DashboardContent
          {...dashboardProps}
          filteredFolders={filteredFolders}
          filteredFiles={filteredFiles}
          isFavoritesPage={isFavoritesPage}
          customEmptyState={customEmptyState}
          isEmpty={isEmpty}
        />
      </div>
      <DashboardModals {...dashboardProps} />
    </div>
  );
};

export default Dashboard;
