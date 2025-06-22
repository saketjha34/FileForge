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
  const [fileContent, setFileContent] = useState("");
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

  const handleClose = () => {
    navigate("/dashboard");
  };

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
    return "other";
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchFile();

    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [id, token, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !numPages) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const scrollPosition = scrollTop + clientHeight;

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
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        zoomOut();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevPage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNextPage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageNumber, numPages]);

  const fetchFile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/myfiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch file details");
      const fileData = await res.json();
      setFile(fileData);

      const fileRes = await fetch(
        `http://localhost:8000/myfiles/download/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!fileRes.ok) throw new Error("Failed to fetch file content");

      const blob = await fileRes.blob();
      const previewUrl = URL.createObjectURL(blob);
      setFileUrl(previewUrl);

      const fileType = getFileType(fileData.filename, fileData.mime_type);
      if (fileType === "text") {
        const text = await blob.text();
        setFileContent(text);
      }
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
    setVisiblePages([1]);
  };

  const onDocumentLoadError = () => {
    toast.error("Failed to load PDF document");
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () =>
    setPageNumber((prev) => Math.min(prev + 1, numPages));

  const printDocument = () => window.print();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleImageLoad = () => setImageLoading(false);
  const handleImageError = () => {
    toast.error("Failed to load image.");
    setImageLoading(false);
  };

  const downloadFile = () => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = file.filename;
    a.click();
  };

  const renderPdfViewer = () => (
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
              className="p-1.5 rounded-md hover:bg-gray-100"
              disabled={scale <= 0.5}
            >
              <ZoomOut size={18} />
            </button>
            <span className="w-12 text-center font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 rounded-md hover:bg-gray-100"
              disabled={scale >= 3.0}
            >
              <ZoomIn size={18} />
            </button>
          </div>
          {numPages && (
            <div className="flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-4">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded-md hover:bg-gray-100"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-medium">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-1.5 rounded-md hover:bg-gray-100"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
            <button
              onClick={printDocument}
              className="p-1.5 rounded-md hover:bg-gray-100"
            >
              <Printer size={18} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-gray-100"
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
            loading={<Loader2 className="h-8 w-8 text-blue-600 animate-spin" />}
          >
            {visiblePages.map((page) => (
              <div
                key={`page-${page}`}
                className="shadow-md mb-6 bg-white rounded-md"
              >
                <Page
                  pageNumber={page}
                  scale={scale}
                  renderMode="canvas"
                  renderTextLayer
                  renderAnnotationLayer
                  loading={
                    <div className="h-[1200px] w-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                  }
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );

  const renderImageViewer = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
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
  );

  const renderTextViewer = () => (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 p-3 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700">Text File Viewer</h3>
      </div>
      <div className="flex-1 overflow-auto bg-white p-4">
        <pre className="text-sm font-mono whitespace-pre-wrap bg-gray-50 p-4 rounded">
          {fileContent}
        </pre>
      </div>
    </div>
  );

  const renderUnsupportedViewer = () => (
    <div className="flex items-center justify-center h-full p-4 bg-gray-100">
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md text-center shadow-md">
        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          Preview not available
        </h3>
        <p className="text-gray-600 mb-4">
          This file type cannot be previewed in the browser.
        </p>
        <button
          onClick={downloadFile}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Download File
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!file || !fileUrl) {
    return (
      <div className="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50 gap-4 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            File not found
          </h3>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const fileType = getFileType(file.filename, file.mime_type);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="flex items-center justify-between bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-medium text-gray-900 truncate max-w-xs md:max-w-md">
            {file.filename}
          </h2>
        </div>
        <button
          onClick={downloadFile}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50 relative">
        {fileType === "pdf" && renderPdfViewer()}
        {fileType === "image" && renderImageViewer()}
        {fileType === "text" && renderTextViewer()}
        {!["pdf", "image", "text"].includes(fileType) &&
          renderUnsupportedViewer()}
      </div>
    </div>
  );
};

export default FilePreview;
