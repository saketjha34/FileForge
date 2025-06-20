import React from "react";
import { useLocation } from "react-router-dom";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import DashboardContent from "../components/Dashboard/DashboardContent";
import DashboardModals from "../components/Dashboard/DashboardModals";
import { useDashboard } from "../components/Dashboard/DashboardHooks";

const Dashboard = () => {
  const location = useLocation();
  const dashboardProps = useDashboard();
  const { token, favorites, isFavorite } = dashboardProps;

  if (!token) return null;

  // Determine if we're on the favorites page
  const isFavoritesPage = location.pathname === "/dashboard/favorites";

  // Filter items to show only favorites when on the favorites page
  const filteredFolders = isFavoritesPage
    ? dashboardProps.folders.filter((folder) => isFavorite(folder.id, "folder"))
    : dashboardProps.filteredFolders;

  const filteredFiles = isFavoritesPage
    ? dashboardProps.files.filter((file) => isFavorite(file.id, "file"))
    : dashboardProps.filteredFiles;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader {...dashboardProps} />
        <DashboardContent
          {...dashboardProps}
          filteredFolders={filteredFolders}
          filteredFiles={filteredFiles}
          isFavoritesPage={isFavoritesPage} // This is the key addition
        />
      </div>
      <DashboardModals {...dashboardProps} />
    </div>
  );
};

export default Dashboard;
