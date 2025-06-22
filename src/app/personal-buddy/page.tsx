'use client';
import { useState, ChangeEvent, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/auth'; // Adjust path as needed
import { uploadDocument, getDocuments, deleteDocument, DocumentMetadata } from '@/firebaseUtils'; // Adjust path as needed
import { summarizeDocument, generateMCQs, askDocument } from '@/aiUtils'; // Adjust path as needed
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import DocumentViewer with ssr: false
const DocumentViewer = dynamic(() => import('@/components/DocumentViewer'), { ssr: false });

export default function PersonalBuddyPage() {
  const [user, loading, errorAuth] = useAuthState(auth);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('Un-categorised');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [loadingDocuments, setLoadingDocuments] = useState<boolean>(true);

  // State for AI actions results associated with a document (temporary for viewer)
  const [aiResultsMap, setAiResultsMap] = useState<{[docId: string]: {summary?: string, mcqs?: string, qna?: string}}>({});

  // State for AI action modal/input
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showQnAInput, setShowQnAInput] = useState<boolean>(false);
  const [qnaQuestion, setQnaQuestion] = useState<string>('');
  const [currentDocumentForAIAction, setCurrentDocumentForAIAction] = useState<DocumentMetadata | null>(null);
  
  // State for Document Viewer
  const [showDocumentViewer, setShowDocumentViewer] = useState<boolean>(false);
  const [viewerDocument, setViewerDocument] = useState<DocumentMetadata | null>(null);

  const categories = [
    'Education',
    'Research',
    'Health',
    'Personal',
    'Official',
    'Financial',
    'Un-categorised',
  ];

  const fetchDocuments = async (userId: string) => {
    setLoadingDocuments(true);
    try {
      const fetchedDocs = await getDocuments(userId);
      setDocuments(fetchedDocs);
      setFilteredDocuments(fetchedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setUploadError("Failed to load documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments(user.uid);
    }
  }, [user]);

  useEffect(() => {
    let currentDocs = documents;

    // Filter by category
    if (filterCategory !== 'All') {
      currentDocs = currentDocs.filter(doc => doc.category === filterCategory);
    }

    // Search by term
    if (searchTerm) {
      currentDocs = currentDocs.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDocuments(currentDocs);
  }, [documents, filterCategory, searchTerm]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadMessage('');
      setUploadError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      setUploadError('You must be logged in to upload documents.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploadError(null);
    setUploadMessage('Uploading...');
    setUploadProgress(0);

    try {
      await uploadDocument(
        selectedFile,
        user.uid,
        uploadCategory,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      setUploadMessage('Upload successful!');
      setSelectedFile(null); // Clear selected file after successful upload
      // Refresh document list
      if (user) {
        fetchDocuments(user.uid);
      }
    } catch (err) {
      setUploadError('Failed to upload document.');
      console.error('Upload error:', err);
      setUploadMessage('');
    }
  };

  // Helper to fetch document content for AI processing
  const fetchDocumentContent = async (downloadURL: string): Promise<string> => {
    try {
      const response = await fetch(downloadURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const textContent = await response.text(); 
      return textContent;
    } catch (error) {
      console.error("Error fetching document content:", error);
      setAiError("Could not fetch document content for AI processing. Only plain text files are currently supported for direct AI actions.");
      return "";
    }
  };

  const performAIAction = async (action: 'summary' | 'mcqs' | 'qna', doc: DocumentMetadata, question?: string) => {
    setAiLoading(true);
    setAiError(null);
    
    try {
      const documentText = await fetchDocumentContent(doc.downloadURL);
      if (!documentText) {
        setAiLoading(false);
        return;
      }

      let result: string = "";
      if (action === 'summary') {
        result = await summarizeDocument(documentText);
      } else if (action === 'mcqs') {
        result = await generateMCQs(documentText);
      } else if (action === 'qna' && question) {
        result = await askDocument(documentText, question);
      }

      setAiResultsMap(prev => ({
        ...prev,
        [doc.id]: {
          ...prev[doc.id],
          [action]: result
        }
      }));

    } catch (err: any) {
      setAiError(err.message || 'An unknown error occurred during AI action.');
    } finally {
      setAiLoading(false);
      setShowQnAInput(false); // Close QnA input after action
      setQnaQuestion(''); // Clear question
    }
  };

  const handleSummarize = (doc: DocumentMetadata) => {
    performAIAction('summary', doc);
  };

  const handleGenerateMCQs = (doc: DocumentMetadata) => {
    performAIAction('mcqs', doc);
  };

  const handleAskQnA = (doc: DocumentMetadata) => {
    setCurrentDocumentForAIAction(doc);
    setShowQnAInput(true);
    setAiError(null);
  };

  const submitQnAQuestion = () => {
    if (currentDocumentForAIAction && qnaQuestion) {
      performAIAction('qna', currentDocumentForAIAction, qnaQuestion);
    }
  };

  const handleViewDocument = (doc: DocumentMetadata) => {
    setViewerDocument(doc);
    setShowDocumentViewer(true);
  };

  const handleCloseViewer = () => {
    setShowDocumentViewer(false);
    setViewerDocument(null);
  };

  const handleDeleteDocument = async (docId: string, storagePath: string) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        if (user) {
          await deleteDocument(docId, storagePath);
          // Refresh documents after deletion
          fetchDocuments(user.uid);
          setUploadMessage("Document deleted successfully!");
        } else {
          setUploadError("You must be logged in to delete documents.");
        }
      } catch (err) {
        console.error("Error deleting document:", err);
        setUploadError("Failed to delete document.");
      }
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading user...</div>;
  }

  if (errorAuth) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {errorAuth.message}</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Please log in to access this page.</div>;
  }

  const formatDate = (timestamp: any) => {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    return "N/A";
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
      <h1 className="text-4xl font-bold mb-4">Personal Buddy Page</h1>
      <p className="mt-2 text-lg">Manage your documents here.</p>

      <div className="mt-8 p-6 border rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>
        {uploadError && <p className="text-red-500 mb-4">{uploadError}</p>}
        {uploadMessage && <p className="text-green-600 mb-4">{uploadMessage}</p>}

        <div className="mb-4">
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Category:
          </label>
          <select
            id="category-select"
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
            Choose File:
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
          )}
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMessage === 'Uploading...'}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploadMessage === 'Uploading...' ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>

      <div className="mt-8 p-6 border rounded-lg shadow-md w-full max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4">My Documents</h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by file name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow p-2 border rounded-md"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loadingDocuments ? (
          <p>Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p>No documents found. Upload one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBytes(doc.fileSize)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleViewDocument(doc)} className="text-blue-600 hover:text-blue-900 mr-4">View</button>
                      <button onClick={() => handleSummarize(doc)} disabled={aiLoading} className="text-indigo-600 hover:text-indigo-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">Summarize</button>
                      <button onClick={() => handleGenerateMCQs(doc)} disabled={aiLoading} className="text-purple-600 hover:text-purple-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">MCQs</button>
                      <button onClick={() => handleAskQnA(doc)} disabled={aiLoading} className="text-orange-600 hover:text-orange-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed">Ask Q&A</button>
                      <button onClick={() => handleDeleteDocument(doc.id, doc.storagePath)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showQnAInput && currentDocumentForAIAction && (
        <div className="mt-4 p-4 border rounded-lg shadow-md w-full max-w-2xl bg-white">
          <h3 className="text-xl font-semibold mb-2">Ask Question about &quot;{currentDocumentForAIAction.fileName}&quot;</h3>
          <input
            type="text"
            placeholder="Your question..."
            value={qnaQuestion}
            onChange={(e) => setQnaQuestion(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowQnAInput(false)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={submitQnAQuestion}
              disabled={aiLoading || !qnaQuestion}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Processing...' : 'Submit Question'}
            </button>
          </div>
        </div>
      )}

      {showDocumentViewer && viewerDocument && (
        <DocumentViewer
          fileUrl={viewerDocument.downloadURL}
          onClose={handleCloseViewer}
          aiSummary={aiResultsMap[viewerDocument.id]?.summary || null}
          aiMCQs={aiResultsMap[viewerDocument.id]?.mcqs || null}
          aiQnA={aiResultsMap[viewerDocument.id]?.qna || null}
        />
      )}

      {(aiLoading || aiError) && !showDocumentViewer && (
        <div className="mt-8 p-6 border rounded-lg shadow-md w-full max-w-2xl bg-white">
          <h2 className="text-2xl font-semibold mb-4">AI Action Status</h2>
          {aiLoading && <p>Processing AI request for {currentDocumentForAIAction?.fileName || 'document'}... This may take a moment.</p>}
          {aiError && <p className="text-red-500">Error: {aiError}</p>}
        </div>
      )}
    </div>
  );
}