import pandas as pd
import numpy as np
from typing import Dict, Any, List
import json
from datetime import datetime

class DataAnalysisService:
    """Service for performing data analysis"""
    
    def __init__(self):
        self.supported_formats = ['.csv', '.xlsx', '.xls', '.json']
    
    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load data from various file formats"""
        try:
            if file_path.endswith('.csv'):
                return pd.read_csv(file_path)
            elif file_path.endswith(('.xlsx', '.xls')):
                return pd.read_excel(file_path)
            elif file_path.endswith('.json'):
                return pd.read_json(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_path}")
        except Exception as e:
            raise Exception(f"Error loading file: {str(e)}")
    
    def basic_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform basic data analysis"""
        try:
            analysis = {
                'basic_info': {
                    'total_rows': len(df),
                    'total_columns': len(df.columns),
                    'memory_usage_mb': round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2),
                    'duplicate_rows': df.duplicated().sum()
                },
                'missing_values': {
                    'total_missing': df.isnull().sum().sum(),
                    'missing_percentage': round((df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100, 2),
                    'columns_with_missing': df.isnull().sum()[df.isnull().sum() > 0].to_dict()
                },
                'data_types': {
                    'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
                    'categorical_columns': len(df.select_dtypes(include=['object']).columns),
                    'datetime_columns': len(df.select_dtypes(include=['datetime']).columns),
                    'type_distribution': df.dtypes.value_counts().to_dict()
                }
            }
            
            # Add column names by type
            analysis['column_details'] = {
                'numeric_columns': df.select_dtypes(include=[np.number]).columns.tolist(),
                'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
                'datetime_columns': df.select_dtypes(include=['datetime']).columns.tolist()
            }
            
            return analysis
            
        except Exception as e:
            raise Exception(f"Error in basic analysis: {str(e)}")
    
    def statistical_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform statistical analysis on numeric columns"""
        try:
            numeric_df = df.select_dtypes(include=[np.number])
            
            if numeric_df.empty:
                return {'error': 'No numeric columns found for statistical analysis'}
            
            stats = {}
            for column in numeric_df.columns:
                col_data = numeric_df[column].dropna()
                if len(col_data) > 0:
                    stats[column] = {
                        'count': len(col_data),
                        'mean': round(col_data.mean(), 4),
                        'median': round(col_data.median(), 4),
                        'std': round(col_data.std(), 4),
                        'min': round(col_data.min(), 4),
                        'max': round(col_data.max(), 4),
                        'q25': round(col_data.quantile(0.25), 4),
                        'q75': round(col_data.quantile(0.75), 4),
                        'skewness': round(col_data.skew(), 4),
                        'kurtosis': round(col_data.kurtosis(), 4)
                    }
            
            return {
                'statistical_summary': stats,
                'correlation_matrix': numeric_df.corr().round(4).to_dict() if len(numeric_df.columns) > 1 else {}
            }
            
        except Exception as e:
            raise Exception(f"Error in statistical analysis: {str(e)}")
    
    def categorical_analysis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze categorical columns"""
        try:
            categorical_df = df.select_dtypes(include=['object'])
            
            if categorical_df.empty:
                return {'error': 'No categorical columns found for analysis'}
            
            analysis = {}
            for column in categorical_df.columns:
                col_data = categorical_df[column].dropna()
                if len(col_data) > 0:
                    value_counts = col_data.value_counts()
                    analysis[column] = {
                        'unique_values': len(value_counts),
                        'most_common': value_counts.head(5).to_dict(),
                        'least_common': value_counts.tail(5).to_dict(),
                        'missing_count': df[column].isnull().sum(),
                        'missing_percentage': round((df[column].isnull().sum() / len(df)) * 100, 2)
                    }
            
            return {'categorical_summary': analysis}
            
        except Exception as e:
            raise Exception(f"Error in categorical analysis: {str(e)}")
    
    def generate_insights(self, df: pd.DataFrame) -> List[str]:
        """Generate insights from the data"""
        insights = []
        
        try:
            # Check for missing values
            missing_pct = (df.isnull().sum().sum() / (len(df) * len(df.columns))) * 100
            if missing_pct > 10:
                insights.append(f"⚠️ High missing data: {missing_pct:.1f}% of values are missing")
            elif missing_pct > 0:
                insights.append(f"ℹ️ Some missing data: {missing_pct:.1f}% of values are missing")
            
            # Check for duplicates
            duplicate_pct = (df.duplicated().sum() / len(df)) * 100
            if duplicate_pct > 5:
                insights.append(f"⚠️ Duplicate rows detected: {duplicate_pct:.1f}% of rows are duplicates")
            
            # Check data types
            numeric_cols = len(df.select_dtypes(include=[np.number]).columns)
            categorical_cols = len(df.select_dtypes(include=['object']).columns)
            
            if numeric_cols > 0:
                insights.append(f"📊 Dataset contains {numeric_cols} numeric columns for statistical analysis")
            
            if categorical_cols > 0:
                insights.append(f"📝 Dataset contains {categorical_cols} categorical columns")
            
            # Check for potential outliers in numeric columns
            numeric_df = df.select_dtypes(include=[np.number])
            for column in numeric_df.columns:
                col_data = numeric_df[column].dropna()
                if len(col_data) > 0:
                    Q1 = col_data.quantile(0.25)
                    Q3 = col_data.quantile(0.75)
                    IQR = Q3 - Q1
                    outliers = col_data[(col_data < (Q1 - 1.5 * IQR)) | (col_data > (Q3 + 1.5 * IQR))]
                    if len(outliers) > 0:
                        outlier_pct = (len(outliers) / len(col_data)) * 100
                        if outlier_pct > 5:
                            insights.append(f"⚠️ Potential outliers in '{column}': {outlier_pct:.1f}% of values")
            
            return insights
            
        except Exception as e:
            return [f"Error generating insights: {str(e)}"]

# Create a global instance
analysis_service = DataAnalysisService() 