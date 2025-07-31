import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  FileText, 
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';

interface BusinessAnalysisResult {
  success: boolean;
  analysis_name: string;
  cleaning_report: any;
  kpis: Record<string, number>;
  insights: string[];
  recommendations: string[];
  chart_count: number;
  analysis_id: number;
}

interface AnalysisHistory {
  id: number;
  analysis_name: string;
  status: string;
  created_at: string;
}

const BusinessAnalyst: React.FC = () => {
  const { sessionToken, isAuthenticated, login } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<BusinessAnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'results' | 'history'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load analysis history when authenticated
  useEffect(() => {
    if (isAuthenticated && sessionToken) {
      loadAnalysisHistory();
    }
  }, [isAuthenticated, sessionToken]);



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a CSV or Excel file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (!isAuthenticated || !sessionToken) {
      setError('Please login to use this feature. You can login from the main dashboard.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const result = await apiService.businessAnalysisUpload(sessionToken, selectedFile);
      setAnalysisResult(result);
      setActiveTab('results');
      
      // Refresh analysis history
      loadAnalysisHistory();
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsUploading(false);
    }
  };



  const loadAnalysisHistory = async () => {
    if (!sessionToken) return;

    try {
      const result = await apiService.getBusinessAnalyses(sessionToken);
      setAnalysisHistory(result.analyses || []);
    } catch (err: any) {
      console.error('Failed to load analysis history:', err);
      // Don't show error to user if it's just an authentication issue
      if (err.message && err.message.includes('Invalid session token')) {
        // This will be handled by the authentication check above
        return;
      }
    }
  };

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analyst</h1>
              <p className="text-gray-600 mt-1">KPIs, performance metrics, and business intelligence</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'upload'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Data
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Analysis History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        {activeTab === 'upload' && (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="text-center">
              <Upload className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Business Data</h2>
              <p className="text-gray-600 mb-8">
                Upload your CSV or Excel file containing business data for comprehensive analysis
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Supports CSV, Excel files up to 10MB
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <XCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`px-8 py-3 rounded-lg font-medium ${
                  !selectedFile || isUploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 inline mr-2" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results Section */}
        {activeTab === 'results' && analysisResult && (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Analysis Results</h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Completed
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-blue-600 font-medium">KPIs Calculated</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {Object.keys(analysisResult.kpis).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-green-600 font-medium">Insights Generated</p>
                      <p className="text-2xl font-bold text-green-900">
                        {analysisResult.insights.length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Charts Created</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {analysisResult.chart_count}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Recommendations</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {analysisResult.recommendations.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* KPI Dashboard */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Key Performance Indicators
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analysisResult.kpis).map(([kpi, value]) => (
                      <div key={kpi} className="flex justify-between items-center p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">
                          {kpi.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        <span className="font-bold text-blue-600">
                          {typeof value === 'number' ? formatNumber(value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insights */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Business Insights
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.insights.map((insight, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {analysisResult.recommendations.length > 0 && (
                <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Recommendations
                  </h3>
                  <div className="space-y-2">
                    {analysisResult.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <p className="text-sm text-gray-700">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Section */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">Analysis History</h2>
              <p className="text-gray-600 mt-1">View your previous business analyses</p>
            </div>
            
            <div className="p-6">
              {analysisHistory.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No analyses found. Upload your first dataset to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analysisHistory.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(analysis.status)}`}>
                          {getStatusIcon(analysis.status)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{analysis.analysis_name}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(analysis.status)}`}>
                          {analysis.status}
                        </span>
                        <button className="text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default BusinessAnalyst; 