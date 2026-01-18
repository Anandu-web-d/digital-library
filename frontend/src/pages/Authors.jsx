import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('citationCount');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchAuthors();
  }, [page, sortBy, searchQuery]);

  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
        sort: sortBy,
      };

      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/authors', { params });
      setAuthors(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching authors:', error);
      toast.error('Failed to load authors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAuthors();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Authors</h1>

          {/* Search and Sort */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search authors by name, affiliation, or research interests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="citationCount">Most Citations</option>
              <option value="hIndex">Highest h-index</option>
              <option value="name">Name (A-Z)</option>
            </select>

            {pagination && (
              <div className="ml-auto text-sm text-gray-600">
                Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, pagination.total)} of {pagination.total} authors
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : authors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {authors.map((author) => (
                <Link
                  key={author._id}
                  to={`/authors/${author._id}`}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-blue-600">
                          {author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {author.name}
                      </h3>
                      {author.affiliation && (
                        <p className="text-sm text-gray-600 mb-3 truncate">
                          {author.affiliation}
                        </p>
                      )}
                      <div className="flex items-center gap-6 mb-3">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {author.citationCount || 0}
                          </div>
                          <div className="text-xs text-gray-500">Citations</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {author.hIndex || 0}
                          </div>
                          <div className="text-xs text-gray-500">h-index</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {author.publications?.length || 0}
                          </div>
                          <div className="text-xs text-gray-500">Publications</div>
                        </div>
                      </div>
                      {author.researchInterests?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-2 font-medium">Research Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {author.researchInterests.slice(0, 3).map((interest, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                              >
                                {interest}
                              </span>
                            ))}
                            {author.researchInterests.length > 3 && (
                              <span className="px-2 py-1 text-xs text-gray-500">
                                +{author.researchInterests.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              No authors found. {searchQuery && 'Try a different search query.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authors;

