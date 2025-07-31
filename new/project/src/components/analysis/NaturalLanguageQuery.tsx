import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Brain, TrendingUp, BarChart3, AlertTriangle, Lightbulb, Users, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { apiService } from '../../utils/api';

interface NLQResponse {
  success: boolean;
  query: string;
  answer: string;
  visualization?: string;
  data?: any;
  confidence: number;
  intent: string;
}

interface NaturalLanguageQueryProps {
  roleId: string;
  sessionId: string | null;
  onQueryComplete?: (response: NLQResponse) => void;
}

const SAMPLE_QUERIES = {
  'business-analyst': [
    "Show business performance metrics",
    "Analyze revenue trends",
    "Segment customers by demographics",
    "Compare operational efficiency",
    "Market competitive analysis"
  ],
  'financial': [
    "Forecast future revenue",
    "Analyze investment risk",
    "Calculate ROI metrics",
    "Correlation between variables",
    "Financial trend analysis"
  ],
  'marketing': [
    "Campaign performance comparison",
    "Marketing ROI analysis",
    "RFM customer segmentation",
    "Customer engagement patterns",
    "Conversion funnel analysis"
  ],
  'ecommerce': [
    "Identify best-selling products",
    "Calculate average order value",
    "Show sales trends by product category",
    "Analyze customer purchase patterns",
    "Compare conversion rates by page"
  ],
  'healthcare': [
    "Analyze patient outcomes",
    "Diagnosis distribution analysis",
    "Mortality rate trends",
    "Readmission rate analysis",
    "Healthcare cost analysis"
  ],
  'predictive-modeling': [
    "Predict future trends",
    "Machine learning model analysis",
    "Anomaly detection",
    "Classification analysis",
    "Regression prediction"
  ],
  'research-eda': [
    "Correlation analysis",
    "Statistical hypothesis testing",
    "Data distribution analysis",
    "Outlier detection",
    "Research variable relationships"
  ],
  'general': [
    "Show me a summary of the data",
    "What are the main trends?",
    "Identify any anomalies",
    "Show correlations between variables",
    "What insights can you find?"
  ]
};

