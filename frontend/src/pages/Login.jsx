import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight text-text-primary mb-2">
            INTELLI<span className="text-text-muted">LIB</span>
          </h1>
          <h2 className="text-2xl font-bold text-text-primary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-text-muted">
            AI-Powered Digital Library
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-bg-card border-2 border-border-primary rounded-lg p-8 shadow-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field w-full"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full text-lg"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <span className="text-text-muted">Don't have an account? </span>
          <Link
            to="/register"
            className="font-semibold text-accent-primary hover:text-accent-hover transition-colors"
          >
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
