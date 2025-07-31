import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface RoleSpecificTasksProps {
  role: any;
  sessionId: string;
  onAnalysis: (task: string) => void;
  onComplete?: () => void;
  results?: any;
  hasData?: boolean; // Add this to check if data is available
}

export const RoleSpecificTasks: React.FC<RoleSpecificTasksProps> = ({
  role,
  sessionId,
  onAnalysis,
  onComplete,
  results,
  hasData = false
}) => {
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Reset completed tasks when there's no data
  useEffect(() => {
    if (!hasData) {
      setCompletedTasks([]);
      setActiveTask(null);
      setIsProcessing(false);
    }
  }, [hasData]);

  const roleTasksMap: Record<string, any[]> = {
    'business-analyst': [
      { id: 'kpi', name: 'KPI Dashboard', description: 'Generate key performance indicators', icon: '📊' },
      { id: 'customer_segmentation', name: 'Customer Segmentation', description: 'KMeans clustering analysis', icon: '👥' },
      { id: 'revenue_analysis', name: 'Revenue Analysis', description: 'Revenue metrics and trends', icon: '📈' },
      { id: 'performance_metrics', name: 'Performance Metrics', description: 'Business performance indicators', icon: '🚨' }
    ],
    'research-eda': [
      { id: 'correlation_matrix', name: 'Correlation Matrix', description: 'Variable correlation analysis', icon: '🔗' },
      { id: 'summary_stats', name: 'Summary Statistics', description: 'Descriptive statistics overview', icon: '📋' },
      { id: 'outliers', name: 'Outlier Detection', description: 'Identify and analyze outliers', icon: '⚠️' },
      { id: 'hypothesis_testing', name: 'Hypothesis Testing', description: 'Statistical significance tests', icon: '🧪' }
    ],
    'marketing': [
      { id: 'roi_analysis', name: 'ROI Analysis', description: 'Return on investment metrics', icon: '💰' },
      { id: 'rfm_analysis', name: 'RFM Analysis', description: 'Recency, Frequency, Monetary analysis', icon: '👥' },
      { id: 'engagement_funnel', name: 'Engagement Funnel', description: 'Customer engagement analysis', icon: '🔄' },
      { id: 'persona_clusters', name: 'Persona Clusters', description: 'Customer persona segmentation', icon: '🎯' }
    ],
    'finance': [
      { id: 'forecasting', name: 'Forecasting (Prophet)', description: 'Time series forecasting', icon: '🔮' },
      { id: 'risk_heatmap', name: 'Risk Heatmap', description: 'Financial risk visualization', icon: '🔥' },
      { id: 'roi_irr_npv', name: 'ROI/IRR/NPV', description: 'Investment analysis metrics', icon: '💰' },
      { id: 'volatility', name: 'Volatility Analysis', description: 'Price volatility assessment', icon: '📈' }
    ],
    'predictive-modeling': [
      { id: 'automl', name: 'AutoML Pipeline', description: 'Automated machine learning', icon: '🤖' },
      { id: 'regression_classification', name: 'Regression/Classification', description: 'ML model training', icon: '📊' },
      { id: 'model_evaluation', name: 'Model Evaluation', description: 'ROC, CM, AUC metrics', icon: '📈' },
      { id: 'drift_monitor', name: 'Drift Monitor', description: 'Model drift detection', icon: '🔍' }
    ],
    'healthcare': [
      { id: 'cohort_survival', name: 'Cohort Survival', description: 'Survival analysis by cohorts', icon: '❤️' },
      { id: 'prevalence_graph', name: 'Prevalence Graph', description: 'Disease prevalence visualization', icon: '📊' },
      { id: 'patient_clustering', name: 'Patient Clustering', description: 'Patient segmentation analysis', icon: '👥' },
      { id: 'hospital_stats', name: 'Hospital Statistics', description: 'Hospital performance metrics', icon: '🏥' }
    ],
    'ecommerce': [
      { id: 'market_basket', name: 'Market Basket Analysis', description: 'Product association rules', icon: '📦' },
      { id: 'trends', name: 'Sales Trends', description: 'Sales trend analysis', icon: '📈' },
      { id: 'order_funnel', name: 'Order Funnel', description: 'Purchase funnel analysis', icon: '🔄' },
      { id: 'inventory_forecast', name: 'Inventory Forecast', description: 'Inventory and price forecasting', icon: '📊' }
    ],
    'general': [
      { id: 'auto_eda', name: 'Auto EDA', description: 'Automated exploratory data analysis', icon: '🔍' },
      { id: 'correlation', name: 'Correlation Analysis', description: 'Variable correlation study', icon: '🔗' },
      { id: 'gpt_insights', name: 'GPT Insights', description: 'AI-powered data insights', icon: '🤖' },
      { id: 'auto_queries', name: 'Auto SQL Queries', description: 'Automated query generation', icon: '💾' }
    ]
  };

  const tasks = roleTasksMap[role.id] || roleTasksMap['general'];

  const handleRunTask = async (taskId: string) => {
    if (!hasData) {
      console.warn('Cannot run analysis without data');
      return;
    }
    
    setActiveTask(taskId);
    setIsProcessing(true);
    
    try {
      await onAnalysis(taskId);
      setCompletedTasks(prev => [...prev, taskId]);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getTaskStatus = (taskId: string) => {
    // Don't show as completed if there's no data
    if (!hasData) return 'pending';
    if (completedTasks.includes(taskId)) return 'completed';
    if (activeTask === taskId && isProcessing) return 'running';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'running': return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      default: return <Play className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-400 bg-green-500/10';
      case 'running': return 'border-blue-400 bg-blue-500/10 glow-blue';
      default: return 'border-white/20 hover:border-white/30';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Role-Specific Analysis Tasks</h3>
        
        {!hasData && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-200">
                <strong>No data available.</strong> Please upload and clean your data first before running analysis tasks.
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const status = getTaskStatus(task.id);
            
            return (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${getStatusColor(status)}`}
                onClick={() => handleRunTask(task.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{task.icon}</div>
                    <div>
                      <h4 className="font-medium text-white">{task.name}</h4>
                      <p className="text-sm text-gray-400">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    {status === 'pending' && (
                      <Button variant="outline" size="sm">
                        Run
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Continue to Insights Button */}
        {completedTasks.length > 0 && onComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex justify-center"
          >
            <Button
              onClick={onComplete}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <span>Continue to Insights</span>
              <span>→</span>
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
};