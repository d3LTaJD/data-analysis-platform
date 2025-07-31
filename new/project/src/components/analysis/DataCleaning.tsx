import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Shuffle, Copy, RotateCcw, Filter, TrendingUp, Database, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DataCleaningProps {
  sessionId: string;
  role: string;
  onComplete: (cleanedData?: any[]) => void;
  preview?: any[];
  columns?: string[];
}

export const DataCleaning: React.FC<DataCleaningProps> = ({
  sessionId,
  role,
  onComplete,
  preview,
  columns
}) => {
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanedData, setCleanedData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>(preview || []);
  const [error, setError] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [showAiRecommendations, setShowAiRecommendations] = useState(false);
  const [fullData, setFullData] = useState<any[]>([]);
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Update originalData when preview changes
  React.useEffect(() => {
    console.log('DataCleaning: preview changed:', preview);
    console.log('DataCleaning: preview length:', preview?.length);
    if (preview && preview.length > 0) {
      setOriginalData([...preview]);
      console.log('DataCleaning: set originalData to:', preview.length, 'rows');
    }
  }, [preview]);

  console.log('DataCleaning render - sessionId:', sessionId, 'role:', role, 'preview length:', preview?.length, 'originalData length:', originalData.length);

  const cleaningActions = [
    {
      id: 'remove-nulls',
      name: 'Remove Nulls',
      description: 'Drop rows with missing values',
      icon: Trash2,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10'
    },
    {
      id: 'normalize',
      name: 'Normalize Data',
      description: 'Scale numerical columns to 0-1 range',
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'one-hot-encode',
      name: 'One-Hot Encode',
      description: 'Convert categorical variables to binary',
      icon: Copy,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'drop-duplicates',
      name: 'Drop Duplicates',
      description: 'Remove duplicate rows',
      icon: Filter,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'aggregate',
      name: 'Aggregate Data',
      description: 'Group by columns and summarize',
      icon: Database,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 'impute',
      name: 'Impute Missing',
      description: 'Fill missing values with mean/median',
      icon: RotateCcw,
              color: 'text-primary-400',
      bgColor: 'bg-indigo-500/10'
    },
    {
      id: 'feature-engineering',
      name: 'Feature Engineering',
      description: 'Create new features from existing data',
      icon: Shuffle,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10'
    },
    {
      id: 'data-validation',
      name: 'Data Validation',
      description: 'Validate data quality and consistency',
      icon: Filter,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    }
  ];

  const toggleAction = (actionId: string) => {
    setSelectedActions(prev =>
      prev.includes(actionId)
        ? prev.filter(id => id !== actionId)
        : [...prev, actionId]
    );
  };

  const handleApplySelected = async () => {
    setIsProcessing(true);
    setError(null);
    
    // Store original data for comparison
    if (preview && preview.length > 0) {
      setOriginalData([...preview]);
    }
    
    try {
      // Map frontend action IDs to backend operations
      const operationMap: { [key: string]: string } = {
        'remove-nulls': 'remove_nulls',
        'drop-duplicates': 'drop_duplicates',
        'impute': 'impute_missing',
        'normalize': 'normalize_data',
        'one-hot-encode': 'one_hot_encode',
        'aggregate': 'aggregate_data',
        'feature-engineering': 'feature_engineering',
        'data-validation': 'data_validation'
      };
      
      const operations = selectedActions.map(id => operationMap[id]).filter(Boolean);
      if (!operations.length) {
        setError('Please select at least one cleaning action.');
        setIsProcessing(false);
        return;
      }
      
      // Map frontend role IDs to backend role names
      const roleMapping: { [key: string]: string } = {
        'business-analyst': 'business',
        'research-eda': 'research',
        'marketing': 'marketing',
        'finance': 'financial',
        'predictive-modeling': 'predictive',
        'healthcare': 'healthcare',
        'ecommerce': 'ecommerce',
        'general': 'general'
      };
      
      const backendRole = roleMapping[role] || role;
      const response = await fetch(`http://localhost:5000/clean/${backendRole}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operations: operations,
          session_id: sessionId
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Cleaning failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      setCleanedData(result.preview || []);
      setValidationResults(result.validation_results || null);
      setAiRecommendations(result.ai_recommendations || []);
      // Automatically show AI recommendations if they are available
      if (result.ai_recommendations && result.ai_recommendations.length > 0) {
        setShowAiRecommendations(true);
      }
      
      // Check if data was significantly reduced
      const originalCount = originalData.length;
      const cleanedCount = result.rows || 0;
      if (cleanedCount < originalCount * 0.8) { // If more than 20% of data was removed
        setError(`Warning: Data cleaning removed ${originalCount - cleanedCount} rows (${((originalCount - cleanedCount) / originalCount * 100).toFixed(1)}% of data). Consider reviewing your cleaning operations.`);
      }
      
      setSelectedActions([]);
      // Removed auto-advance to next step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cleaning failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDataTable = (data: any[], title: string, highlightChanges: boolean = false) => {
    if (!data || data.length === 0) return null;
    
    const headers = Object.keys(data[0]);
    
    return (
      <div className="space-y-4">
        <h5 className="font-medium text-white">{title}</h5>
        <div className="overflow-x-auto border border-white/10 rounded-lg custom-scrollbar">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.slice(0, 5).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5">
                  {headers.map((header, colIdx) => {
                    const value = row[header];
                    const originalValue = originalData[idx]?.[header];
                    const hasChanged = highlightChanges && originalValue !== value;
                    
                    return (
                      <td
                        key={colIdx}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${
                          hasChanged ? 'bg-green-500/20 border border-green-500/30' : ''
                        }`}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
        >
          <p className="text-red-400">{error}</p>
        </motion.div>
      )}
      
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Clean & Transform Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cleaningActions.map((action) => {
            const Icon = action.icon;
            const isSelected = selectedActions.includes(action.id);
            
            return (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 flex items-center space-x-3 ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-500/10 glow-blue'
                    : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                }`}
                onClick={() => toggleAction(action.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAction(action.id)}
                  className="accent-indigo-500 mr-3"
                  onClick={e => e.stopPropagation()}
                />
                <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${action.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{action.name}</h4>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button
            variant="secondary"
            onClick={handleApplySelected}
            loading={isProcessing}
            disabled={isProcessing || selectedActions.length === 0}
          >
            Apply Selected
          </Button>
        </div>
      </Card>

      {/* Data Preview Section */}
      {(preview && preview.length > 0) || (cleanedData && cleanedData.length > 0) ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-white">Data Preview</h4>
              <div className="flex items-center space-x-3">
                {validationResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowValidation(!showValidation)}
                  >
                    {showValidation ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showValidation ? 'Hide' : 'Show'} Validation Results
                  </Button>
                )}
                {aiRecommendations && aiRecommendations.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAiRecommendations(!showAiRecommendations)}
                  >
                    🤖 {showAiRecommendations ? 'Hide' : 'Show'} AI Recommendations
                  </Button>
                )}
                {cleanedData && cleanedData.length > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComparison(!showComparison)}
                    >
                      {showComparison ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showComparison ? 'Hide' : 'Show'} Comparison
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Data Row Count Information */}
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-300">Original Data:</span>
                <span className="text-white font-medium">{originalData.length} rows</span>
                <span className="text-blue-300">Current Data:</span>
                <span className="text-white font-medium">{preview?.length || 0} rows</span>
                {cleanedData && cleanedData.length > 0 && (
                  <>
                    <span className="text-blue-300">Cleaned Data:</span>
                    <span className="text-white font-medium">{cleanedData.length} rows</span>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:5000/full-preview/${role}?session_id=${sessionId}`);
                      const data = await response.json();
                      console.log('Full dataset:', data);
                      if (data.error) {
                        alert(`Error: ${data.error}`);
                      } else {
                        // Show full dataset in a modal
                        setFullData(data.data || []);
                        setShowFullPreview(true);
                      }
                    } catch (error) {
                      console.error('Error fetching full dataset:', error);
                      alert('Error fetching full dataset. Please try again.');
                    }
                  }}
                >
                  View Full Dataset
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* AI Recommendations - Show automatically when available */}
              {aiRecommendations && aiRecommendations.length > 0 && showAiRecommendations && (
                <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-lg p-4">
                  <h5 className="font-medium text-purple-300 mb-3 flex items-center">
                    <span className="text-2xl mr-2">🤖</span>
                    AI Data Quality Recommendations
                  </h5>
                  <div className="space-y-3">
                    {aiRecommendations.map((recommendation, idx) => (
                      <div key={idx} className="bg-white/10 p-3 rounded-lg border border-purple-500/20 backdrop-blur-sm">
                        <div className="flex items-start space-x-2">
                          <span className="text-purple-400 text-lg">💡</span>
                          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Validation Results */}
              {showValidation && validationResults && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h5 className="font-medium text-blue-300 mb-3">Data Validation Results</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-gray-300">Total Rows</div>
                      <div className="text-white font-medium">{validationResults.total_rows}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-gray-300">Total Columns</div>
                      <div className="text-white font-medium">{validationResults.total_columns}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded">
                      <div className="text-gray-300">Duplicate Rows</div>
                      <div className="text-white font-medium">{validationResults.duplicates}</div>
                    </div>
                  </div>
                  
                  {/* Missing Values */}
                  {validationResults.missing_values && Object.keys(validationResults.missing_values).length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-blue-300 font-medium mb-2">Missing Values by Column:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(validationResults.missing_values).map(([col, data]: [string, any]) => (
                          <div key={col} className="bg-white/5 p-2 rounded text-sm">
                            <span className="text-gray-300">{col}:</span>
                            <span className="text-white ml-2">{data.count} ({data.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Outliers */}
                  {validationResults.outliers && Object.keys(validationResults.outliers).length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-blue-300 font-medium mb-2">Outliers by Column:</h6>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {Object.entries(validationResults.outliers).map(([col, data]: [string, any]) => (
                          <div key={col} className="bg-white/5 p-2 rounded text-sm">
                            <span className="text-gray-300">{col}:</span>
                            <span className="text-white ml-2">{data.count} ({data.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Inconsistencies */}
                  {validationResults.inconsistencies && validationResults.inconsistencies.length > 0 && (
                    <div className="mt-4">
                      <h6 className="text-blue-300 font-medium mb-2">Data Inconsistencies:</h6>
                      <div className="space-y-1">
                        {validationResults.inconsistencies.map((issue: string, idx: number) => (
                          <div key={idx} className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded text-sm text-yellow-300">
                            ⚠️ {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}


              
              {/* Original Data */}
              {showComparison && originalData && originalData.length > 0 && (
                renderDataTable(originalData, "Original Data (Before Cleaning)")
              )}
              
              {/* Current/Original Data */}
              {!showComparison && preview && preview.length > 0 && (
                renderDataTable(preview, "Current Data")
              )}
              
              {/* Cleaned Data */}
              {cleanedData && cleanedData.length > 0 && (
                renderDataTable(cleanedData, "Cleaned Data (After)", showComparison)
              )}
            </div>

            {/* Continue Button */}
            {cleanedData && cleanedData.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button variant="secondary" onClick={() => onComplete(cleanedData)}>
                  Continue
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      ) : null}

      {/* Full Dataset Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Full Dataset Preview</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  Showing {fullData.length} rows of data
                </span>
                <Button variant="secondary" onClick={() => setShowFullPreview(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto border border-white/10 rounded-lg custom-scrollbar">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    {Object.keys(fullData[0] || {}).map((header, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-white/5"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {fullData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      {Object.keys(row).map((header, colIdx) => {
                        const value = row[header];
                        const originalValue = originalData[idx]?.[header];
                        const hasChanged = originalValue !== value;
                        
                        return (
                          <td
                            key={colIdx}
                            className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${
                              hasChanged ? 'bg-green-500/20 border border-green-500/30' : ''
                            }`}
                          >
                            {value !== null && value !== undefined ? value : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};