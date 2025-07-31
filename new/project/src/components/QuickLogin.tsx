import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const QuickLogin: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('admin@datawhiz.com');
  const [password, setPassword] = useState('admin123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (!success) {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <span className="text-green-800 font-medium">
              Logged in as: {user?.username || user?.email}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-blue-900 font-medium mb-2">Quick Login for Testing</h3>
      <p className="text-blue-700 text-sm mb-3">
        Use the default admin credentials to test the Business Analyst feature:
      </p>
      
      <div className="space-y-2 mb-3">
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-blue-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm mb-3">{error}</div>
      )}
      
      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isLoggingIn ? 'Logging in...' : 'Login'}
      </button>
    </div>
  );
};

export default QuickLogin; 