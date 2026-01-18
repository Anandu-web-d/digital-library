import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'border-accent-primary text-primary'
      : 'border-transparent text-muted hover:text-primary hover:border-border-accent';
  };

  const activeMobile = (path) => {
    return location.pathname === path
      ? 'bg-bg-hover border-accent-primary text-primary'
      : 'border-transparent text-muted hover:bg-bg-hover hover:border-border-accent hover:text-primary';
  };

  if (loading) return null;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md shadow-dark" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', borderBottom: '1px solid var(--border-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center group">
              <span className="text-2xl font-bold tracking-tight text-primary transition-transform duration-300 group-hover:scale-105" style={{ fontFamily: 'Inter, sans-serif' }}>
                IntelliLib
              </span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/')}`}
              >
                Home
              </Link>
              <Link
                to="/articles"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/articles')}`}
              >
                Articles
              </Link>
              <Link
                to="/ai-chat"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/ai-chat')}`}
              >
                <span className="mr-2">AI Assistant</span>
                <span className="ai-badge">New</span>
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/dashboard')}`}
                >
                  Dashboard
                </Link>
              )}
              {user && (
                <Link
                  to="/ai-dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-300 ${isActive('/ai-dashboard')}`}
                >
                  <span className="mr-2">AI Hub</span>
                  <span className="ai-badge">Full</span>
                </Link>
              )}
            </div>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link to="/admin/approval" className="relative group p-2">
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-accent-primary animate-pulse"></span>
                    <span className="text-muted hover:text-primary transition-colors text-sm font-medium">Admin</span>
                  </Link>
                )}
                {(user.role === 'admin' || user.role === 'researcher') && (
                  <Link to="/upload" className="relative group p-2">
                    <span className="text-muted hover:text-primary transition-colors text-sm font-medium">Upload</span>
                  </Link>
                )}

                <div className="flex items-center gap-3 pl-4 border-l border-border-primary">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-primary">{user.name}</p>
                    <p className="text-xs text-muted capitalize">{user.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded bg-bg-tertiary border border-border-primary flex items-center justify-center text-primary font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 text-sm text-muted hover:text-primary transition-colors hover:underline"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-primary hover:text-muted font-medium px-3 py-2 transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted hover:text-primary hover:bg-bg-hover focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-bg-card border-b border-border-primary animate-slide-down">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${activeMobile('/')}`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/articles"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${activeMobile('/articles')}`}
              onClick={() => setIsOpen(false)}
            >
              Articles
            </Link>
            <Link
              to="/ai-chat"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${activeMobile('/ai-chat')}`}
              onClick={() => setIsOpen(false)}
            >
              AI Assistant
            </Link>
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-muted hover:bg-bg-hover hover:border-border-accent hover:text-primary text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-muted hover:bg-bg-hover hover:border-border-accent hover:text-primary text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
