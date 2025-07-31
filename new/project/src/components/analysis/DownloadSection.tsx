import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Table } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface DownloadSectionProps {
  onDownload: (type: string, format: string) => void;
  isDownloading?: boolean;
  role: string;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({
  onDownload,
  isDownloading,
  role
}) => {
  const downloadOptions = [
    {
      id: 'report',
      name: 'Full Report',
      description: 'Complete analysis report with insights',
      icon: FileText,
      formats: ['pdf'],
      color: 'text-red-600'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Current dashboard as image',
      icon: Image,
      formats: ['png'],
      color: 'text-blue-600'
    },
    {
      id: 'data',
      name: 'Cleaned Data',
      description: 'Processed dataset',
      icon: Table,
      formats: ['xlsx', 'csv'],
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Download className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Export & Download</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {downloadOptions.map((option) => {
            const Icon = option.icon;
            
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                className="border rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`w-6 h-6 ${option.color}`} />
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-sm text-gray-500">{option.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {option.formats.map((format) => (
                    <Button
                      key={format}
                      variant="outline"
                      size="sm"
                      onClick={() => onDownload(option.id, format)}
                      loading={isDownloading}
                    >
                      {format.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};