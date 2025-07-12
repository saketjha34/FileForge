import React, { useEffect } from "react";
import { X } from "lucide-react";

const CreateFolderModal = ({
  show,
  onClose,
  newFolderName,
  setNewFolderName,
  createFolder,
}) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-folder-title"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3
            id="create-folder-title"
            className="text-lg font-medium text-gray-900"
          >
            New Folder
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="folder-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Folder name
            </label>
            <input
              type="text"
              id="folder-name"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newFolderName.trim()}
              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                newFolderName.trim()
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
