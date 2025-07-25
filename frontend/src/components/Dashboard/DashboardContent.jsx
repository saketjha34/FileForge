import React from "react";
import { RefreshCw } from "lucide-react";
import EmptyState from "../EmptyState";
import FileGridItem from "../FileGridItem";
import FolderGridItem from "../FolderGridItem";
import FileListItem from "../FileListItem";
import FolderListItem from "../FolderListItem";

const DashboardContent = ({
  loading,
  filteredFolders,
  filteredFiles,
  viewMode,
  navigateToFolder,
  deleteFolder,
  handleRenameClick,
  selectedItems,
  handleSelectItem,
  downloadFile,
  deleteFile,
  navigate,
  searchQuery,
  setSearchQuery,
  setShowCreateFolderModal,
  uploading,
  uploadFile,
  toggleFavorite,
  isFavorite,
  isFavoritesPage = false,
  isSharedPage = false,
  isTrashPage = false,
  downloadFolder,
  customEmptyState,
  currentFolder,
  isEmpty,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      customEmptyState || (
        <EmptyState
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setShowCreateFolderModal={setShowCreateFolderModal}
          uploading={uploading}
          handleFileUpload={uploadFile}
          isFavoritesPage={isFavoritesPage}
          isSharedPage={isSharedPage}
          isTrashPage={isTrashPage}
        />
      )
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredFolders.map((folder) => (
          <FolderGridItem
            key={folder.id}
            folder={folder}
            onDownload={() => downloadFolder(folder.id)}
            onFavorite={() => toggleFavorite(folder.id, "folder")}
            isFavorite={isFavorite(folder.id, "folder")}
            navigateToFolder={() => navigateToFolder(folder.id, folder.name)}
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
            loading={file.loading}
            onFavorite={() => toggleFavorite(file.id, "file")}
            isFavorite={isFavorite(file.id, "file")}
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
    );
  }

  // List View
  return (
    <div className="p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase hidden md:table-cell">
                Modified
              </th>
              <th className="px-4 py-3 font-medium text-gray-500 uppercase hidden sm:table-cell">
                Size
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredFolders.map((folder) => (
              <FolderListItem
                key={folder.id}
                folder={folder}
                onDownload={() => downloadFolder(folder.id)}
                navigateToFolder={() =>
                  navigateToFolder(folder.id, folder.name)
                }
                onDelete={() => deleteFolder(folder.id)}
                onRename={() => handleRenameClick(folder, "folder")}
                onFavorite={() => toggleFavorite(folder.id, "folder")}
                isFavorite={isFavorite(folder.id, "folder")}
              />
            ))}
            {filteredFiles.map((file) => (
              <FileListItem
                key={file.id}
                file={file}
                onDownload={() => downloadFile(file)}
                onDelete={() => deleteFile(file.id)}
                onRename={() => handleRenameClick(file, "file")}
                onFavorite={() => toggleFavorite(file.id, "file")}
                onClick={() => navigate(`/preview/${file.id}`)}
                isFavorite={isFavorite(file.id, "file")}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardContent;