export const NaturalLanguageQuery: React.FC<NaturalLanguageQueryProps> = ({
  roleId,
  sessionId,
  onQueryComplete
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<NLQResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<NLQResponse[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !sessionId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Map frontend role IDs to backend role names
      const roleMapping: { [key: string]: string } = {
        'business-analyst': 'business',
        'research-eda': 'research',
        'marketing': 'marketing',
        'financial': 'financial',
        'predictive-modeling': 'predictive',
        'healthcare': 'healthcare',
        'ecommerce': 'ecommerce',
        'general': 'general'
      };
      
      const backendRole = roleMapping[roleId] || roleId;
      
      const result = await apiService.naturalLanguageQuery(backendRole, {
        query: query.trim(),
        session_id: sessionId
      });

      console.log('Raw API Response:', result); // Add debugging

      // Handle new structured response format
      if (result.type === 'error') {
        setError(result.message || 'Failed to process query');
        return;
      }

      // Validate response structure
      if (!result || typeof result !== 'object') {
        setError('Invalid response format from server');
        return;
      }

      // Convert structured response to NLQResponse format
      const nlqResponse: NLQResponse = {
        success: true,
        query: query.trim(),
        answer: result.message || generateAnswerFromResult(result), // Use detailed message if available
        visualization: undefined, // No more images
        data: result.data || result.result,
        confidence: calculateConfidence(result),
        intent: result.type || 'analysis'
      };

      console.log('NLQ Response:', nlqResponse); // Add debugging

      setResponse(nlqResponse);
      setQueryHistory(prev => [nlqResponse, ...prev.slice(0, 4)]); // Keep last 5 queries
      onQueryComplete?.(nlqResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper method to generate answer from structured result
  const generateAnswerFromResult = (result: any): string => {
    if (result.message) {
      return result.message;
    }
    
    switch (result.type) {
      case 'summary':
        return 'Data summary analysis completed. Check the detailed statistics below.';
      case 'trend':
        return 'Trend analysis completed. Check the detailed trend information below.';
      case 'distribution':
        return 'Distribution analysis completed. Check the detailed distribution statistics below.';
      case 'comparison':
        return 'Comparison analysis completed. Check the detailed comparison results below.';
      case 'correlation':
        return 'Correlation analysis completed. Check the detailed correlation matrix below.';
      case 'outlier':
        return 'Outlier detection completed. Check the detailed outlier information below.';
      case 'percentage':
        return 'Percentage distribution analysis completed. Check the detailed breakdown below.';
      case 'clustering':
        return 'Clustering analysis completed. Check the detailed cluster information below.';
      case 'data_types':
        return 'Data types analysis completed. Check the detailed column information below.';
      case 'forecasting':
        return 'Forecasting analysis completed. Check the detailed forecast below.';
      default:
        return 'Analysis completed successfully.';
    }
  };

  // Helper method to calculate confidence based on result type
  const calculateConfidence = (result: any): number => {
    // Base confidence on the type of analysis and data quality
    const baseConfidence = 80;
    
    if (result.type === 'error') return 0;
    if (result.message && result.message.includes('No suitable columns')) return 30;
    if (result.message && result.message.includes('insufficient data')) return 40;
    
    return baseConfidence;
  };

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIntentIcon = (intent: string) => {
    switch (intent) {
      case 'trend':
        return <TrendingUp className="w-4 h-4" />;
      case 'comparison':
        return <BarChart3 className="w-4 h-4" />;
      case 'outlier':
        return <AlertTriangle className="w-4 h-4" />;
      case 'clustering':
        return <Users className="w-4 h-4" />;
      case 'data_types':
        return <Database className="w-4 h-4" />;
      case 'forecasting':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case 'trend':
        return 'Trend Analysis';
      case 'comparison':
        return 'Comparison';
      case 'summary':
        return 'Summary';
      case 'correlation':
        return 'Correlation';
      case 'outlier':
        return 'Outlier Detection';
      case 'distribution':
        return 'Distribution';
      case 'top_bottom':
        return 'Top/Bottom Analysis';
      case 'percentage':
        return 'Percentage Analysis';
      case 'clustering':
        return 'Clustering Analysis';
      case 'data_types':
        return 'Data Types Analysis';
      case 'forecasting':
        return 'Forecasting';
      default:
        return 'Analysis';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Natural Language Query</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Ask questions about your data in plain English. Get instant insights and visualizations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me revenue trends over time..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
              disabled={isLoading || !sessionId}
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim() || !sessionId}
              className="px-6"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Ask
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Sample Queries */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Try these sample queries:</h4>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUERIES[roleId as keyof typeof SAMPLE_QUERIES]?.map((sampleQuery, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuery(sampleQuery)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                disabled={isLoading || !sessionId}
              >
                {sampleQuery}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}
      </Card>

      {/* Response */}
      {response && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-semibold">Analysis Results</h4>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {getIntentIcon(response.intent)}
                <span className="text-gray-600">{getIntentLabel(response.intent)}</span>
                <span className={`font-medium ${getConfidenceColor(response.confidence)}`}>
                  {response.confidence.toFixed(0)}% confidence
                </span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Your question:</p>
              <p className="font-medium text-gray-800">"{response.query}"</p>
            </div>

            <div className="prose prose-sm max-w-none">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {response.answer}
                </pre>
              </div>
              
              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && response.data && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <strong>Debug - Response Type:</strong> {response.intent}<br/>
                  <strong>Debug - Has Data:</strong> {Object.keys(response.data || {}).length > 0 ? 'Yes' : 'No'}
                </div>
              )}
            </div>

            {response.visualization && (
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-700 mb-3">Visualization:</h5>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <img
                    src={response.visualization}
                    alt="Data visualization"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Recent Queries</h4>
          <div className="space-y-3">
            {queryHistory.map((histResponse, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setResponse(histResponse)}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    "{histResponse.query}"
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {getIntentIcon(histResponse.intent)}
                    <span className={`font-medium ${getConfidenceColor(histResponse.confidence)}`}>
                      {histResponse.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {histResponse.answer.length > 100 
                    ? histResponse.answer.substring(0, 100) + '...' 
                    : histResponse.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}; 