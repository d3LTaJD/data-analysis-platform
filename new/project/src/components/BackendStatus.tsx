import React, { useState, useEffect } from 'react';
import { apiService } from '../utils/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const BackendStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await apiService.healthCheck();
        if (response.error) {
          setStatus('disconnected');
          setMessage('Backend is not responding');
        } else {
          setStatus('connected');
          setMessage('Backend connected successfully');
        }
      } catch (error) {
        setStatus('disconnected');
        setMessage('Failed to connect to backend');
      }
    };

    checkBackendStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-400" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking connection...';
      case 'connected':
        return 'Backend Connected';
      case 'disconnected':
        return 'Backend Disconnected';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 z-50">
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm text-white">{getStatusText()}</span>
      </div>
      {message && (
        <p className="text-xs text-gray-300 mt-1">{message}</p>
      )}
    </div>
  );
}; 