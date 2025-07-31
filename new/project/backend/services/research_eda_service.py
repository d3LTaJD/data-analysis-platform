import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from datetime import datetime
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import Analysis, Report
from database.database import AsyncSessionLocal
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

class ResearchEDAService:
    def __init__(self):
        self.reports_dir = "reports"
        os.makedirs(self.reports_dir, exist_ok=True)

    async def run_research_analysis(self, analysis_id: int, file_path: str, db: AsyncSession):
        """Run complete research and EDA pipeline"""
        try:
            # Load data
            df = self.load_data(file_path)

            # Data cleaning
            df_clean = self.clean_data(df)

            # Run analyses
            results = {
                "correlation_matrix": self.correlation_analysis(df_clean),
                "summary_statistics": self.summary_statistics(df_clean),
                "outlier_detection": self.outlier_detection(df_clean),
                "missing_value_analysis": self.missing_value_analysis(df_clean),
                "hypothesis_testing": self.hypothesis_testing(df_clean),
                "charts": [],
                "insights": [],
                "recommendations": []
            }

            # Generate charts
            charts = self.generate_charts(df_clean, results)
            results["charts"] = charts

            # Generate insights and recommendations
            insights, recommendations = self.generate_insights(df_clean, results)
            results["insights"] = insights
            results["recommendations"] = recommendations

            # Update analysis record
            async with AsyncSessionLocal() as db_session:
                result = await db_session.execute(
                    select(Analysis).where(Analysis.id == analysis_id)
                )
                analysis = result.scalar_one_or_none()

                if analysis:
                    analysis.results = results
                    analysis.status = "completed"
                    analysis.completed_at = datetime.utcnow()
                    await db_session.commit()

        except Exception as e:
            # Update analysis record with error
            async with AsyncSessionLocal() as db_session:
                result = await db_session.execute(
                    select(Analysis).where(Analysis.id == analysis_id)
                )
                analysis = result.scalar_one_or_none()

                if analysis:
                    analysis.status = "failed"
                    analysis.results = {"error": str(e)}
                    await db_session.commit()

    def load_data(self, file_path: str) -> pd.DataFrame:
        """Load data from file"""
        if file_path.endswith('.csv'):
            return pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            return pd.read_excel(file_path)
        elif file_path.endswith('.json'):
            return pd.read_json(file_path)
        else:
            raise ValueError("Unsupported file format")

    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and preprocess data"""
        # Remove duplicates
        df = df.drop_duplicates()

        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())

        categorical_columns = df.select_dtypes(include=['object']).columns
        df[categorical_columns] = df[categorical_columns].fillna('Unknown')

        return df

    def correlation_analysis(self, df: pd.DataFrame) -> dict:
        """Perform correlation analysis"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) < 2:
            return {"error": "Insufficient numeric columns for correlation analysis"}

        # Calculate correlation matrix
        correlation_matrix = df[numeric_columns].corr()
        
        return {
            "correlation_matrix": correlation_matrix.to_dict(),
            "high_correlations": self.find_high_correlations(correlation_matrix),
            "numeric_columns": numeric_columns.tolist()
        }

    def find_high_correlations(self, corr_matrix: pd.DataFrame, threshold: float = 0.7) -> list:
        """Find highly correlated variables"""
        high_corr = []
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if abs(corr_matrix.iloc[i, j]) > threshold:
                    high_corr.append({
                        "variable1": corr_matrix.columns[i],
                        "variable2": corr_matrix.columns[j],
                        "correlation": float(corr_matrix.iloc[i, j])
                    })
        return high_corr

    def summary_statistics(self, df: pd.DataFrame) -> dict:
        """Generate comprehensive summary statistics"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        categorical_columns = df.select_dtypes(include=['object']).columns

        numeric_stats = {}
        for col in numeric_columns:
            numeric_stats[col] = {
                "count": int(df[col].count()),
                "mean": float(df[col].mean()),
                "std": float(df[col].std()),
                "min": float(df[col].min()),
                "25%": float(df[col].quantile(0.25)),
                "50%": float(df[col].quantile(0.50)),
                "75%": float(df[col].quantile(0.75)),
                "max": float(df[col].max()),
                "skewness": float(df[col].skew()),
                "kurtosis": float(df[col].kurtosis())
            }

        categorical_stats = {}
        for col in categorical_columns:
            categorical_stats[col] = {
                "count": int(df[col].count()),
                "unique_values": int(df[col].nunique()),
                "most_common": df[col].mode().iloc[0] if not df[col].mode().empty else None,
                "most_common_count": int(df[col].value_counts().iloc[0]) if not df[col].value_counts().empty else 0
            }

        return {
            "numeric_statistics": numeric_stats,
            "categorical_statistics": categorical_stats,
            "dataset_info": {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "numeric_columns": len(numeric_columns),
                "categorical_columns": len(categorical_columns)
            }
        }

    def outlier_detection(self, df: pd.DataFrame) -> dict:
        """Detect outliers using IQR method"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) == 0:
            return {"error": "No numeric columns for outlier detection"}

        outliers = {}
        for col in numeric_columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_indices = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index.tolist()
            
            outliers[col] = {
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound),
                "outlier_count": len(outlier_indices),
                "outlier_percentage": len(outlier_indices) / len(df) * 100,
                "outlier_indices": outlier_indices
            }

        return {
            "outlier_analysis": outliers,
            "total_outliers": sum([outliers[col]["outlier_count"] for col in outliers])
        }

    def missing_value_analysis(self, df: pd.DataFrame) -> dict:
        """Analyze missing values in the dataset"""
        missing_data = {}
        for col in df.columns:
            missing_count = df[col].isnull().sum()
            missing_percentage = (missing_count / len(df)) * 100
            
            missing_data[col] = {
                "missing_count": int(missing_count),
                "missing_percentage": float(missing_percentage),
                "data_type": str(df[col].dtype)
            }

        return {
            "missing_value_summary": missing_data,
            "total_missing_values": int(df.isnull().sum().sum()),
            "columns_with_missing": [col for col in df.columns if df[col].isnull().sum() > 0]
        }

    def hypothesis_testing(self, df: pd.DataFrame) -> dict:
        """Perform basic hypothesis testing"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) < 2:
            return {"error": "Insufficient numeric columns for hypothesis testing"}

        # Basic normality test (Shapiro-Wilk test approximation)
        normality_tests = {}
        for col in numeric_columns:
            # Simplified normality check using skewness and kurtosis
            skewness = df[col].skew()
            kurtosis = df[col].kurtosis()
            
            # Consider normal if skewness and kurtosis are within reasonable bounds
            is_normal = abs(skewness) < 1 and abs(kurtosis) < 3
            
            normality_tests[col] = {
                "skewness": float(skewness),
                "kurtosis": float(kurtosis),
                "is_normal": bool(is_normal)
            }

        return {
            "normality_tests": normality_tests,
            "columns_tested": numeric_columns.tolist()
        }

    def generate_charts(self, df: pd.DataFrame, results: dict) -> list:
        """Generate interactive charts"""
        charts = []

        try:
            # Correlation Heatmap
            if 'correlation_matrix' in results and 'correlation_matrix' in results['correlation_matrix']:
                corr_matrix = pd.DataFrame(results['correlation_matrix']['correlation_matrix'])
                fig = px.imshow(corr_matrix, 
                               title="Correlation Matrix Heatmap",
                               color_continuous_scale='RdBu')
                charts.append({
                    "type": "correlation_heatmap",
                    "data": fig.to_dict(),
                    "title": "Correlation Matrix"
                })

            # Summary Statistics Chart
            if 'summary_statistics' in results and 'numeric_statistics' in results['summary_statistics']:
                numeric_stats = results['summary_statistics']['numeric_statistics']
                if numeric_stats:
                    # Create box plot for numeric columns
                    numeric_cols = list(numeric_stats.keys())[:5]  # Limit to 5 columns
                    fig = px.box(df[numeric_cols], title="Distribution of Numeric Variables")
                    charts.append({
                        "type": "distribution_plot",
                        "data": fig.to_dict(),
                        "title": "Variable Distributions"
                    })

            # Missing Values Chart
            if 'missing_value_analysis' in results and 'missing_value_summary' in results['missing_value_analysis']:
                missing_data = results['missing_value_analysis']['missing_value_summary']
                missing_df = pd.DataFrame([
                    {"column": col, "missing_percentage": data["missing_percentage"]}
                    for col, data in missing_data.items()
                    if data["missing_percentage"] > 0
                ])
                
                if not missing_df.empty:
                    fig = px.bar(missing_df, x='column', y='missing_percentage',
                                title="Missing Values by Column")
                    charts.append({
                        "type": "missing_values",
                        "data": fig.to_dict(),
                        "title": "Missing Values Analysis"
                    })

        except Exception as e:
            charts.append({
                "type": "error",
                "message": f"Error generating charts: {str(e)}"
            })

        return charts

    def generate_insights(self, df: pd.DataFrame, results: dict) -> tuple:
        """Generate insights and recommendations"""
        insights = []
        recommendations = []

        try:
            # Dataset Overview
            if 'summary_statistics' in results and 'dataset_info' in results['summary_statistics']:
                info = results['summary_statistics']['dataset_info']
                insights.append(f"Dataset contains {info['total_rows']} rows and {info['total_columns']} columns")
                insights.append(f"Found {info['numeric_columns']} numeric and {info['categorical_columns']} categorical variables")

            # Correlation Insights
            if 'correlation_matrix' in results and 'high_correlations' in results['correlation_matrix']:
                high_corr = results['correlation_matrix']['high_correlations']
                if high_corr:
                    insights.append(f"Found {len(high_corr)} highly correlated variable pairs")
                    for corr in high_corr[:3]:  # Show top 3
                        insights.append(f"Strong correlation ({corr['correlation']:.2f}) between {corr['variable1']} and {corr['variable2']}")
                    recommendations.append("Consider removing one of highly correlated variables to reduce multicollinearity")

            # Missing Values Insights
            if 'missing_value_analysis' in results and 'missing_value_summary' in results['missing_value_analysis']:
                missing_data = results['missing_value_analysis']['missing_value_summary']
                columns_with_missing = [col for col, data in missing_data.items() if data['missing_percentage'] > 0]
                
                if columns_with_missing:
                    insights.append(f"Found missing values in {len(columns_with_missing)} columns")
                    max_missing = max(missing_data.values(), key=lambda x: x['missing_percentage'])
                    insights.append(f"Highest missing rate: {max_missing['missing_percentage']:.1f}%")
                    recommendations.append("Consider imputation strategies for missing values")

            # Outlier Insights
            if 'outlier_detection' in results and 'outlier_analysis' in results['outlier_detection']:
                outlier_data = results['outlier_detection']['outlier_analysis']
                total_outliers = results['outlier_detection']['total_outliers']
                
                if total_outliers > 0:
                    insights.append(f"Detected {total_outliers} outliers across all numeric variables")
                    recommendations.append("Investigate outliers to determine if they are errors or valid extreme values")

            # General recommendations
            recommendations.append("Consider feature engineering to create new meaningful variables")
            recommendations.append("Perform data validation to ensure data quality")
            recommendations.append("Consider scaling numeric variables for machine learning models")

        except Exception as e:
            insights.append(f"Error generating insights: {str(e)}")

        return insights, recommendations

    async def generate_reports(self, analysis_id: int, results: dict, db: AsyncSession):
        """Generate downloadable reports"""
        try:
            # Generate JSON report
            json_path = os.path.join(self.reports_dir, f"research_eda_{analysis_id}.json")
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)

            # Generate Excel report
            excel_path = os.path.join(self.reports_dir, f"research_eda_{analysis_id}.xlsx")
            with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
                # Summary sheet
                summary_data = []
                for key, value in results.items():
                    if isinstance(value, dict):
                        summary_data.append([key, "Complex data - see detailed sheets"])
                    else:
                        summary_data.append([key, str(value)])

                pd.DataFrame(summary_data, columns=['Metric', 'Value']).to_excel(writer, sheet_name='Summary', index=False)

                # Correlation Matrix sheet
                if 'correlation_matrix' in results and 'correlation_matrix' in results['correlation_matrix']:
                    corr_df = pd.DataFrame(results['correlation_matrix']['correlation_matrix'])
                    corr_df.to_excel(writer, sheet_name='Correlation Matrix')

                # Summary Statistics sheet
                if 'summary_statistics' in results and 'numeric_statistics' in results['summary_statistics']:
                    numeric_stats = results['summary_statistics']['numeric_statistics']
                    stats_df = pd.DataFrame(numeric_stats).T
                    stats_df.to_excel(writer, sheet_name='Summary Statistics')

            # Save report records to database
            async with AsyncSessionLocal() as db_session:
                # JSON report
                json_report = Report(
                    analysis_id=analysis_id,
                    report_type="json",
                    file_path=json_path,
                    file_size=os.path.getsize(json_path)
                )
                db_session.add(json_report)

                # Excel report
                excel_report = Report(
                    analysis_id=analysis_id,
                    report_type="excel",
                    file_path=excel_path,
                    file_size=os.path.getsize(excel_path)
                )
                db_session.add(excel_report)

                await db_session.commit()

        except Exception as e:
            print(f"Error generating reports: {str(e)}") 