import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [topAuthors, setTopAuthors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [articlesRes, authorsRes] = await Promise.all([
        axios.get('/api/documents/articles?limit=6'),
        axios.get('/api/authors/top?limit=6'),
      ]);

      const articles = articlesRes.data.data || [];
      setFeaturedArticles(articles.slice(0, 3));
      setRecentArticles(articles.slice(3, 6));
      setTopAuthors(authorsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/articles?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border-primary bg-bg-secondary">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="inline-block mb-4 animate-slide-down">
              <span className="badge">Digital Library v2.0</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight animate-slide-up font-inter">
              INTELLI<span className="text-text-muted">LIB</span>
            </h1>
            <p className="text-2xl mb-12 animate-slide-up font-light text-text-secondary max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
              Advanced semantic search and AI-powered research assistance for the modern scholar.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search by keyword, author, or concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field flex-1 text-lg shadow-dark"
                />
                <button
                  type="submit"
                  className="btn-primary text-lg px-8 shadow-dark"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner h-12 w-12"></div>
          </div>
        ) : (
          <>
            {/* Feature Cards AI Promo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              <div className="ai-feature-card animate-fade-in stagger-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="ai-badge">AI Powered</span>
                  <h3 className="font-bold text-lg">Semantic Search</h3>
                </div>
                <p className="text-text-muted text-sm">Understand research context beyond simple keywords using vector embeddings.</p>
              </div>
              <div className="ai-feature-card animate-fade-in stagger-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="ai-badge">AI Powered</span>
                  <h3 className="font-bold text-lg">Research Assistant</h3>
                </div>
                <p className="text-text-muted text-sm">Interactive chat bot to answer questions and summarize papers instantly.</p>
              </div>
              <div className="ai-feature-card animate-fade-in stagger-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="ai-badge">AI Powered</span>
                  <h3 className="font-bold text-lg">Smart Analytics</h3>
                </div>
                <p className="text-text-muted text-sm">Track citations, reading patterns, and research impact trends.</p>
              </div>
            </div>

            {/* Featured Articles */}
            <section className="mb-20 animate-fade-in">
              <div className="flex justify-between items-end mb-8 border-b border-border-primary pb-4">
                <h2 className="section-title mb-0">Featured Articles</h2>
                <Link
                  to="/articles"
                  className="font-semibold text-text-muted hover:text-text-primary transition-colors mb-1"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredArticles.map((article, index) => (
                  <Link
                    key={article._id}
                    to={`/articles/${article._id}`}
                    className={`card-hover p-6 rounded-lg animate-slide-up stagger-${index + 1}`}
                  >
                    <div className="mb-4">
                      {article.category && (
                        <span className="badge-outline text-xs">
                          {article.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3 line-clamp-2" style={{ fontFamily: 'IBM Plex Serif, serif' }}>
                      {article.title}
                    </h3>
                    {article.author && (
                      <p className="text-sm mb-3 font-medium text-text-muted">By {article.author}</p>
                    )}
                    {article.description && (
                      <p className="text-sm text-text-dim line-clamp-3 mb-5">
                        {article.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-4 border-t border-border-secondary text-text-muted">
                      <span>
                        {article.metadata?.publicationDate
                          ? formatDate(article.metadata.publicationDate)
                          : formatDate(article.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        Viewed {article.viewCount || 0} times
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent Articles */}
            <section className="mb-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex justify-between items-end mb-8 border-b border-border-primary pb-4">
                <h2 className="section-title mb-0">Recent Publications</h2>
                <Link
                  to="/articles"
                  className="font-semibold text-text-muted hover:text-text-primary transition-colors mb-1"
                >
                  View All →
                </Link>
              </div>
              <div className="border border-border-primary rounded-lg divide-y divide-border-primary bg-bg-card">
                {recentArticles.map((article, index) => (
                  <Link
                    key={article._id}
                    to={`/articles/${article._id}`}
                    className="block p-6 hover:bg-bg-hover transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-text-secondary transition-colors">
                          {article.title}
                        </h3>
                        {article.author && (
                          <p className="text-sm text-text-muted mb-2">
                            {article.author}
                            {article.metadata?.publisher && ` • ${article.metadata.publisher}`}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {article.tags?.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs border border-border-secondary rounded text-text-dim"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-8 text-right text-sm text-text-dim">
                        <div>
                          {article.metadata?.publicationDate
                            ? formatDate(article.metadata.publicationDate)
                            : formatDate(article.createdAt)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Top Authors */}
            <section className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex justify-between items-end mb-8 border-b border-border-primary pb-4">
                <h2 className="section-title mb-0">Top Authors</h2>
                <Link
                  to="/authors"
                  className="font-semibold text-text-muted hover:text-text-primary transition-colors mb-1"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topAuthors.map((author, index) => (
                  <Link
                    key={author._id}
                    to={`/authors/${author._id}`}
                    className={`card-hover p-6 rounded-lg flex items-center gap-4 animate-scale-in stagger-${index + 1}`}
                  >
                    <div className="w-16 h-16 rounded-full bg-bg-tertiary border border-border-primary flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {author.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate mb-1">
                        {author.name}
                      </h3>
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-2 truncate">
                        {author.affiliation || "Independent Researcher"}
                      </p>
                      <div className="flex gap-4 text-xs">
                        <span className="px-2 py-1 bg-bg-tertiary rounded">
                          <b>{author.citationCount || 0}</b> Citations
                        </span>
                        <span className="px-2 py-1 bg-bg-tertiary rounded">
                          <b>{author.hIndex || 0}</b> H-Index
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
