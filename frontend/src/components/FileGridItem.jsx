import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, MoreVertical } from "lucide-react";
import FileMenu from "./FileMenu";

const FileGridItem = ({ file, downloadFile, deleteFile }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/preview/${file.id}`)}
    >
      <div className="p-4 flex flex-col items-center">
        <div className="w-16 h-16 flex items-center justify-center bg-blue-50 rounded-lg mb-3">
          <FileText className="text-blue-600" size={32} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900 truncate w-full px-2">
            {file.filename}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-2 flex justify-between items-center bg-gray-50">
        <span className="text-xs text-gray-500">
          {new Date(file.upload_time).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(file);
            }}
            className="text-gray-500 hover:text-blue-600 p-1"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 relative"
            title="More options"
          >
            <MoreVertical size={16} />
            {menuOpen && (
              <FileMenu
                ref={menuRef}
                file={file}
                onClose={() => setMenuOpen(false)}
                onDownload={() => downloadFile(file)}
                onDelete={() => deleteFile(file.id)}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileGridItem;
