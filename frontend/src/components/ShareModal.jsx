// src/components/ShareModal.js
import React, { useState } from "react";
import { X, Copy, Link as LinkIcon, Mail, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const ShareModal = ({ show, onClose, item }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [linkCopied, setLinkCopied] = useState(false);

  if (!show || !item) return null;

  const shareableLink = `${window.location.origin}/shared/${item.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard");
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement actual sharing logic
    toast.success(`Shared with ${email} (${permission} access)`);
    setEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">
            Share {item.name || item.filename}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <LinkIcon size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {shareableLink}
                </span>
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center text-sm ${
                  linkCopied ? "text-green-600" : "text-blue-600"
                } hover:text-blue-800`}
              >
                <Copy size={14} className="mr-1" />
                {linkCopied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invite people
              </label>
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email addresses"
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="border-l-0 border border-gray-300 rounded-r-md bg-gray-50 text-sm"
                >
                  <option value="view">Can view</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <UserPlus size={16} className="mr-2" />
                Share
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
