import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { apiService } from '../../utils/api';

interface QualityScore {
  score: number;
  grade: string;
  details: any;
}

interface QualityAssessment {
  overall_score: number;
  grade: string;
  quality_scores: {
    completeness: number;
    consistency: number;
    accuracy: number;
    uniqueness: number;
    validity: number;
    timeliness: number;
  };
  detailed_analysis: any;
  recommendations: Array<{
    category: string;
    priority: string;
    issue: string;
    recommendations: string[];
  }>;
  summary: string;
}

interface DataQualityAssessmentProps {
  roleId: string;
  sessionId: string | null;
  onAssessmentComplete?: (assessment: QualityAssessment) => void;
}

const QUALITY_METRICS = [
  { key: 'completeness', label: 'Completeness', icon: CheckCircle, description: 'Missing data and empty cells' },
  { key: 'consistency', label: 'Consistency', icon: Shield, description: 'Data format and value consistency' },
  { key: 'accuracy', label: 'Accuracy', icon: Target, description: 'Logical consistency and business rules' },
  { key: 'uniqueness', label: 'Uniqueness', icon: TrendingUp, description: 'Duplicate detection and unique values' },
  { key: 'validity', label: 'Validity', icon: AlertTriangle, description: 'Data format and constraint validation' },
  { key: 'timeliness', label: 'Timeliness', icon: Clock, description: 'Data freshness and update frequency' }
];

export const DataQualityAssessment: React.FC<DataQualityAssessmentProps> = ({
  roleId,
  sessionId,
  onAssessmentComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<QualityAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssessment = async () => {
    if (!sessionId) return;

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
      
      const result = await apiService.assessDataQuality(backendRole, sessionId);

      if (result.success) {
        setAssessment(result.quality_assessment);
        onAssessmentComplete?.(result.quality_assessment);
      } else {
        setError(result.error || 'Failed to assess data quality');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assessment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMetricIcon = (metricKey: string) => {
    const metric = QUALITY_METRICS.find(m => m.key === metricKey);
    return metric ? metric.icon : Shield;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Data Quality Assessment</h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          Evaluate your data quality across multiple dimensions and get actionable recommendations for improvement.
        </p>

        <Button
          onClick={handleAssessment}
          disabled={isLoading || !sessionId}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Assessing Data Quality...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Assess Data Quality
            </div>
          )}
        </Button>

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

      {/* Assessment Results */}
      {assessment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-8 h-8 text-blue-600" />
                <h4 className="text-2xl font-bold">Data Quality Score</h4>
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold text-blue-600">
                  {assessment.overall_score.toFixed(0)}
                </div>
                <div className="text-4xl font-bold text-gray-400">/100</div>
                <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getGradeColor(assessment.grade)}`}>
                  {assessment.grade}
                </div>
              </div>
              
              <p className="text-gray-600 mt-4">
                {assessment.summary}
              </p>
            </div>
          </Card>

          {/* Quality Metrics Breakdown */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Quality Metrics Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QUALITY_METRICS.map((metric) => {
                const Icon = metric.icon;
                const score = assessment.quality_scores[metric.key as keyof typeof assessment.quality_scores];
                
                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <h5 className="font-medium">{metric.label}</h5>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                        {score.toFixed(0)}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    
                    <p className="text-xs text-gray-600 mt-2">{metric.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </Card>

          {/* Recommendations */}
          {assessment.recommendations.length > 0 && (
            <Card className="p-6">
              <h4 className="text-lg font-semibold mb-4">Actionable Recommendations</h4>
              <div className="space-y-4">
                {assessment.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border rounded-lg ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="font-semibold">{rec.category}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority} Priority
                      </span>
                    </div>
                    
                    <p className="text-sm mb-3">{rec.issue}</p>
                    
                    <div className="space-y-2">
                      {rec.recommendations.map((recommendation, recIndex) => (
                        <div key={recIndex} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {/* Detailed Analysis */}
          <Card className="p-6">
            <h4 className="text-lg font-semibold mb-4">Detailed Analysis</h4>
            <div className="space-y-4">
              {Object.entries(assessment.detailed_analysis).map(([metric, details]: [string, any]) => {
                const Icon = getMetricIcon(metric);
                
                return (
                  <div key={metric} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <h5 className="font-medium capitalize">{metric}</h5>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {Object.entries(details).map(([key, value]: [string, any]) => {
                        if (typeof value === 'object' && value !== null) return null;
                        
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="font-medium">
                              {typeof value === 'number' ? value.toFixed(2) : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}; 