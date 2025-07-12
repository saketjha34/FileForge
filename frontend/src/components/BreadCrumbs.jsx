import React from "react";
import { ChevronRight, HardDrive } from "lucide-react";
import PropTypes from "prop-types";

const Breadcrumbs = ({
  currentFolder,
  setCurrentFolder,
  folderPath = [],
  setFolderPath,
  isFavoritesPage = false,
}) => {
  const navigateTo = (index) => {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolder(
      newPath.length > 0 ? newPath[newPath.length - 1].id : null
    );
  };

  return (
    <nav
      className="bg-white border-b border-gray-200 px-6 py-3 flex items-center text-sm text-gray-600"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 overflow-x-auto py-1">
        <li className="flex items-center">
          <button
            onClick={() => {
              setCurrentFolder(null);
              setFolderPath([]);
            }}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200"
            aria-label="Root"
          >
            <HardDrive
              className="mr-2 h-4 w-4 flex-shrink-0"
              aria-hidden="true"
            />
            <span className="font-medium">
              {isFavoritesPage ? "Favorites" : "All Files"}
            </span>
          </button>
        </li>

        {folderPath.map((folder, index) => (
          <li key={folder.id} className="flex items-center whitespace-nowrap">
            <ChevronRight
              className="mx-2 h-4 w-4 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            <button
              onClick={() => navigateTo(index)}
              className={`font-medium transition-colors duration-200 ${
                index === folderPath.length - 1
                  ? "text-blue-600 cursor-default"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              aria-current={
                index === folderPath.length - 1 ? "page" : undefined
              }
              disabled={index === folderPath.length - 1}
            >
              {folder.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};


export default Breadcrumbs;
