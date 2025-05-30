import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Download,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  Fullscreen,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import worker from "pdfjs-dist/build/pdf.worker.min?url";
import toast from "react-hot-toast";

pdfjs.GlobalWorkerOptions.workerSrc = worker;

const FilePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [visiblePages, setVisiblePages] = useState([1]); // Track which pages are visible
  const containerRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFile();
  }, [id, token, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !numPages) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollPosition = scrollTop + clientHeight;

      // Load next page when scrolled near the bottom (80% threshold)
      if (scrollPosition >= scrollHeight * 0.8) {
        const nextPage = Math.min(Math.max(...visiblePages) + 1, numPages);

        if (!visiblePages.includes(nextPage)) {
          setVisiblePages([...visiblePages, nextPage]);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [visiblePages, numPages]);

  const fetchFile = async () => {
    try {
      // Fetch file metadata
      const res = await fetch(`http://localhost:8000/myfiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch file details");
      const fileData = await res.json();
      setFile(fileData);

      // Fetch file content for preview
      const fileRes = await fetch(
        `http://localhost:8000/download/${id}?preview=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!fileRes.ok) throw new Error("Failed to fetch file for preview");

      const blob = await fileRes.blob();
      const previewUrl = window.URL.createObjectURL(blob);
      setFileUrl(previewUrl);
    } catch (error) {
      console.error("Error fetching file:", error);
      toast.error("Error loading file preview");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    // Initially load first 2 pages for better user experience
    setVisiblePages([1, Math.min(2, numPages)]);
  };

  const zoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.25, 0.5));
  };

  const goToPrevPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);

    // Add previous page to visible pages if not already there
    if (!visiblePages.includes(newPage)) {
      setVisiblePages([newPage, ...visiblePages]);
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);

    // Add next page to visible pages if not already there
    if (!visiblePages.includes(newPage)) {
      setVisiblePages([...visiblePages, newPage]);
    }
  };

  const printDocument = () => {
    window.print();
  };

  const downloadFile = async () => {
    try {
      const res = await fetch(`http://localhost:8000/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading file");
    }
  };

  const handleClose = () => {
    // Revoke the object URL to prevent memory leaks
    if (fileUrl) {
      window.URL.revokeObjectURL(fileUrl);
    }
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!file || !fileUrl) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-red-600 font-medium">File not found</div>
        <button
          onClick={() => navigate("/dashboard")}
          className="ml-4 text-blue-600 hover:underline"
        >
          Go back to Dashboard
        </button>
      </div>
    );
  }

  const isPdf = file.filename.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900 truncate max-w-md">
          {file.filename}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadFile}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {isPdf ? (
          <div className="flex flex-col h-full">
            {/* PDF Toolbar */}
            <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {file.filename}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={zoomOut}
                    className="p-1 rounded hover:bg-gray-200"
                    disabled={scale <= 0.5}
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="w-12 text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-1 rounded hover:bg-gray-200"
                    disabled={scale >= 3.0}
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-4">
                  <button
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    className="p-1 rounded hover:bg-gray-200"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span>
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    className="p-1 rounded hover:bg-gray-200"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                  <button
                    onClick={printDocument}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={() => toast("Fullscreen feature coming soon!")}
                    className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    title="Fullscreen"
                  >
                    <Fullscreen size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Content with scrollable container */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto bg-gray-100 p-4"
            >
              <div className="flex flex-col items-center">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-blue-600 font-medium">
                        Loading PDF preview...
                      </p>
                    </div>
                  }
                  noData={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-red-600 font-medium">
                        No PDF file specified
                      </p>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-full">
                      <p className="text-red-700 font-semibold">
                        Failed to load PDF
                      </p>
                    </div>
                  }
                >
                  {visiblePages.map((page) => (
                    <div
                      key={`page-${page}`}
                      className="shadow-lg mb-4 last:mb-0"
                    >
                      <Page
                        pageNumber={page}
                        scale={scale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="border border-gray-200 bg-white"
                      />
                      {page < numPages && (
                        <div className="text-center text-gray-500 text-sm py-2">
                          Continue scrolling to load more pages...
                        </div>
                      )}
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <embed
              src={fileUrl}
              type={file.mime_type || "application/octet-stream"}
              width="100%"
              height="100%"
              className="max-w-full max-h-full border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
