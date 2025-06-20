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
}) => {
  return (
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
          isFavoritesPage={isFavoritesPage}
        />
      ) : viewMode === "grid" ? (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredFolders.map((folder) => (
            <FolderGridItem
              key={folder.id}
              folder={folder}
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
      )}
    </div>
  );
};

export default DashboardContent;
