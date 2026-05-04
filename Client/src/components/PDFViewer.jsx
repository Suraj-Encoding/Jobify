

import { useState } from "react";
import { X, ZoomIn, ZoomOut, ExternalLink, Download } from "lucide-react";

/**
 * Reusable PDF Viewer Component
 * Used for viewing resumes, cover letters, and other PDF documents
 * 
 * @param {boolean} isOpen - Whether the viewer is open
 * @param {function} onClose - Function to call when closing the viewer
 * @param {string} pdfUrl - URL of the PDF to display
 * @param {string} title - Title to display in the header (e.g., "Resume Viewer", "Cover Letter")
 */
const PDFViewer = ({ isOpen, onClose, pdfUrl, title = "PDF Viewer" }) => {
    const [zoom, setZoom] = useState(100);

    if (!isOpen || !pdfUrl) return null;

    const handleZoomIn = () => setZoom(Math.min(200, zoom + 25));
    const handleZoomOut = () => setZoom(Math.max(50, zoom - 25));

    // Generate download URL by replacing /view with /download
    const downloadUrl = pdfUrl.replace('/view', '/download');

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[80] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <div className="flex items-center space-x-1">
                        {/* Zoom Controls */}
                        <button
                            onClick={handleZoomOut}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[60px] text-center font-medium">
                            {zoom}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </button>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                        {/* Open in New Tab */}
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Open in New Tab"
                        >
                            <ExternalLink className="w-5 h-5" />
                        </a>

                        {/* Download */}
                        <a
                            href={downloadUrl}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download"
                        >
                            <Download className="w-5 h-5" />
                        </a>

                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
                    <div
                        className="min-h-full flex justify-center p-6"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    >
                        <embed
                            src={pdfUrl + '#toolbar=0&navpanes=0&scrollbar=1'}
                            type="application/pdf"
                            className="bg-white shadow-xl rounded"
                            style={{ width: '850px', height: '1100px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
