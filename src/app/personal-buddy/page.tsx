'use client';

import { useState, ChangeEvent, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getClientAuth } from '@/auth';
import { uploadDocument, getDocuments, deleteDocument, DocumentMetadata } from '@/firebaseUtils';
import { summarizeDocumentServer, generateMCQsServer, askDocumentServer } from './actions'; // Import new server actions
import NextDynamic from 'next/dynamic';

// Dynamically import DocumentViewer with SSR disabled
const DocumentViewer = NextDynamic(() => import('@/components/DocumentViewer').then(mod => mod.default), { ssr: false });

function PersonalBuddyContent() {
  const auth = getClientAuth();
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

  const [aiResultsMap, setAiResultsMap] = useState<{
    [docId: string]: { summary?: string; mcqs?: string; qna?: string };
  }>({});
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showQnAInput, setShowQnAInput] = useState<boolean>(false);
  const [qnaQuestion, setQnaQuestion] = useState<string>('');
  const [currentDocumentForAIAction, setCurrentDocumentForAIAction] = useState<DocumentMetadata | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState<boolean>(false);
  const [viewerDocument, setViewerDocument] = useState<DocumentMetadata | null>(null);

  const categories = ['Education', 'Research', 'Health', 'Personal', 'Official', 'Financial', 'Un-categorised'];

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
    if (filterCategory !== 'All') {
      currentDocs = currentDocs.filter(doc => doc.category === filterCategory);
    }
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
        (progress) => setUploadProgress(progress)
      );
      setUploadMessage('Upload successful!');
      setSelectedFile(null);
      fetchDocuments(user.uid);
    } catch (err) {
      setUploadError('Failed to upload document.');
      console.error('Upload error:', err);
      setUploadMessage('');
    } finally {
      // The 'loading' state being set to false here is likely referring to a global loading state
      // that is not defined in this component, and the user state is already handled by useAuthState.
      // Removing this line to avoid potential issues.
      // setLoading(false);
    }
  };

  const fetchDocumentContent = async (downloadURL: string): Promise<string> => {
    try {
      const response = await fetch(downloadURL);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.text();
    } catch (error) {
      console.error("Error fetching document content:", error);
      setAiError("Could not fetch document content for AI processing.");
      return "";
    }
  };

  const performAIAction = async (action: 'summary' | 'mcqs' | 'qna', doc: DocumentMetadata, question?: string) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const text = await fetchDocumentContent(doc.downloadURL);
      if (!text) return;

      let result = "";
      if (action === 'summary') result = await summarizeDocumentServer(text);
      if (action === 'mcqs') result = await generateMCQsServer(text);
      if (action === 'qna' && question) result = await askDocumentServer(text, question);

      setAiResultsMap(prev => ({
        ...prev,
        [doc.id]: { ...prev[doc.id], [action]: result }
      }));
    } catch (err: any) {
      setAiError(err.message || 'AI processing failed.');
    } finally {
      setAiLoading(false);
      setShowQnAInput(false);
      setQnaQuestion('');
    }
  };

  const formatDate = (timestamp: any) =>
    timestamp?.toDate ? timestamp.toDate().toLocaleDateString() : "N/A";

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
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

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Personal Study Buddy</h1>

      {/* Upload Document Section */}
      <section className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload New Document</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">Select Document</label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div>
            <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="category-select"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploadProgress > 0}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadProgress > 0 ? `Uploading (${uploadProgress.toFixed(0)}%)` : 'Upload Document'}
            </button>
          </div>
        </div>
        {uploadMessage && <p className="mt-3 text-sm text-green-600">{uploadMessage}</p>}
        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
      </section>

      {/* Document List Section */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">My Documents</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {loadingDocuments ? (
          <p className="text-gray-600">Loading documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p className="text-gray-600">No documents found. Upload one to get started!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded On</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-900 cursor-pointer" onClick={() => { setViewerDocument(doc); setShowDocumentViewer(true); }}>
                      {doc.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBytes(doc.fileSize)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(doc.uploadedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => performAIAction('summary', doc)}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50" disabled={aiLoading}
                          title="Generate Summary"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </button>
                        <button
                          onClick={() => performAIAction('mcqs', doc)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50" disabled={aiLoading}
                          title="Generate MCQs"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9.247a8.5 8.5 0 011.233-1.564 8.5 8.5 0 011.391-1.391 8.5 8.5 0 011.564-1.233m-6.42 12.84a.5.5 0 01-.177.017h-.001l-.004.001-.005.001-.002.001-.002.001-.002.001-.002.001-.002.001a.5.5 0 01-.177.017H6.5a.5.5 0 01-.177-.017l-.002-.001-.002-.001-.002-.001-.005-.001-.004-.001-.001-.001a.5.5 0 01-.177.017h-.001a.5.5 0 01-.177.017h-.001l-.004.001-.005.001-.002.001-.002.001-.002.001-.002.001-.002.001a.5.5 0 01-.177.017H6.5a.5.5 0 01-.177-.017l-.002-.001-.002-.001-.002-.001-.005-.001-.004-.001-.001-.001z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3 3l3-3"></path></svg>
                        </button>
                        <button
                          onClick={() => { setCurrentDocumentForAIAction(doc); setShowQnAInput(true); }}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50" disabled={aiLoading}
                          title="Ask Questions"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9.247a8.5 8.5 0 011.233-1.564 8.5 8.5 0 011.391-1.391 8.5 8.5 0 011.564-1.233m-6.42 12.84a.5.5 0 01-.177.017h-.001l-.004.001-.005.001-.002.001-.002.001-.002.001-.002.001-.002.001a.5.5 0 01-.177.017H6.5a.5.5 0 01-.177-.017l-.002-.001-.002-.001-.002-.001-.005-.001-.004-.001-.001-.001a.5.5 0 01-.177.017h-.001a.5.5 0 01-.177.017h-.001l-.004.001-.005.001-.002.001-.002.001-.002.001-.002.001-.002.001a.5.5 0 01-.177.017H6.5a.5.5 0 01-.177-.017l-.002-.001-.002-.001-.002-.001-.005-.001-.004-.001-.001-.001z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11l3 3l3-3"></path></svg>
                        </button>
                        <button
                          onClick={() => { if (confirm('Are you sure you want to delete this document?')) deleteDocument(doc.id, user.uid).then(() => fetchDocuments(user.uid)); }}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50" disabled={aiLoading}
                          title="Delete Document"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {aiLoading && <p className="mt-4 text-center text-blue-600">AI is processing your request...</p>}
        {aiError && <p className="mt-4 text-center text-red-600">Error: {aiError}</p>}

        {showQnAInput && currentDocumentForAIAction && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <label htmlFor="qna-question" className="block text-sm font-medium text-gray-700 mb-2">Ask a question about {currentDocumentForAIAction.fileName}:</label>
            <input
              id="qna-question"
              type="text"
              value={qnaQuestion}
              onChange={(e) => setQnaQuestion(e.target.value)}
              placeholder="Type your question here..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-2"
            />
            <button
              onClick={() => performAIAction('qna', currentDocumentForAIAction, qnaQuestion)}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={aiLoading || !qnaQuestion}
            >
              Ask
            </button>
            <button
              onClick={() => setShowQnAInput(false)}
              className="ml-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        )}

        {Object.entries(aiResultsMap).map(([docId, results]) => (
          <div key={docId} className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800">AI Results for {documents.find(d => d.id === docId)?.fileName}</h3>
            {results.summary && (
              <div className="mt-2">
                <h4 className="text-md font-medium text-blue-700">Summary:</h4>
                <p className="text-sm text-blue-600 whitespace-pre-wrap">{results.summary}</p>
              </div>
            )}
            {results.mcqs && (
              <div className="mt-2">
                <h4 className="text-md font-medium text-blue-700">MCQs:</h4>
                <p className="text-sm text-blue-600 whitespace-pre-wrap">{results.mcqs}</p>
              </div>
            )}
            {results.qna && (
              <div className="mt-2">
                <h4 className="text-md font-medium text-blue-700">Q&A:</h4>
                <p className="text-sm text-blue-600 whitespace-pre-wrap">{results.qna}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      {showDocumentViewer && viewerDocument && (
        <DocumentViewer
          fileUrl={viewerDocument.downloadURL}
          aiSummary={aiResultsMap[viewerDocument.id]?.summary}
          aiMCQs={aiResultsMap[viewerDocument.id]?.mcqs}
          aiQnA={aiResultsMap[viewerDocument.id]?.qna}
          onClose={() => {
            setShowDocumentViewer(false);
            setViewerDocument(null);
          }}
        />
      )}
    </div>
  );
}

export default function PersonalBuddyPage() {
  return (
    <NextDynamic ssr={false} loading={() => <div>Loading Personal Buddy...</div>} component={PersonalBuddyContent} />
  );
}
