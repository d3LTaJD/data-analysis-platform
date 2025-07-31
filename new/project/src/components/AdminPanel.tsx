import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, Trash2 } from 'lucide-react';

interface ErrorLog {
  timestamp: string;
  error_type: string;
  error_message: string;
  user_id: string | null;
  endpoint: string;
  method: string;
  stack_trace: string;
}

interface AdminPanelProps {
  onClose: () => void;
  token: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, token }) => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorSummary, setErrorSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'errors' | 'summary'>('errors');

  useEffect(() => {
    fetchErrorLogs();
    fetchErrorSummary();
  }, []);

  const fetchErrorLogs = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/errors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setErrorLogs(data.errors || []);
      }
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    }
  };

  const fetchErrorSummary = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/errors/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setErrorSummary(data);
      }
    } catch (error) {
      console.error('Failed to fetch error summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/admin/cleanup-sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to cleanup sessions:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl h-5/6 mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-gray-700">
            <div className="p-4">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('errors')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'errors' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Error Logs</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'summary' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4" />
                    <span>Error Summary</span>
                  </div>
                </button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                  onClick={cleanupSessions}
                  className="w-full flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Cleanup Sessions</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'errors' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Error Logs</h3>
                <div className="space-y-4">
                  {errorLogs.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">No errors found</div>
                  ) : (
                    errorLogs.map((error, index) => (
                      <div key={index} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-400 font-medium">{error.error_type}</span>
                            <span className="text-gray-400 text-sm">{error.method} {error.endpoint}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{formatTimestamp(error.timestamp)}</span>
                        </div>
                        <div className="text-white mb-2">{error.error_message}</div>
                        {error.user_id && (
                          <div className="text-gray-400 text-sm mb-2">User ID: {error.user_id}</div>
                        )}
                        <details className="text-gray-400 text-sm">
                          <summary className="cursor-pointer hover:text-white">Stack Trace</summary>
                          <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                            {error.stack_trace}
                          </pre>
                        </details>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Error Summary</h3>
                {errorSummary && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{errorSummary.total_errors}</div>
                        <div className="text-gray-400">Total Errors</div>
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{Object.keys(errorSummary.error_types || {}).length}</div>
                        <div className="text-gray-400">Error Types</div>
                      </div>
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <div className="text-2xl font-bold text-white">{errorSummary.recent_errors?.length || 0}</div>
                        <div className="text-gray-400">Recent Errors</div>
                      </div>
                    </div>

                    {errorSummary.error_types && (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Error Types</h4>
                        <div className="space-y-2">
                          {Object.entries(errorSummary.error_types).map(([type, count]) => (
                            <div key={type} className="flex justify-between items-center">
                              <span className="text-gray-300">{type}</span>
                              <span className="text-white font-medium">{count as number}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {errorSummary.recent_errors && errorSummary.recent_errors.length > 0 && (
                      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-white mb-3">Recent Errors</h4>
                        <div className="space-y-2">
                          {errorSummary.recent_errors.map((error: ErrorLog, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-red-400">{error.error_type}</span>
                                <span className="text-gray-400">{formatTimestamp(error.timestamp)}</span>
                              </div>
                              <div className="text-gray-300">{error.error_message}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 