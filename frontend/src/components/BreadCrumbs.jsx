import React from "react";
import { ChevronDown } from "lucide-react";

const Breadcrumbs = ({ currentFolder, setCurrentFolder }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center text-sm text-gray-600">
      <button
        onClick={() => setCurrentFolder(null)}
        className="hover:text-blue-600 hover:underline"
      >
        All Files
      </button>
      {currentFolder && (
        <>
          <ChevronDown className="mx-2 transform -rotate-90" size={16} />
          <span className="text-gray-800 font-medium">Current Folder</span>
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;
