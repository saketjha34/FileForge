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
  Loader2,
  RotateCw,
  RotateCcw,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import worker from "pdfjs-dist/build/pdf.worker.min?url";
import toast from "react-hot-toast";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

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
  const [rotation, setRotation] = useState(0);
  const [visiblePages, setVisiblePages] = useState([1]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // File type detection
  const getFileType = (filename, mimeType) => {
    const ext = filename?.toLowerCase().split(".").pop();
    const mime = mimeType?.toLowerCase();

    if (ext === "pdf" || mime === "application/pdf") return "pdf";
    if (
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext) ||
      mime?.startsWith("image/")
    )
      return "image";
    if (["txt", "csv", "log"].includes(ext) || mime?.startsWith("text/"))
      return "text";
    if (
      ["doc", "docx"].includes(ext) ||
      mime?.includes("document") ||
      mime?.includes("wordprocessingml")
    )
      return "document";
    if (
      ["xls", "xlsx"].includes(ext) ||
      mime?.includes("spreadsheet") ||
      mime?.includes("spreadsheetml")
    )
      return "spreadsheet";
    if (
      ["ppt", "pptx"].includes(ext) ||
      mime?.includes("presentation") ||
      mime?.includes("presentationml")
    )
      return "presentation";
    return "other";
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFile();
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
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
          setVisiblePages((prev) => [...prev, nextPage]);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [visiblePages, numPages]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const fetchFile = async () => {
    try {
      setLoading(true);
      // First fetch file metadata
      const res = await fetch(`http://localhost:8000/myfiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch file details");
      }

      const fileData = await res.json();
      setFile(fileData);

      // Then fetch the actual file content
      const fileRes = await fetch(
        `http://localhost:8000/myfiles/download/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!fileRes.ok) {
        throw new Error("Failed to fetch file content");
      }

      const blob = await fileRes.blob();
      const previewUrl = URL.createObjectURL(blob);
      setFileUrl(previewUrl);
    } catch (error) {
      console.error("Error fetching file:", error);
      toast.error("Error loading file preview");
      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
    // Initially load first 2 pages for better user experience
    setVisiblePages([1, Math.min(2, numPages)]);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF load error:", error);
    toast.error("Failed to load PDF document");
    setPdfLoading(false);
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
  };

  const goToPrevPage = () => {
    const newPage = Math.max(pageNumber - 1, 1);
    setPageNumber(newPage);

    // Add previous page to visible pages if not already there
    if (!visiblePages.includes(newPage)) {
      setVisiblePages((prev) => [newPage, ...prev]);
    }

    // Scroll to top of container
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToNextPage = () => {
    const newPage = Math.min(pageNumber + 1, numPages);
    setPageNumber(newPage);

    // Add next page to visible pages if not already there
    if (!visiblePages.includes(newPage)) {
      setVisiblePages((prev) => [...prev, newPage]);
    }

    // Scroll to top of container
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const printDocument = () => {
    const fileType = getFileType(file?.filename, file?.mime_type);

    if (fileType === "pdf" || fileType === "image") {
      const printWindow = window.open(fileUrl, "_blank");
      if (printWindow) {
        printWindow.addEventListener("load", () => {
          printWindow.print();
        });
      }
    } else {
      window.print();
    }
  };

  const downloadFile = async () => {
    try {
      toast.loading("Preparing download...", { id: "download" });
      const res = await fetch(`http://localhost:8000/myfiles/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Download started!", { id: "download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Error downloading file", { id: "download" });
    }
  };

  const handleClose = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    navigate("/dashboard");
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    toast.error("Failed to load image");
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <p className="text-gray-700">Loading file preview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!file || !fileUrl) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 gap-4 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            File not found
          </h3>
          <p className="text-red-600 mb-4">
            The file you're trying to access doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fileType = getFileType(file.filename, file.mime_type);

  return (
    <div
      className={`fixed inset-0 bg-white z-50 flex flex-col ${
        isFullscreen ? "fullscreen-mode" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {fileType === "pdf" && (
              <FileText size={20} className="text-red-500" />
            )}
            {fileType === "image" && (
              <ImageIcon size={20} className="text-green-500" />
            )}
            {!["pdf", "image"].includes(fileType) && (
              <FileText size={20} className="text-gray-500" />
            )}
            <h2 className="text-lg font-medium text-gray-900 truncate max-w-xs md:max-w-md">
              {file.filename}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={downloadFile}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors px-3 py-1.5 rounded-md hover:bg-blue-50"
            title="Download"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50 relative">
        {fileType === "pdf" ? (
          <div className="flex flex-col h-full">
            {/* PDF Toolbar */}
            <div className="flex items-center justify-between bg-white border-b border-gray-200 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs hidden md:inline">
                  PDF Document
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={zoomOut}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={scale <= 0.5}
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={scale >= 3.0}
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>

                {numPages && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-4">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Previous Page"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="font-medium">
                      Page {pageNumber} of {numPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Next Page"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                  <button
                    onClick={printDocument}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Fullscreen size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Content */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto bg-gray-100 p-4 scroll-smooth"
            >
              <div className="flex flex-col items-center">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="flex items-center justify-center h-96">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                        <p className="text-gray-700">Loading PDF document...</p>
                      </div>
                    </div>
                  }
                  noData={
                    <div className="flex items-center justify-center h-96">
                      <p className="text-red-600 font-medium">
                        No PDF file specified
                      </p>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center h-96">
                      <p className="text-red-700 font-semibold">
                        Failed to load PDF document
                      </p>
                    </div>
                  }
                >
                  {visiblePages.map((page) => (
                    <div
                      key={`page-${page}`}
                      className="shadow-md mb-6 last:mb-0 bg-white rounded-md overflow-hidden"
                    >
                      <Page
                        pageNumber={page}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        loading={
                          <div className="h-[1200px] w-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                          </div>
                        }
                        className="border border-gray-200"
                      />
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          </div>
        ) : fileType === "image" ? (
          <div className="flex flex-col h-full">
            {/* Image Toolbar */}
            <div className="flex items-center justify-between bg-white border-b border-gray-200 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs hidden md:inline">
                  Image Viewer
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <button
                    onClick={zoomOut}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={scale <= 0.25}
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="w-12 text-center font-medium">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={scale >= 5.0}
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-4">
                  <button
                    onClick={rotateCounterClockwise}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    title="Rotate Left"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={rotateClockwise}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                    title="Rotate Right"
                  >
                    <RotateCw size={18} />
                  </button>
                  <button
                    onClick={resetView}
                    className="px-2 py-1 text-xs rounded-md hover:bg-gray-100 transition-colors"
                    title="Reset View"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
                  <button
                    onClick={printDocument}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Fullscreen size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Image Content */}
            <div
              ref={containerRef}
              className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center"
            >
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    <p className="text-gray-700">Loading image...</p>
                  </div>
                </div>
              )}
              <img
                ref={imageRef}
                src={fileUrl}
                alt={file.filename}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="max-w-none shadow-lg rounded-md"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: "transform 0.2s ease-in-out",
                }}
              />
            </div>
          </div>
        ) : (
          // Other file types - embed or download prompt
          <div className="flex items-center justify-center h-full p-4 bg-gray-100">
            {["text", "document", "spreadsheet", "presentation"].includes(
              fileType
            ) ? (
              <div className="relative w-full h-full max-w-6xl max-h-[calc(100vh-120px)] bg-white shadow-md rounded-md overflow-hidden">
                <embed
                  src={fileUrl}
                  type={file.mime_type || "application/octet-stream"}
                  width="100%"
                  height="100%"
                  className="block w-full h-full"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    <Fullscreen size={18} />
                  </button>
                  <button
                    onClick={printDocument}
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    title="Print"
                  >
                    <Printer size={18} />
                  </button>
                </div>
              </div>
            ) : (
              // Unsupported file type
              <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md text-center shadow-md">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Preview not available
                </h3>
                <p className="text-gray-600 mb-4">
                  This file type cannot be previewed in the browser. You can
                  download it to view with an appropriate application.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    <strong>File:</strong> {file.filename}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Size:</strong>{" "}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Type:</strong> {file.mime_type || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={downloadFile}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Download size={16} />
                  Download File
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
