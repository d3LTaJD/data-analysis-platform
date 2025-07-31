import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, BarChart3, Brain, Download, Eye, DollarSign, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { FileUpload } from '../components/analysis/FileUpload';
import { DataCleaning } from '../components/analysis/DataCleaning';
import { ChartVisualization } from '../components/analysis/ChartVisualization';
import { AIInsights } from '../components/analysis/AIInsights';
import { RoleSpecificTasks } from '../components/analysis/RoleSpecificTasks';
import { DownloadSection } from '../components/analysis/DownloadSection';
import BusinessAnalyst from '../components/BusinessAnalyst';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { apiService } from '../utils/api';
import { roles } from '../data/roles';
import html2canvas from 'html2canvas';
import ParticleBackground from '../components/ParticleBackground';

export const RoleAnalysis: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<Array<{
    question: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [isProcessingInsight, setIsProcessingInsight] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visualizationKey, setVisualizationKey] = useState(0);
  // Remove lastDownloadedChart state
  const [alertValue, setAlertValue] = useState<string>('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');
  const [showAlertSet, setShowAlertSet] = useState(false);


  const role = roles.find(r => r.id === roleId);

  useEffect(() => {
    console.log('RoleAnalysis: roleId =', roleId);
    console.log('RoleAnalysis: available roles =', roles.map(r => r.id));
    console.log('RoleAnalysis: found role =', role);
  }, [role, roleId]);

  const handleFileUpload = async (file: File) => {
    if (!role) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Uploading file:', file.name, 'for role:', role.id);
      
      let response;
      // For Business Analyst role, use the business analysis upload
      if (role.id === 'business_analyst') {
        const businessResponse = await apiService.businessAnalysisUpload('demo-session-token', file);
        // Transform response to match expected format
        response = {
          session_id: businessResponse.analysis_id?.toString() || 'demo-session',
          data_info: { column_names: [] },
          columns: [],
          preview: [],
          error: businessResponse.success ? null : businessResponse.error
        };
      } else {
        // For other roles, use the regular upload (placeholder for now)
        response = {
          session_id: 'demo-session',
          data_info: { column_names: [] },
          columns: [],
          preview: [],
          error: null
        };
      }
      
      console.log('Upload response:', response);
      
      setUploadedFile(file);
      setSessionId(response.session_id);
      setColumns(response.data_info?.column_names || response.columns || []);
      setPreview(response.preview || []);
      
      console.log('Set session ID:', response.session_id);
      console.log('Set columns:', response.data_info?.column_names || response.columns || []);
      console.log('Set preview:', response.preview || []);
      
      // Check if upload was successful
      if (response.error) {
        throw new Error(response.error);
      }
      
      setCurrentStep(2);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Load preview data when DataCleaning component mounts
  React.useEffect(() => {
    if (currentStep === 2 && sessionId && role && (!preview || preview.length === 0)) {
      handlePreview();
    }
  }, [currentStep, sessionId, role]);

  const handlePreview = async () => {
    if (!sessionId || !role) return;
    
    try {
      console.log('Loading preview for session:', sessionId, 'role:', role.id);
      const response = await apiService.previewData(role.id, sessionId);
      console.log('Preview response:', response);
      
      setPreview(response.preview);
      setColumns(response.columns);
      
      console.log('Set preview from API:', response.preview);
      console.log('Set columns from API:', response.columns);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Preview failed');
    }
  };

  const handleAnalysis = async (task: string) => {
    if (!sessionId || !role) return;
    
    try {
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
      
      const backendRole = roleMapping[role.id] || role.id;
      console.log('Running analysis:', { backendRole, task, sessionId });
      const result = await apiService.runAnalysis(backendRole, task, sessionId);
      console.log('Analysis result:', result);
      setAnalysisResults(result);
      setVisualizationKey(prev => prev + 1); // <-- Add this line
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  };

  const handleAIInsight = async (question: string) => {
    if (!sessionId || !role) return;
    setIsProcessingInsight(true);
    try {
      // Detect if the user wants to clean/fix the data
      const cleanIntent = /\b(clean|fix|remove errors|correct|repair|impute|standardize)\b/i.test(question);
      if (cleanIntent) {
        const result = await apiService.aiClean(role.id, sessionId);
        const newInsight = {
          question,
          response: result.summary || result.message || 'Data cleaned successfully.',
          timestamp: new Date()
        };
        setInsights(prev => [...prev, newInsight]);
      } else {
        const result = await apiService.getAIInsight(role.id, question, sessionId);
        const newInsight = {
          question,
          response: result.insight || result.message || 'Analysis completed successfully.',
          timestamp: new Date()
        };
        setInsights(prev => [...prev, newInsight]);
      }
    } catch (err) {
      const errorInsight = {
        question,
        response: err instanceof Error ? err.message : 'AI insight failed',
        timestamp: new Date()
      };
      setInsights(prev => [...prev, errorInsight]);
      setError(err instanceof Error ? err.message : 'AI insight failed');
    } finally {
      setIsProcessingInsight(false);
    }
  };

  const handleDownload = async (type: string, format: string) => {
    if (!sessionId || !role) return;
    setIsDownloading(true);
    try {
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
      const backendRole = roleMapping[role.id] || role.id;

      let downloadPayload: any = { session_id: sessionId, format };
      // Only include AI insights for report, no chart images
      if (type === 'report') {
        downloadPayload.insights = insights.map(i => ({
          question: i.question,
          response: i.response,
          timestamp: i.timestamp.toLocaleString()
        }));
      }
      // If downloading dashboard PNG, capture and download as before
      if (type === 'dashboard' && format === 'png') {
        const chartElement = document.querySelector(`#chart-container-${role.id}`);
        if (chartElement) {
          const canvas = await html2canvas(chartElement as HTMLElement);
          const chartBase64 = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = chartBase64;
          link.download = `${role.id}_dashboard.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setIsDownloading(false);
          return;
        } else {
          // Fallback if specific chart container not found
          const fallbackElement = document.querySelector('[id^="chart-container-"]');
          if (fallbackElement) {
            const canvas = await html2canvas(fallbackElement as HTMLElement);
            const chartBase64 = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = chartBase64;
            link.download = `${role.id}_dashboard.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setIsDownloading(false);
            return;
          }
        }
      }
      const result = await apiService.downloadData(backendRole, type, format, sessionId, downloadPayload);
      
      // Check for errors in the response
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Create and download the file
      let blob: Blob;
      let filename = result.filename;
      
      if (format === 'csv') {
        blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      } else if (format === 'xlsx') {
        // For Excel, we'll create a CSV for now (can be enhanced with a proper Excel library)
        const csvData = convertToCSV(result.data, result.columns);
        blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        filename = filename.replace('.xlsx', '.csv');
      } else if (format === 'pdf') {
        // Handle base64 PDF data
        const pdfData = atob(result.data);
        const pdfArray = new Uint8Array(pdfData.length);
        for (let i = 0; i < pdfData.length; i++) {
          pdfArray[i] = pdfData.charCodeAt(i);
        }
        blob = new Blob([pdfArray], { type: 'application/pdf' });
      } else if (format === 'png') {
        // Handle base64 PNG image data
        const imageData = atob(result.data);
        const imageArray = new Uint8Array(imageData.length);
        for (let i = 0; i < imageData.length; i++) {
          imageArray[i] = imageData.charCodeAt(i);
        }
        blob = new Blob([imageArray], { type: 'image/png' });
      } else {
        blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const convertToCSV = (data: any[], columns: string[]) => {
    const csvContent = [
      columns.join(','),
      ...data.map(row => columns.map(col => `"${row[col] || ''}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const handleStepNavigation = (step: number) => {
    // Allow navigation to previous steps or current step
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  // Load alert from localStorage for current ticker
  useEffect(() => {
    if (alertValue) {
      const alertData = localStorage.getItem(`alert_${alertValue}`);
      if (alertData) {
        const { value, type } = JSON.parse(alertData);
        setAlertValue(value);
        setAlertType(type);
        setShowAlertSet(true);
      } else {
        setAlertValue('');
        setAlertType('above');
        setShowAlertSet(false);
      }
    }
  }, [alertValue]);
  const saveAlert = () => {
    if (!alertValue) return;
    localStorage.setItem(`alert_${alertValue}`, JSON.stringify({ value: alertValue, type: alertType }));
    setShowAlertSet(true);
  };
  const clearAlert = () => {
    if (!alertValue) return;
    localStorage.removeItem(`alert_${alertValue}`);
    setShowAlertSet(false);
    setAlertValue('');
  };

  // After analysis, check alert
  useEffect(() => {
    if (alertValue) {
      const alertData = localStorage.getItem(`alert_${alertValue}`);
      if (alertData) {
        const { value, type } = JSON.parse(alertData);
        setAlertValue(value);
        setAlertType(type);
        setShowAlertSet(true);
      }
    }
    // eslint-disable-next-line
  }, [alertValue]);

  if (!role) {
    return (
      <div className="min-h-screen bg-main-gradient text-white overflow-x-hidden">
        <ParticleBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Role Not Found</h1>
            <p className="text-gray-300 mb-6">The requested role "{roleId}" could not be found.</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Special handling for Business Analyst role
  if (role.id === 'business_analyst') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Button 
                  onClick={() => navigate('/dashboard')} 
                  className="mr-4 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Business Analyst</h1>
                  <p className="text-gray-600 mt-1">KPIs, performance metrics, and business intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <BusinessAnalyst />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-gradient text-white overflow-x-hidden">
      <ParticleBackground />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{role.name}</h1>
                <p className="text-gray-400">{role.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Backend Connected</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center space-x-2 ${
                  currentStep >= step ? 'text-white' : 'text-gray-500'
                } ${currentStep >= step ? 'cursor-pointer hover:text-primary-300' : 'cursor-not-allowed'}`}
                onClick={() => currentStep >= step && setCurrentStep(step)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'step-active'
                      : 'step-inactive'
                  }`}
                >
                  {step}
                </div>
                <span className="hidden sm:block">
                  {step === 1 && 'Upload Data'}
                  {step === 2 && 'Clean & Prepare'}
                  {step === 3 && 'Analyze'}
                  {step === 4 && 'Insights'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {/* Step 1: File Upload */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FileUpload
                onFileUpload={handleFileUpload}
                onPreview={handlePreview}
                uploadedFile={uploadedFile}
                preview={preview}
                columns={columns}
                isUploading={isUploading}
                sessionId={sessionId || undefined}
                role={role.id}
              />
            </motion.div>
          )}

          {/* Step 2: Data Cleaning */}
          {currentStep === 2 && sessionId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Upload</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-2"
                >
                  <span>Start Over</span>
                </Button>
              </div>
              <DataCleaning
                sessionId={sessionId}
                role={role.id}
                onComplete={(cleanedData) => {
                  if (cleanedData) {
                    setPreview(cleanedData);
                  }
                  setCurrentStep(3);
                }}
                preview={preview}
                columns={columns}
              />
            </motion.div>
          )}

          {/* Step 3: Analysis */}
          {currentStep === 3 && sessionId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mb-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Clean & Prepare</span>
                </Button>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center space-x-2"
                  >
                    <span>Start Over</span>
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center space-x-2"
                  >
                   <span>Continue to Insights</span>
                    <span>→</span>
                  </Button>
                </div>
              </div>
                          <RoleSpecificTasks
              role={role}
              sessionId={sessionId}
              onAnalysis={handleAnalysis}
              onComplete={() => setCurrentStep(4)}
              results={analysisResults}
              hasData={preview.length > 0 && sessionId !== null}
            />
              
              {analysisResults && (
                <ChartVisualization
                  key={visualizationKey}
                  data={analysisResults}
                  role={role.id}
                  chartType="line"
                  showForecast={true}
                />
              )}
            </motion.div>
          )}

          {/* Step 4: AI Insights */}
          {currentStep === 4 && sessionId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="mb-4 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Analysis</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-2"
                >
                  <span>Start Over</span>
                </Button>
              </div>
              <AIInsights
                onAskQuestion={handleAIInsight}
                insights={insights}
                isProcessing={isProcessingInsight}
              />
              
              <DownloadSection
                role={role.id}
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
            </motion.div>
          )}


        </div>
        </div>
      </div>
    </div>
  );
};