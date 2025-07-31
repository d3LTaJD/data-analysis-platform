import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Eye, Download, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { apiService } from '../../utils/api';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onPreview: () => void;
  uploadedFile: File | null;
  preview?: any[];
  columns?: string[];
  isUploading: boolean;
  sessionId?: string;
  role?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  onPreview,
  uploadedFile,
  preview,
  columns,
  isUploading,
  sessionId,
  role
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [fullData, setFullData] = useState<any[]>([]);
  const [isLoadingFullData, setIsLoadingFullData] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed:', e.target.files);
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Selected file:', files[0]);
      onFileUpload(files[0]);
    } else {
      console.log('No files selected');
    }
  }, [onFileUpload]);

  const handleFullPreview = async () => {
    if (!sessionId || !role) {
      alert('No session ID or role available');
      return;
    }
    
    setIsLoadingFullData(true);
    try {
      const response = await apiService.fullPreviewData(role, sessionId);
      console.log('Full preview response:', response);
      console.log('Full data length:', response.data?.length || 0);
      console.log('Total rows reported:', response.total_rows);
      
      if (response.data && response.data.length > 0) {
        setFullData(response.data);
        setShowFullPreview(true);
        console.log('Successfully loaded full data with', response.data.length, 'rows');
      } else {
        console.error('No full data received from server');
        alert('No data received from server. Please try again.');
      }
    } catch (error) {
      console.error('Error loading full preview data:', error);
      alert('Error loading full preview data. Please try again.');
      // Fallback to showing preview data if full data fails
      setFullData(preview || []);
      setShowFullPreview(true);
    } finally {
      setIsLoadingFullData(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Upload Your Data</h3>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('file-upload')?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer upload-zone ${
            dragActive 
              ? 'border-primary-400 bg-primary-500/10' 
              : 'border-white/20 hover:border-primary-400'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2 text-white">Drop your CSV or Excel file here</p>
          <p className="text-gray-400 mb-4">or click to browse</p>
          
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button 
              type="button"
              loading={isUploading}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </label>
        </div>
      </Card>

      {/* File Info */}
      {uploadedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-primary-400" />
                <div>
                  <h4 className="font-medium text-white">{uploadedFile.name}</h4>
                  <p className="text-sm text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={onPreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Quick Preview
                </Button>
                <Button variant="secondary" onClick={handleFullPreview} disabled={isLoadingFullData}>
                  <Eye className="w-4 h-4 mr-2" />
                  Full Preview
                </Button>
                <Button variant="accent" onClick={() => {}}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            {/* Quick Preview Table */}
            {preview && preview.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-2 text-white">Data Preview (First 5 rows)</h5>
                <div className="overflow-x-auto border border-white/10 rounded-lg custom-scrollbar">
                  <table className="min-w-full divide-y divide-white/10">
                    <thead className="bg-white/5">
                      <tr>
                        {columns?.map((column, idx) => (
                          <th
                            key={idx}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {preview.slice(0, 5).map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5">
                          {columns?.map((column, colIdx) => (
                            <td
                              key={colIdx}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                            >
                              {row[column]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Full Preview Modal */}
      {showFullPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullPreview(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-bg rounded-xl p-6 max-w-6xl max-h-[80vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Full Data Preview</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  Showing {fullData.length} rows of data
                </span>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="overflow-auto max-h-[80vh] custom-scrollbar">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/5 sticky top-0 z-10">
                  <tr>
                    {columns?.map((column, idx) => (
                      <th
                        key={idx}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider bg-white/5"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {fullData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      {columns?.map((column, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                        >
                          {row[column] !== null && row[column] !== undefined ? row[column] : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};