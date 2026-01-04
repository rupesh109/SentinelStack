import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await onLogin(username, password);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <Shield size={48} className="brand-icon" />
          <h1>SentinelStack</h1>
          <p>Enterprise DevSecOps Platform</p>
        </div>

        <div className="login-card">
          <h2>Sign In</h2>
          <p className="login-subtitle">Access your dashboard</p>

          {error && (
            <div className="error-alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <Mail size={18} />
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label>
                <Lock size={18} />
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-demo">
            <p><strong>Demo Credentials:</strong></p>
            <p>Username: <code>admin</code></p>
            <p>Password: <code>admin123</code></p>
          </div>

          <div className="login-footer">
            <Link to="/">← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
