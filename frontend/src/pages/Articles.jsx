import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// AI Service URL - defaults to localhost in development
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [searchType, setSearchType] = useState('semantic'); // 'semantic' or 'keyword'
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    // If there's a search query and type is semantic, handle search separately
    if (searchQuery && searchType === 'semantic') {
      handleSearch(new Event('submit'));
    } else {
      fetchArticles();
    }
  }, [page, category, sortBy]); // Removed searchQuery to avoid double fetch on typing

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };

      if (searchQuery) params.search = searchQuery;
      if (category) params.category = category;

      const response = await axios.get('/api/documents/articles', { params });
      setArticles(response.data.data || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setLoading(true);

    try {
      if (searchQuery.trim()) {
        if (searchType === 'semantic') {
          // Use semantic search - Call Python AI Service
          try {
            const response = await axios.post(`${AI_SERVICE_URL}/api/ai/search`, {
              query: searchQuery,
              limit: 12
            });

            // Transform AI results to match article structure
            // The AI service returns { id, score, text, metadata }

            const mappedArticles = response.data.map(item => ({
              _id: item.id,
              title: item.metadata?.title || 'Untitled Document',
              description: item.text, // snippet
              score: item.score,
              category: item.metadata?.category || 'General',
              author: item.metadata?.author || 'Unknown'
            }));

            setArticles(mappedArticles);
            setPagination({ page: 1, limit: 12, total: mappedArticles.length, pages: 1 });

            if (mappedArticles.length === 0) {
              toast('No semantic matches found. Try keywords.', { icon: '🤖' });
            }
          } catch (aiError) {
            console.error("AI Service Error", aiError);
            toast.error("AI Service Unavailable. Switching to Keyword Search.");
            setSearchType('keyword');
            // Fallback
            const params = { page: 1, limit: 12, sort: sortBy, search: searchQuery };
            const response = await axios.get('/api/documents/articles', { params });
            setArticles(response.data.data || []);
            setPagination(response.data.pagination);
          }
        } else {
          // Use keyword search
          const params = {
            page: 1,
            limit: 12,
            sort: sortBy,
            search: searchQuery,
          };
          if (category) params.category = category;
          const response = await axios.get('/api/documents/articles', { params });
          setArticles(response.data.data || []);
          setPagination(response.data.pagination);
        }
      } else {
        // No search query, fetch all articles
        fetchArticles();
      }
      setSearchParams({ search: searchQuery, category, sort: sortBy, page: 1 });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newCategory) => {
    setCategory(newCategory);
    setPage(1);
    setSearchParams({ search: searchQuery, category: newCategory, sort: sortBy, page: 1 });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
    setSearchParams({ search: searchQuery, category, sort: newSort, page: 1 });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const categories = [
    'Computer Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Software Engineering',
    'Cybersecurity',
    'Networks',
    'Database',
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="bg-bg-secondary border-b border-border-primary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold font-inter tracking-tight">Articles</h1>
            <span className="badge">
              {pagination?.total || 0} Documents
            </span>
          </div>

          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={searchType === 'semantic' ? "Describe what you're looking for..." : "Search by keyword..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full pl-4 pr-32"
                />
                <div className="absolute right-2 top-2 bottom-2">
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="h-full bg-bg-tertiary border border-border-primary rounded text-xs px-2 focus:outline-none cursor-pointer text-text-muted hover:text-text-primary transition-colors"
                  >
                    <option value="semantic">✨ AI Semantic</option>
                    <option value="keyword">🔍 Keyword</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-muted">Category:</label>
              <select
                value={category}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="bg-bg-card border border-border-primary text-text-primary px-3 py-1 rounded-md text-sm focus:outline-none focus:border-text-primary"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-text-muted">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-bg-card border border-border-primary text-text-primary px-3 py-1 rounded-md text-sm focus:outline-none focus:border-text-primary"
              >
                <option value="recent">Most Recent</option>
                <option value="views">Most Viewed</option>
                <option value="downloads">Most Downloaded</option>
              </select>
            </div>

            {pagination && (
              <div className="ml-auto text-sm text-text-muted">
                Showing {((page - 1) * 12) + 1} - {Math.min(page * 12, pagination.total)} of {pagination.total} articles
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="space-y-4">
              {articles.map((article, index) => (
                <Link
                  key={article._id}
                  to={`/articles/${article._id}`}
                  className="block bg-bg-card border border-border-primary rounded-lg hover:border-text-primary transition-all duration-300 p-6 card-hover animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {article.score && (
                          <span className="ai-badge" title="AI Relevance Score">
                            {Math.round(article.score * 100)}% Match
                          </span>
                        )}
                        {article.category && (
                          <span className="badge-outline text-xs">
                            {article.category}
                          </span>
                        )}
                        {article.metadata?.doi && (
                          <span className="text-xs text-text-dim">DOI: {article.metadata.doi}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-text-primary mb-2">
                        {article.title}
                      </h3>
                      {article.author && (
                        <p className="text-sm text-text-muted mb-2">
                          {article.author}
                          {article.metadata?.publisher && ` • ${article.metadata.publisher}`}
                        </p>
                      )}
                      {article.description && (
                        <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                          {article.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {article.tags?.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs border border-border-secondary text-text-dim rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-text-dim border-t border-border-secondary pt-3 mt-3">
                        <span>
                          {article.metadata?.publicationDate
                            ? formatDate(article.metadata.publicationDate)
                            : formatDate(article.createdAt || new Date())}
                        </span>
                        <span>{article.viewCount || 0} views</span>
                      </div>
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
                  className="px-4 py-2 border border-border-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-hover text-text-primary"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm text-text-muted">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-border-primary rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-hover text-text-primary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-bg-card border border-border-primary rounded-lg p-12 text-center">
            <p className="text-text-muted text-lg">
              No articles found. {searchQuery && 'Try a different search query or switch search modes.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
