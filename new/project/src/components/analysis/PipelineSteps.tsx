import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, Wrench, BarChart3, Download, Bot, CheckCircle } from 'lucide-react';

interface PipelineStepsProps {
  currentStep: number;
  completedSteps: number[];
}

export const PipelineSteps: React.FC<PipelineStepsProps> = ({ 
  currentStep, 
  completedSteps 
}) => {
  const steps = [
    { id: 1, icon: Upload, label: 'Upload Data', description: 'CSV/XLSX or paste manually' },
    { id: 2, icon: Eye, label: 'Data Preview', description: 'Scrollable & downloadable' },
    { id: 3, icon: Wrench, label: 'Clean & Transform', description: 'Drop nulls, encode, normalize' },
    { id: 4, icon: BarChart3, label: 'Role Analysis', description: 'Run specialized analytics' },
    { id: 5, icon: BarChart3, label: 'Dashboard Render', description: 'Interactive visualizations' },
    { id: 6, icon: Download, label: 'Export Reports', description: 'PDF, PNG, Excel formats' }
  ];

  return (
    <div className="card-bg rounded-xl p-6 mb-8">
      <h3 className="text-xl font-semibold mb-6 text-white">Analysis Pipeline</h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(Math.max(...completedSteps, 0) / steps.length) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="flex justify-between items-start">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isActive = isCompleted || isCurrent;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-center text-center max-w-32"
              >
                {/* Step Circle */}
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-green-500 glow-green' 
                    : isCurrent 
                      ? 'bg-indigo-600 glow-blue animate-pulse-glow' 
                      : 'bg-white/10 border border-white/20'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>

                {/* Step Info */}
                <div>
                  <h4 className={`text-sm font-medium mb-1 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </h4>
                  <p className={`text-xs ${
                    isActive ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};