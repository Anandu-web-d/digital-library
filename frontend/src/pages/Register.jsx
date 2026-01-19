import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    );
    if (result.success) {
      // Redirect to email verification if required
      if (result.requiresVerification) {
        navigate('/verify-email', { state: { email: result.email } });
      } else {
        navigate('/dashboard');
      }
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
            Create your account
          </h2>
          <p className="mt-2 text-text-muted">
            Join IntelliLib today
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-bg-card border-2 border-border-primary rounded-lg p-8 shadow-dark">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field w-full"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
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
                autoComplete="new-password"
                required
                className="input-field w-full"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-2">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="input-field w-full cursor-pointer"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="researcher">Researcher</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-text-dim">
                Select your primary role in the academic community
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-primary w-full text-lg"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-text-muted">Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-accent-primary hover:text-accent-hover transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
