import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('semantic'); // 'semantic' or 'keyword'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }

    setLoading(true);
    try {
      if (searchType === 'semantic') {
        const response = await axios.post('/api/documents/search', {
          query: searchQuery,
        });
        setDocuments(response.data.data || []);
        if (response.data.fallback) {
          toast('Using keyword search fallback', { icon: 'ℹ️' });
        }
      } else {
        const response = await axios.get('/api/documents', {
          params: { search: searchQuery },
        });
        setDocuments(response.data.data || []);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Document Library
        </h1>

        <form onSubmit={handleSearch} className="flex gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search documents semantically..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="semantic">Semantic Search</option>
            <option value="keyword">Keyword Search</option>
          </select>
          <button
            type="submit"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Link
              key={doc._id}
              to={`/documents/${doc._id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {doc.title}
              </h3>
              {doc.author && (
                <p className="text-sm text-gray-600 mb-2">By {doc.author}</p>
              )}
              {doc.description && (
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                  {doc.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mb-2">
                {doc.category && (
                  <span className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                    {doc.category}
                  </span>
                )}
                {doc.tags?.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {doc.viewCount || 0} views
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 text-lg">
            No documents found. {searchQuery && 'Try a different search query.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;

