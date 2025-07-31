export interface RoleData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface FileUpload {
  file: File | null;
  filename: string;
  preview: any[];
  columns: string[];
}

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'plotly3d';
  title: string;
  data: any;
  config?: any;
}

export interface AIInsight {
  question: string;
  response: string;
  timestamp: Date;
}

export interface AnalysisTask {
  id: string;
  name: string;
  description: string;
  endpoint: string;
}