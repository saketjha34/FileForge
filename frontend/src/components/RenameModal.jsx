import React from "react";
import { X } from "lucide-react";

const RenameModal = ({ show, onClose, name, setName, onRename, type }) => {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onRename();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Rename {type?.charAt(0).toUpperCase() + type?.slice(1)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="rename-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Name
          </label>
          <input
            id="rename-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            placeholder={`Enter new ${type} name`}
            required
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Rename
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameModal;
