import { RoleData } from '../types';

export const roles: RoleData[] = [
  {
    id: 'business_analyst',
    name: 'Business Analyst',
    description: 'KPIs, performance metrics, and business intelligence',
    icon: 'BarChart3',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'research-eda',
    name: 'Research & EDA',
    description: 'Exploratory data analysis and statistical insights',
    icon: 'Search',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'marketing',
    name: 'Marketing Analytics',
    description: 'Campaign performance, customer segmentation, ROI',
    icon: 'Target',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'finance',
    name: 'Financial Analysis',
    description: 'Financial modeling, risk assessment, forecasting',
    icon: 'DollarSign',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'predictive-modeling',
    name: 'Predictive Modeling',
    description: 'Machine learning models and predictions',
    icon: 'Brain',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'healthcare',
    name: 'Healthcare Analytics',
    description: 'Medical data analysis and patient insights',
    icon: 'Heart',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Sales analysis, customer behavior, inventory',
    icon: 'ShoppingCart',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'general',
    name: 'General Analysis',
    description: 'Custom analysis for any data type',
    icon: 'Database',
    color: 'from-gray-500 to-gray-600'
  }
];