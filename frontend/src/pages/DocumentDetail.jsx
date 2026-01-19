import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../config/api';

const DocumentDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [citation, setCitation] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`/api/documents/${id}`);
      setDocument(response.data.data);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const response = await axios.post(`/api/ai/summarize/${id}`);
      setSummary(response.data.data.summary);
      toast.success('Document summarized!');
    } catch (error) {
      console.error('Error summarizing:', error);
      toast.error('Failed to generate summary');
    } finally {
      setSummarizing(false);
    }
  };

  const handleGenerateCitation = async (style) => {
    try {
      const response = await axios.post('/api/ai/citation', {
        documentId: id,
        style,
      });
      setCitation(response.data.data);
      toast.success('Citation generated!');
    } catch (error) {
      console.error('Error generating citation:', error);
      toast.error('Failed to generate citation');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Document not found.</p>
          <Link
            to="/documents"
            className="mt-4 inline-block text-primary-600 hover:text-primary-700"
          >
            ← Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/documents"
        className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
      >
        ← Back to Documents
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{document.title}</h1>

        <div className="mb-6 space-y-2">
          {document.author && (
            <p className="text-gray-700">
              <span className="font-semibold">Author:</span> {document.author}
            </p>
          )}
          {document.category && (
            <p className="text-gray-700">
              <span className="font-semibold">Category:</span> {document.category}
            </p>
          )}
          {document.tags && document.tags.length > 0 && (
            <div>
              <span className="font-semibold">Tags:</span>{' '}
              {document.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500">
            {document.viewCount || 0} views • Uploaded{' '}
            {new Date(document.createdAt).toLocaleDateString()}
          </p>
        </div>

        {document.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Description
            </h2>
            <p className="text-gray-700">{document.description}</p>
          </div>
        )}

        <div className="mb-6 flex gap-4">
          <a
            href={`${BACKEND_URL}${document.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium"
          >
            View PDF
          </a>
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {summarizing ? 'Summarizing...' : summary ? 'Re-summarize' : 'Generate Summary'}
          </button>
        </div>

        {summary && (
          <div className="mb-6 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Summary
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Generate Citation
          </h2>
          <div className="flex gap-2">
            {['APA', 'MLA', 'Chicago'].map((style) => (
              <button
                key={style}
                onClick={() => handleGenerateCitation(style)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {style}
              </button>
            ))}
          </div>
          {citation && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {citation.style} Citation:
              </p>
              <p className="text-gray-700">{citation.citation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;

