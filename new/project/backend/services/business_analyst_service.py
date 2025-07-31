import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
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

class BusinessAnalystService:
    def __init__(self):
        self.reports_dir = "reports"
        os.makedirs(self.reports_dir, exist_ok=True)
    
    async def run_business_analysis(self, analysis_id: int, file_path: str, db: AsyncSession):
        """Run complete business analysis pipeline"""
        try:
            # Load data
            df = self.load_data(file_path)
            
            # Data cleaning
            df_clean = self.clean_data(df)
            
            # Run analyses
            results = {
                "kpi_dashboard": self.create_kpi_dashboard(df_clean),
                "customer_segmentation": self.kmeans_customer_segmentation(df_clean),
                "sales_trends": self.analyze_sales_trends(df_clean),
                "anomaly_detection": self.detect_anomalies(df_clean),
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
        
        # Remove outliers for numeric columns (using IQR method)
        for col in numeric_columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
        
        return df
    
    def create_kpi_dashboard(self, df: pd.DataFrame) -> dict:
        """Create KPI dashboard metrics"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        kpis = {}
        
        # Basic statistics for numeric columns
        for col in numeric_columns:
            kpis[f"{col}_mean"] = float(df[col].mean())
            kpis[f"{col}_median"] = float(df[col].median())
            kpis[f"{col}_std"] = float(df[col].std())
            kpis[f"{col}_min"] = float(df[col].min())
            kpis[f"{col}_max"] = float(df[col].max())
        
        # Overall dataset KPIs
        kpis["total_records"] = len(df)
        kpis["total_columns"] = len(df.columns)
        kpis["numeric_columns"] = len(numeric_columns)
        kpis["categorical_columns"] = len(df.columns) - len(numeric_columns)
        
        return kpis
    
    def kmeans_customer_segmentation(self, df: pd.DataFrame) -> dict:
        """Perform KMeans customer segmentation"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) < 2:
            return {"error": "Insufficient numeric columns for clustering"}
        
        # Select features for clustering (use first 5 numeric columns)
        features = numeric_columns[:5].tolist()
        
        # Prepare data
        X = df[features].fillna(0)
        
        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Determine optimal number of clusters using elbow method
        inertias = []
        K_range = range(1, min(11, len(X) // 10 + 1))
        
        for k in K_range:
            kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
            kmeans.fit(X_scaled)
            inertias.append(kmeans.inertia_)
        
        # Find elbow point (simplified)
        optimal_k = 3  # Default to 3 clusters
        
        # Perform final clustering
        kmeans = KMeans(n_clusters=optimal_k, random_state=42, n_init=10)
        df['cluster'] = kmeans.fit_predict(X_scaled)
        
        # Analyze clusters
        cluster_analysis = {}
        for cluster in range(optimal_k):
            cluster_data = df[df['cluster'] == cluster]
            cluster_analysis[f"cluster_{cluster}"] = {
                "size": len(cluster_data),
                "percentage": len(cluster_data) / len(df) * 100,
                "mean_values": cluster_data[features].mean().to_dict()
            }
        
        return {
            "optimal_clusters": optimal_k,
            "cluster_analysis": cluster_analysis,
            "features_used": features,
            "cluster_assignments": df['cluster'].tolist()
        }
    
    def analyze_sales_trends(self, df: pd.DataFrame) -> dict:
        """Analyze sales trends and patterns"""
        # Look for date/time columns
        date_columns = []
        for col in df.columns:
            try:
                pd.to_datetime(df[col].iloc[0])
                date_columns.append(col)
            except:
                continue
        
        if not date_columns:
            return {"error": "No date columns found for trend analysis"}
        
        # Use first date column
        date_col = date_columns[0]
        df[date_col] = pd.to_datetime(df[date_col])
        
        # Look for sales/amount columns
        sales_columns = [col for col in df.columns if any(keyword in col.lower() 
                        for keyword in ['sales', 'amount', 'revenue', 'price', 'value'])]
        
        if not sales_columns:
            # Use first numeric column as sales
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            if len(numeric_columns) > 0:
                sales_col = numeric_columns[0]
            else:
                return {"error": "No sales columns found"}
        else:
            sales_col = sales_columns[0]
        
        # Group by date and calculate trends
        df_trends = df.groupby(df[date_col].dt.date)[sales_col].agg(['sum', 'mean', 'count']).reset_index()
        df_trends.columns = ['date', 'total_sales', 'avg_sales', 'transaction_count']
        
        # Calculate trends
        df_trends['sales_growth'] = df_trends['total_sales'].pct_change()
        df_trends['transaction_growth'] = df_trends['transaction_count'].pct_change()
        
        return {
            "trend_data": df_trends.to_dict('records'),
            "total_sales": float(df[sales_col].sum()),
            "avg_sales": float(df[sales_col].mean()),
            "total_transactions": len(df),
            "date_column": date_col,
            "sales_column": sales_col,
            "growth_rate": float(df_trends['sales_growth'].mean()) if len(df_trends) > 1 else 0
        }
    
    def detect_anomalies(self, df: pd.DataFrame) -> dict:
        """Detect anomalies using Isolation Forest"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        
        if len(numeric_columns) == 0:
            return {"error": "No numeric columns for anomaly detection"}
        
        # Use first few numeric columns
        features = numeric_columns[:3].tolist()
        X = df[features].fillna(0)
        
        # Detect anomalies
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        df['anomaly'] = iso_forest.fit_predict(X)
        
        # Anomaly analysis
        anomalies = df[df['anomaly'] == -1]
        normal = df[df['anomaly'] == 1]
        
        return {
            "total_anomalies": len(anomalies),
            "anomaly_percentage": len(anomalies) / len(df) * 100,
            "features_analyzed": features,
            "anomaly_indices": anomalies.index.tolist(),
            "anomaly_summary": {
                "anomaly_count": len(anomalies),
                "normal_count": len(normal),
                "total_records": len(df)
            }
        }
    
    def generate_charts(self, df: pd.DataFrame, results: dict) -> list:
        """Generate interactive charts"""
        charts = []
        
        try:
            # KPI Dashboard Chart
            if 'kpi_dashboard' in results:
                kpis = results['kpi_dashboard']
                numeric_columns = df.select_dtypes(include=[np.number]).columns[:5]
                
                fig = make_subplots(
                    rows=2, cols=2,
                    subplot_titles=[f"{col} Distribution" for col in numeric_columns],
                    specs=[[{"type": "histogram"}, {"type": "histogram"}],
                           [{"type": "histogram"}, {"type": "histogram"}]]
                )
                
                for i, col in enumerate(numeric_columns):
                    row = (i // 2) + 1
                    col_pos = (i % 2) + 1
                    fig.add_trace(
                        go.Histogram(x=df[col], name=col),
                        row=row, col=col_pos
                    )
                
                fig.update_layout(height=600, title_text="KPI Dashboard")
                charts.append({
                    "type": "kpi_dashboard",
                    "data": fig.to_dict(),
                    "title": "KPI Dashboard"
                })
            
            # Customer Segmentation Chart
            if 'customer_segmentation' in results and 'cluster_assignments' in results['customer_segmentation']:
                df['cluster'] = results['customer_segmentation']['cluster_assignments']
                numeric_columns = df.select_dtypes(include=[np.number]).columns[:2]
                
                if len(numeric_columns) >= 2:
                    fig = px.scatter(
                        df, x=numeric_columns[0], y=numeric_columns[1], 
                        color='cluster', title="Customer Segmentation"
                    )
                    charts.append({
                        "type": "customer_segmentation",
                        "data": fig.to_dict(),
                        "title": "Customer Segmentation"
                    })
            
            # Sales Trends Chart
            if 'sales_trends' in results and 'trend_data' in results['sales_trends']:
                trend_data = results['sales_trends']['trend_data']
                if trend_data:
                    df_trends = pd.DataFrame(trend_data)
                    fig = px.line(
                        df_trends, x='date', y='total_sales',
                        title="Sales Trends Over Time"
                    )
                    charts.append({
                        "type": "sales_trends",
                        "data": fig.to_dict(),
                        "title": "Sales Trends"
                    })
            
            # Anomaly Detection Chart
            if 'anomaly_detection' in results and 'anomaly_indices' in results['anomaly_detection']:
                df['anomaly'] = 0
                df.loc[results['anomaly_detection']['anomaly_indices'], 'anomaly'] = 1
                
                numeric_columns = df.select_dtypes(include=[np.number]).columns[:2]
                if len(numeric_columns) >= 2:
                    fig = px.scatter(
                        df, x=numeric_columns[0], y=numeric_columns[1],
                        color='anomaly', title="Anomaly Detection"
                    )
                    charts.append({
                        "type": "anomaly_detection",
                        "data": fig.to_dict(),
                        "title": "Anomaly Detection"
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
            # KPI Insights
            if 'kpi_dashboard' in results:
                kpis = results['kpi_dashboard']
                insights.append(f"Dataset contains {kpis['total_records']} records with {kpis['total_columns']} columns")
                insights.append(f"Found {kpis['numeric_columns']} numeric and {kpis['categorical_columns']} categorical columns")
            
            # Customer Segmentation Insights
            if 'customer_segmentation' in results and 'cluster_analysis' in results['customer_segmentation']:
                cluster_analysis = results['customer_segmentation']['cluster_analysis']
                insights.append(f"Customer segmentation identified {len(cluster_analysis)} distinct customer groups")
                
                for cluster, data in cluster_analysis.items():
                    insights.append(f"{cluster.replace('_', ' ').title()}: {data['size']} customers ({data['percentage']:.1f}%)")
                
                recommendations.append("Consider targeted marketing campaigns for each customer segment")
                recommendations.append("Develop personalized product recommendations based on segment characteristics")
            
            # Sales Trends Insights
            if 'sales_trends' in results:
                trends = results['sales_trends']
                if 'total_sales' in trends:
                    insights.append(f"Total sales: ${trends['total_sales']:,.2f}")
                    insights.append(f"Average transaction value: ${trends['avg_sales']:,.2f}")
                    
                    if 'growth_rate' in trends and trends['growth_rate'] > 0:
                        insights.append(f"Positive sales growth rate: {trends['growth_rate']:.1%}")
                        recommendations.append("Maintain current growth strategies")
                    elif 'growth_rate' in trends and trends['growth_rate'] < 0:
                        insights.append(f"Declining sales growth rate: {trends['growth_rate']:.1%}")
                        recommendations.append("Investigate causes of sales decline and implement recovery strategies")
            
            # Anomaly Detection Insights
            if 'anomaly_detection' in results:
                anomalies = results['anomaly_detection']
                if 'total_anomalies' in anomalies:
                    insights.append(f"Detected {anomalies['total_anomalies']} anomalies ({anomalies['anomaly_percentage']:.1f}% of data)")
                    
                    if anomalies['total_anomalies'] > 0:
                        recommendations.append("Investigate detected anomalies for potential fraud or data quality issues")
                        recommendations.append("Consider implementing automated anomaly detection systems")
            
            # General recommendations
            recommendations.append("Regular monitoring of KPIs is recommended")
            recommendations.append("Consider implementing real-time analytics dashboards")
            recommendations.append("Perform regular customer segmentation analysis to track changes")
        
        except Exception as e:
            insights.append(f"Error generating insights: {str(e)}")
        
        return insights, recommendations
    
    async def generate_reports(self, analysis_id: int, results: dict, db: AsyncSession):
        """Generate downloadable reports"""
        try:
            # Generate JSON report
            json_path = os.path.join(self.reports_dir, f"business_analysis_{analysis_id}.json")
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)
            
            # Generate Excel report
            excel_path = os.path.join(self.reports_dir, f"business_analysis_{analysis_id}.xlsx")
            with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
                # Summary sheet
                summary_data = []
                for key, value in results.items():
                    if isinstance(value, dict):
                        summary_data.append([key, "Complex data - see detailed sheets"])
                    else:
                        summary_data.append([key, str(value)])
                
                pd.DataFrame(summary_data, columns=['Metric', 'Value']).to_excel(writer, sheet_name='Summary', index=False)
                
                # KPI Dashboard sheet
                if 'kpi_dashboard' in results:
                    kpi_data = [[k, v] for k, v in results['kpi_dashboard'].items()]
                    pd.DataFrame(kpi_data, columns=['KPI', 'Value']).to_excel(writer, sheet_name='KPI Dashboard', index=False)
                
                # Sales Trends sheet
                if 'sales_trends' in results and 'trend_data' in results['sales_trends']:
                    pd.DataFrame(results['sales_trends']['trend_data']).to_excel(writer, sheet_name='Sales Trends', index=False)
            
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