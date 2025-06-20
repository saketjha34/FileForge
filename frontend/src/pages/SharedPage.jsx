import React from "react";
import Dashboard from "./Dashboard";
import { useDashboard } from "../components/Dashboard/DashboardHooks";

const SharedPage = () => {
  const dashboardProps = useDashboard();

  // Filter items to show only shared items
  // You'll need to implement this logic based on your API
  const filteredFolders = dashboardProps.folders.filter(
    (folder) => folder.is_shared
  );
  const filteredFiles = dashboardProps.files.filter((file) => file.is_shared);

  return (
    <Dashboard
      {...dashboardProps}
      filteredFolders={filteredFolders}
      filteredFiles={filteredFiles}
    />
  );
};

export default SharedPage;
