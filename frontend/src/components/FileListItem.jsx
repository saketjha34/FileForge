import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, MoreVertical } from "lucide-react";
import FileMenu from "./FileMenu";

const FileListItem = ({ file, downloadFile, deleteFile }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  return (
    <tr
      className="hover:bg-gray-50 cursor-pointer"
      onClick={() => navigate(`/preview/${file.id}`)}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-50 rounded-lg">
            <FileText className="text-blue-600" size={20} />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {file.filename}
            </div>
            <div className="text-sm text-gray-500 md:hidden">
              {(file.size / 1024).toFixed(2)} KB
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <div className="text-sm text-gray-500">
          {new Date(file.upload_time).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="text-sm text-gray-500">
          {(file.size / 1024).toFixed(2)} KB
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadFile(file);
            }}
            className="text-gray-400 hover:text-blue-600 p-1"
            title="Download"
          >
            <Download size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-gray-400 hover:text-gray-600 p-1 relative"
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
      </td>
    </tr>
  );
};

export default FileListItem;
