import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:8000";

const Dashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFiles();
  }, [token, navigate]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/myfiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching files");
    } finally {
      setLoading(false);
    }
  };

  const fetchFileById = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/myfiles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch file details");
      const data = await res.json();
      setSelectedFile(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching file details");
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete file");
      toast.success("File deleted");
      fetchFiles();
      if (selectedFile && selectedFile.id === id) {
        setSelectedFile(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting file");
    }
  };

const downloadFile = async (file) => {
  try {
    const res = await fetch(`${API_BASE}/download/${file.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Network response was not ok");
    }

    const blob = await res.blob();
    const contentDisposition = res.headers.get("content-disposition");
    let filename = file.filename || "downloaded_file";

    // Extract filename from content-disposition header
    if (contentDisposition && contentDisposition.includes("filename=")) {
      filename = contentDisposition
        .split("filename=")[1]
        .replace(/"/g, "")
        .trim();
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success("Download started!");
  } catch (error) {
    console.error(error);
    toast.error("Error downloading file");
  }
};

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      toast.success("File uploaded successfully");
      fetchFiles();
    } catch (error) {
      console.error(error);
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
      e.target.value = null; // reset input
    }
  };

  if (!token) return null;

  return (
    <div className="mt-10 max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">My Files</h2>
      <p className="text-gray-600 mb-6">
        Upload, manage, and share your files securely with FileForge.
      </p>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Upload New File:</label>
        <input
          type="file"
          onChange={uploadFile}
          disabled={uploading}
          className="border p-2 rounded"
        />
      </div>

      {loading ? (
        <p>Loading files...</p>
      ) : files.length === 0 ? (
        <p className="text-gray-500">No files uploaded yet.</p>
      ) : (
        <ul className="border rounded divide-y">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => fetchFileById(file.id)}
            >
              <span>{file.filename}</span>
              <div className="space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(file);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Download
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFile(file.id);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedFile && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold mb-2">File Details</h3>
          <p>
            <strong>ID:</strong> {selectedFile.id}
          </p>
          <p>
            <strong>Name:</strong> {selectedFile.filename}
          </p>
          <p>
            <strong>Type:</strong> {selectedFile.mime_type}
          </p>
          <p>
            <strong>Size:</strong> {selectedFile.size} bytes
          </p>
          <p>
            <strong>Uploaded at:</strong>{" "}
            {new Date(selectedFile.upload_time).toLocaleString()}
          </p>
          <button
            onClick={() => setSelectedFile(null)}
            className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
