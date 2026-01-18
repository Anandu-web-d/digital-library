import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/documents/recommendations');
      setRecommendations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-bg-card border border-border-primary flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-text-muted">
                Discover intelligent academic resources powered by AI
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link to="/articles" className="ai-feature-card animate-slide-up stagger-1 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="ai-badge">AI</span>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Smart Search
              </h3>
            </div>
            <p className="text-text-muted text-sm mb-4">
              Find documents using semantic understanding, not just keywords
            </p>
            <span className="text-accent-primary font-semibold text-sm">
              Explore →
            </span>
          </Link>

          <Link to="/ai-chat" className="ai-feature-card animate-slide-up stagger-2 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="ai-badge">AI</span>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                AI Assistant
              </h3>
            </div>
            <p className="text-text-muted text-sm mb-4">
              Get instant help with your research questions
            </p>
            <span className="text-accent-primary font-semibold text-sm">
              Chat Now →
            </span>
          </Link>

          <Link to="/ai-dashboard" className="ai-feature-card animate-slide-up stagger-3 group">
            <div className="flex items-center gap-2 mb-3">
              <span className="ai-badge">New</span>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                AI Features Hub
              </h3>
            </div>
            <p className="text-text-muted text-sm mb-4">
              Access all AI tools: summarization, citations, and more
            </p>
            <span className="text-accent-primary font-semibold text-sm">
              View Hub →
            </span>
          </Link>
        </div>

        {/* Recommendations Section */}
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-end mb-6 border-b border-border-primary pb-4">
            <h2 className="section-title mb-0">Recommended for You</h2>
            <Link to="/articles" className="text-text-muted hover:text-text-primary transition-colors font-medium text-sm">
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner h-10 w-10"></div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/documents/${doc._id}`}
                  className="card-hover rounded-lg p-6"
                >
                  <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                    {doc.title}
                  </h3>
                  {doc.author && (
                    <p className="text-sm text-text-muted mb-2">By {doc.author}</p>
                  )}
                  {doc.description && (
                    <p className="text-sm text-text-dim line-clamp-2 mb-4">
                      {doc.description}
                    </p>
                  )}
                  {doc.category && (
                    <span className="badge-outline text-xs">
                      {doc.category}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-bg-card border border-border-primary rounded-lg p-8 text-center">
              <p className="text-text-muted mb-4">No recommendations available yet.</p>
              <p className="text-text-dim text-sm mb-6">
                Start exploring documents to get personalized recommendations.
              </p>
              <Link
                to="/articles"
                className="btn-primary"
              >
                Browse Articles
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
