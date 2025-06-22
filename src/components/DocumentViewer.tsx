'use client';
import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  fileUrl: string;
  onClose: () => void;
  aiSummary?: string | null;
  aiMCQs?: string | null;
  aiQnA?: string | null;
}

export default function DocumentViewer({ fileUrl, onClose, aiSummary, aiMCQs, aiQnA }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isPdf, setIsPdf] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('DocumentViewer useEffect triggered with fileUrl:', fileUrl);
    if (fileUrl) {
      const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
      const isPdfFile = fileExtension === 'pdf';
      setIsPdf(isPdfFile);
      setLoadingContent(true);
      setError(null);

      console.log('Detected fileExtension:', fileExtension, 'isPdf:', isPdfFile);

      if (!isPdfFile) { // Changed from fileExtension !== 'pdf' to !isPdfFile for clarity
        // Fetch content for non-PDF files (assuming text-based for now)
        fetch(fileUrl)
          .then(res => {
            console.log('Fetch response status:', res.status);
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.text();
          })
          .then(text => {
            console.log('Text content fetched successfully.');
            setTextContent(text);
          })
          .catch(err => {
            console.error("Error fetching document content:", err);
            setError("Could not load document content. Only plain text and PDFs are supported.");
            setTextContent(null);
          })
          .finally(() => {
            console.log('Non-PDF content fetch finished. setLoadingContent(false)');
            setLoadingContent(false);
          });
      } else {
        console.log('PDF file detected. setLoadingContent(false)');
        setLoadingContent(false);
      }
    }
  }, [fileUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF Document loaded successfully. Number of pages:', numPages);
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page on new document load
  }

  const goToPrevPage = () => setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  const goToNextPage = () => setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Document Viewer</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="flex-grow flex overflow-hidden">
          <div className="flex-grow p-4 overflow-y-auto border-r">
            {loadingContent ? (
              <p>Loading document content...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : isPdf ? (
              <div className="flex flex-col items-center">
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={(err) => {
                    console.error(`Failed to load PDF:`, err);
                    setError(`Failed to load PDF: ${err.message}`);
                  }}
                  className="w-full max-w-full"
                >
                  <Page pageNumber={pageNumber} width={600} />
                </Document>
                {numPages && (
                  <div className="flex justify-center items-center mt-2">
                    <button
                      onClick={goToPrevPage}
                      disabled={pageNumber <= 1}
                      className="px-3 py-1 mr-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span>Page {pageNumber} of {numPages}</span>
                    <button
                      onClick={goToNextPage}
                      disabled={pageNumber >= numPages}
                      className="px-3 py-1 ml-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : textContent ? (
              <pre className="whitespace-pre-wrap font-mono text-sm">{textContent}</pre>
            ) : (
              <p>No content to display or unsupported file type.</p>
            )}
          </div>

          <div className="w-1/3 p-4 overflow-y-auto bg-gray-50 flex flex-col">
            <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
            {aiSummary && (
              <div className="mb-4">
                <h4 className="font-medium">Summary:</h4>
                <p className="text-sm whitespace-pre-wrap bg-white p-2 rounded">{aiSummary}</p>
              </div>
            )}
            {aiMCQs && (
              <div className="mb-4">
                <h4 className="font-medium">MCQs:</h4>
                <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded">{aiMCQs}</pre>
              </div>
            )}
            {aiQnA && (
              <div className="mb-4">
                <h4 className="font-medium">Q&A:</h4>
                <pre className="text-sm whitespace-pre-wrap bg-white p-2 rounded">{aiQnA}</pre>
              </div>
            )}
            {!aiSummary && !aiMCQs && !aiQnA && (
              <p className="text-sm text-gray-600">No AI insights available for this document yet. Use the actions on the previous page to generate them.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}