import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
import sqlite3
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots

class BusinessAnalysisService:
    """Service for business analysis including KPIs, trends, segmentation, and insights"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def _get_db_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def clean_business_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Clean business data - remove nulls, duplicates, handle outliers"""
        try:
            original_shape = df.shape
            cleaning_report = {
                'original_rows': original_shape[0],
                'original_columns': original_shape[1],
                'cleaning_steps': []
            }
            
            # Step 1: Remove duplicates
            duplicates_removed = df.duplicated().sum()
            df = df.drop_duplicates()
            cleaning_report['cleaning_steps'].append(f'Removed {duplicates_removed} duplicate rows')
            
            # Step 2: Handle missing values
            missing_before = df.isnull().sum().sum()
            
            # For numeric columns, fill with median
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            for col in numeric_columns:
                if df[col].isnull().sum() > 0:
                    median_val = df[col].median()
                    df[col].fillna(median_val, inplace=True)
            
            # For categorical columns, fill with mode
            categorical_columns = df.select_dtypes(include=['object']).columns
            for col in categorical_columns:
                if df[col].isnull().sum() > 0:
                    mode_val = df[col].mode()[0] if len(df[col].mode()) > 0 else 'Unknown'
                    df[col].fillna(mode_val, inplace=True)
            
            missing_after = df.isnull().sum().sum()
            cleaning_report['cleaning_steps'].append(f'Handled {missing_before - missing_after} missing values')
            
            # Step 3: Remove outliers for key numeric columns (using IQR method)
            outliers_removed = 0
            for col in numeric_columns:
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = df[(df[col] < lower_bound) | (df[col] > upper_bound)]
                if len(outliers) > 0:
                    df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
                    outliers_removed += len(outliers)
            
            if outliers_removed > 0:
                cleaning_report['cleaning_steps'].append(f'Removed {outliers_removed} outliers')
            
            # Step 4: Standardize column names
            df.columns = df.columns.str.lower().str.replace(' ', '_').str.replace('-', '_')
            
            cleaning_report['final_rows'] = df.shape[0]
            cleaning_report['final_columns'] = df.shape[1]
            cleaning_report['rows_removed'] = original_shape[0] - df.shape[0]
            cleaning_report['cleaning_success'] = True
            
            return {
                'cleaned_data': df,
                'cleaning_report': cleaning_report
            }
            
        except Exception as e:
            return {
                'cleaned_data': df,
                'cleaning_report': {
                    'cleaning_success': False,
                    'error': str(e)
                }
            }
    
    def compute_kpis(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Compute key business KPIs"""
        try:
            kpis = {}
            
            # Identify key columns (common business data columns)
            revenue_cols = [col for col in df.columns if 'revenue' in col or 'sales' in col or 'amount' in col]
            cost_cols = [col for col in df.columns if 'cost' in col or 'expense' in col]
            customer_cols = [col for col in df.columns if 'customer' in col or 'user' in col]
            date_cols = [col for col in df.columns if 'date' in col or 'time' in col]
            
            # Revenue KPIs
            if revenue_cols:
                revenue_col = revenue_cols[0]
                kpis['total_revenue'] = df[revenue_col].sum()
                kpis['average_revenue'] = df[revenue_col].mean()
                kpis['revenue_growth'] = self._calculate_growth_rate(df, revenue_col)
            
            # Profit Margin (if cost data available)
            if revenue_cols and cost_cols:
                revenue_col = revenue_cols[0]
                cost_col = cost_cols[0]
                if 'profit' not in df.columns:
                    df['profit'] = df[revenue_col] - df[cost_col]
                kpis['total_profit'] = df['profit'].sum()
                kpis['profit_margin'] = (kpis['total_profit'] / kpis['total_revenue']) * 100
            
            # Customer KPIs
            if customer_cols:
                customer_col = customer_cols[0]
                kpis['total_customers'] = df[customer_col].nunique()
                kpis['average_customer_value'] = kpis.get('total_revenue', 0) / kpis['total_customers'] if kpis.get('total_customers', 0) > 0 else 0
            
            # Transaction KPIs
            kpis['total_transactions'] = len(df)
            kpis['average_transaction_value'] = kpis.get('total_revenue', 0) / kpis['total_transactions'] if kpis['total_transactions'] > 0 else 0
            
            # Churn Rate (if date data available)
            if date_cols and customer_cols:
                churn_rate = self._calculate_churn_rate(df, date_cols[0], customer_cols[0])
                if churn_rate is not None:
                    kpis['customer_churn_rate'] = churn_rate
            
            return {
                'success': True,
                'kpis': kpis,
                'kpi_count': len(kpis)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'KPI computation failed: {str(e)}'
            }
    
    def analyze_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze trends over time"""
        try:
            trends = {}
            
            # Find date column
            date_cols = [col for col in df.columns if 'date' in col or 'time' in col]
            if not date_cols:
                return {'success': False, 'error': 'No date column found for trend analysis'}
            
            date_col = date_cols[0]
            
            # Convert to datetime
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            
            # Set date as index
            df_temp = df.set_index(date_col)
            
            # Monthly trends
            monthly_data = df_temp.resample('M').sum()
            trends['monthly_trends'] = {
                'data': monthly_data.to_dict('index'),
                'growth_rate': self._calculate_period_growth(monthly_data)
            }
            
            # Quarterly trends
            quarterly_data = df_temp.resample('Q').sum()
            trends['quarterly_trends'] = {
                'data': quarterly_data.to_dict('index'),
                'growth_rate': self._calculate_period_growth(quarterly_data)
            }
            
            # Year-over-year comparison
            yearly_data = df_temp.resample('Y').sum()
            trends['yearly_trends'] = {
                'data': yearly_data.to_dict('index'),
                'growth_rate': self._calculate_period_growth(yearly_data)
            }
            
            return {
                'success': True,
                'trends': trends
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Trend analysis failed: {str(e)}'
            }
    
    def customer_segmentation(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform customer segmentation using RFM and K-means"""
        try:
            segmentation = {}
            
            # Find customer and date columns
            customer_cols = [col for col in df.columns if 'customer' in col or 'user' in col]
            date_cols = [col for col in df.columns if 'date' in col or 'time' in col]
            revenue_cols = [col for col in df.columns if 'revenue' in col or 'sales' in col or 'amount' in col]
            
            if not customer_cols or not date_cols or not revenue_cols:
                return {'success': False, 'error': 'Missing required columns for segmentation'}
            
            customer_col = customer_cols[0]
            date_col = date_cols[0]
            revenue_col = revenue_cols[0]
            
            # Convert date
            df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            df = df.dropna(subset=[date_col])
            
            # RFM Analysis
            rfm = self._calculate_rfm(df, customer_col, date_col, revenue_col)
            segmentation['rfm_analysis'] = rfm
            
            # K-means clustering
            if len(rfm) > 3:  # Need at least 3 customers for clustering
                kmeans_result = self._kmeans_clustering(rfm)
                segmentation['kmeans_clusters'] = kmeans_result
            
            return {
                'success': True,
                'segmentation': segmentation
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Customer segmentation failed: {str(e)}'
            }
    
    def detect_anomalies(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Detect anomalies in business data"""
        try:
            anomalies = {}
            
            # Find numeric columns for anomaly detection
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            
            for col in numeric_columns:
                # Skip if too many missing values
                if df[col].isnull().sum() > len(df) * 0.5:
                    continue
                
                # Remove NaN values for this column
                clean_data = df[col].dropna()
                
                if len(clean_data) < 10:  # Need minimum data points
                    continue
                
                # Use Isolation Forest for anomaly detection
                iso_forest = IsolationForest(contamination=0.1, random_state=42)
                predictions = iso_forest.fit_predict(clean_data.values.reshape(-1, 1))
                
                # Find anomalies (predictions == -1)
                anomaly_indices = np.where(predictions == -1)[0]
                
                if len(anomaly_indices) > 0:
                    anomalies[col] = {
                        'anomaly_count': len(anomaly_indices),
                        'anomaly_percentage': (len(anomaly_indices) / len(clean_data)) * 100,
                        'anomaly_values': clean_data.iloc[anomaly_indices].tolist(),
                        'anomaly_indices': anomaly_indices.tolist()
                    }
            
            return {
                'success': True,
                'anomalies': anomalies,
                'total_anomalies': sum(len(anom['anomaly_values']) for anom in anomalies.values())
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Anomaly detection failed: {str(e)}'
            }
    
    def generate_visualizations(self, df: pd.DataFrame, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate business visualizations"""
        try:
            visualizations = {}
            
            # Revenue trend chart
            if 'trends' in analysis_results and analysis_results['trends']['success']:
                revenue_cols = [col for col in df.columns if 'revenue' in col or 'sales' in col or 'amount' in col]
                if revenue_cols:
                    revenue_col = revenue_cols[0]
                    date_cols = [col for col in df.columns if 'date' in col or 'time' in col]
                    if date_cols:
                        df_temp = df.copy()
                        df_temp[date_cols[0]] = pd.to_datetime(df_temp[date_cols[0]])
                        monthly_revenue = df_temp.groupby(df_temp[date_cols[0]].dt.to_period('M'))[revenue_col].sum()
                        
                        fig = go.Figure()
                        fig.add_trace(go.Scatter(
                            x=monthly_revenue.index.astype(str),
                            y=monthly_revenue.values,
                            mode='lines+markers',
                            name='Monthly Revenue'
                        ))
                        fig.update_layout(
                            title='Monthly Revenue Trend',
                            xaxis_title='Month',
                            yaxis_title='Revenue',
                            template='plotly_dark'
                        )
                        visualizations['revenue_trend'] = fig.to_json()
            
            # KPI dashboard
            if 'kpis' in analysis_results and analysis_results['kpis']['success']:
                kpis = analysis_results['kpis']['kpis']
                
                # Create KPI cards visualization
                fig = make_subplots(
                    rows=2, cols=2,
                    subplot_titles=list(kpis.keys())[:4],
                    specs=[[{"type": "indicator"}, {"type": "indicator"}],
                           [{"type": "indicator"}, {"type": "indicator"}]]
                )
                
                kpi_items = list(kpis.items())[:4]
                for i, (kpi_name, kpi_value) in enumerate(kpi_items):
                    row = (i // 2) + 1
                    col = (i % 2) + 1
                    
                    fig.add_trace(
                        go.Indicator(
                            mode="number+delta",
                            value=kpi_value if isinstance(kpi_value, (int, float)) else 0,
                            title={"text": kpi_name.replace('_', ' ').title()},
                            delta={'reference': kpi_value * 0.9 if isinstance(kpi_value, (int, float)) else 0}
                        ),
                        row=row, col=col
                    )
                
                fig.update_layout(
                    title='Key Performance Indicators',
                    template='plotly_dark',
                    height=400
                )
                visualizations['kpi_dashboard'] = fig.to_json()
            
            # Customer segmentation chart
            if 'segmentation' in analysis_results and analysis_results['segmentation']['success']:
                rfm = analysis_results['segmentation']['rfm_analysis']
                if len(rfm) > 0:
                    fig = go.Figure()
                    fig.add_trace(go.Scatter(
                        x=[customer['recency'] for customer in rfm.values()],
                        y=[customer['frequency'] for customer in rfm.values()],
                        mode='markers',
                        marker=dict(
                            size=[customer['monetary'] / 100 for customer in rfm.values()],
                            color=[customer['rfm_score'] for customer in rfm.values()],
                            colorscale='Viridis',
                            showscale=True
                        ),
                        text=list(rfm.keys()),
                        hovertemplate='Customer: %{text}<br>Recency: %{x}<br>Frequency: %{y}<br>Monetary: %{marker.size}<extra></extra>'
                    ))
                    fig.update_layout(
                        title='Customer Segmentation (RFM Analysis)',
                        xaxis_title='Recency',
                        yaxis_title='Frequency',
                        template='plotly_dark'
                    )
                    visualizations['customer_segmentation'] = fig.to_json()
            
            return {
                'success': True,
                'visualizations': visualizations,
                'chart_count': len(visualizations)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Visualization generation failed: {str(e)}'
            }
    
    def generate_business_insights(self, df: pd.DataFrame, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate business insights and recommendations"""
        try:
            insights = []
            recommendations = []
            
            # KPI insights
            if 'kpis' in analysis_results and analysis_results['kpis']['success']:
                kpis = analysis_results['kpis']['kpis']
                
                if 'profit_margin' in kpis:
                    margin = kpis['profit_margin']
                    if margin < 10:
                        insights.append("⚠️ Low profit margin detected - consider cost optimization strategies")
                        recommendations.append("Review pricing strategy and operational costs")
                    elif margin > 30:
                        insights.append("✅ Strong profit margin - opportunity for growth investment")
                        recommendations.append("Consider expanding operations or product lines")
                
                if 'customer_churn_rate' in kpis:
                    churn = kpis['customer_churn_rate']
                    if churn > 0.1:  # 10% churn rate
                        insights.append("🚨 High customer churn rate detected")
                        recommendations.append("Implement customer retention programs and improve customer service")
            
            # Trend insights
            if 'trends' in analysis_results and analysis_results['trends']['success']:
                trends = analysis_results['trends']['trends']
                
                if 'monthly_trends' in trends:
                    growth_rate = trends['monthly_trends']['growth_rate']
                    if growth_rate > 0.05:  # 5% growth
                        insights.append("📈 Strong monthly growth trend observed")
                        recommendations.append("Maintain current growth strategies and consider scaling")
                    elif growth_rate < -0.05:  # -5% decline
                        insights.append("📉 Declining trend detected - immediate action required")
                        recommendations.append("Review business strategy and identify growth opportunities")
            
            # Segmentation insights
            if 'segmentation' in analysis_results and analysis_results['segmentation']['success']:
                rfm = analysis_results['segmentation']['rfm_analysis']
                high_value_customers = sum(1 for customer in rfm.values() if customer['rfm_score'] >= 4)
                total_customers = len(rfm)
                
                if total_customers > 0:
                    high_value_percentage = (high_value_customers / total_customers) * 100
                    insights.append(f"👥 {high_value_percentage:.1f}% of customers are high-value (RFM score ≥4)")
                    recommendations.append("Develop targeted marketing campaigns for high-value customer segments")
            
            # Anomaly insights
            if 'anomalies' in analysis_results and analysis_results['anomalies']['success']:
                anomalies = analysis_results['anomalies']['anomalies']
                if anomalies:
                    insights.append(f"🔍 Detected anomalies in {len(anomalies)} key metrics")
                    recommendations.append("Investigate anomalies for potential fraud or data quality issues")
            
            return {
                'success': True,
                'insights': insights,
                'recommendations': recommendations,
                'insight_count': len(insights),
                'recommendation_count': len(recommendations)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Insight generation failed: {str(e)}'
            }
    
    def save_analysis_results(self, user_id: int, analysis_name: str, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Save analysis results to database"""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Save main analysis record
            cursor.execute('''
                INSERT INTO business_analysis (user_id, analysis_name, analysis_type, kpi_metrics, 
                                             performance_data, insights, recommendations, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                analysis_name,
                'business_analysis',
                json.dumps(analysis_results.get('kpis', {})),
                json.dumps(analysis_results.get('trends', {})),
                json.dumps(analysis_results.get('insights', {})),
                json.dumps(analysis_results.get('recommendations', {})),
                'completed'
            ))
            
            analysis_id = cursor.lastrowid
            
            # Save KPI metrics
            if 'kpis' in analysis_results and analysis_results['kpis']['success']:
                kpis = analysis_results['kpis']['kpis']
                for metric_name, metric_value in kpis.items():
                    cursor.execute('''
                        INSERT INTO kpi_metrics (analysis_id, metric_name, metric_value, performance_status)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        analysis_id,
                        metric_name,
                        metric_value if isinstance(metric_value, (int, float)) else 0,
                        'good' if isinstance(metric_value, (int, float)) and metric_value > 0 else 'needs_attention'
                    ))
            
            # Save visualizations as reports
            if 'visualizations' in analysis_results and analysis_results['visualizations']['success']:
                visualizations = analysis_results['visualizations']['visualizations']
                for chart_type, chart_data in visualizations.items():
                    cursor.execute('''
                        INSERT INTO business_reports (analysis_id, report_type, report_data, report_format)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        analysis_id,
                        f'chart_{chart_type}',
                        chart_data,
                        'plotly_json'
                    ))
            
            conn.commit()
            conn.close()
            
            return {
                'success': True,
                'analysis_id': analysis_id,
                'message': 'Analysis results saved successfully'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Failed to save analysis results: {str(e)}'
            }
    
    # Helper methods
    def _calculate_growth_rate(self, df: pd.DataFrame, column: str) -> float:
        """Calculate growth rate for a column"""
        try:
            if len(df) < 2:
                return 0.0
            
            values = df[column].dropna()
            if len(values) < 2:
                return 0.0
            
            first_value = values.iloc[0]
            last_value = values.iloc[-1]
            
            if first_value == 0:
                return 0.0
            
            return ((last_value - first_value) / first_value) * 100
        except:
            return 0.0
    
    def _calculate_period_growth(self, period_data: pd.DataFrame) -> float:
        """Calculate growth rate for period data"""
        try:
            if len(period_data) < 2:
                return 0.0
            
            first_period = period_data.iloc[0].sum()
            last_period = period_data.iloc[-1].sum()
            
            if first_period == 0:
                return 0.0
            
            return ((last_period - first_period) / first_period) * 100
        except:
            return 0.0
    
    def _calculate_churn_rate(self, df: pd.DataFrame, date_col: str, customer_col: str) -> float:
        """Calculate customer churn rate"""
        try:
            # Group by customer and get their last activity date
            customer_activity = df.groupby(customer_col)[date_col].max()
            
            # Define churn threshold (e.g., 90 days)
            churn_threshold = datetime.now() - timedelta(days=90)
            
            # Count churned customers
            churned_customers = (customer_activity < churn_threshold).sum()
            total_customers = len(customer_activity)
            
            if total_customers == 0:
                return 0.0
            
            return (churned_customers / total_customers) * 100
        except:
            return None
    
    def _calculate_rfm(self, df: pd.DataFrame, customer_col: str, date_col: str, revenue_col: str) -> Dict[str, Dict]:
        """Calculate RFM (Recency, Frequency, Monetary) scores"""
        try:
            # Calculate RFM metrics for each customer
            rfm = df.groupby(customer_col).agg({
                date_col: lambda x: (datetime.now() - x.max()).days,  # Recency
                customer_col: 'count',  # Frequency
                revenue_col: 'sum'  # Monetary
            }).rename(columns={
                date_col: 'recency',
                customer_col: 'frequency',
                revenue_col: 'monetary'
            })
            
            # Calculate RFM scores
            rfm['r_score'] = pd.qcut(rfm['recency'], q=5, labels=[5, 4, 3, 2, 1])
            rfm['f_score'] = pd.qcut(rfm['frequency'], q=5, labels=[1, 2, 3, 4, 5])
            rfm['m_score'] = pd.qcut(rfm['monetary'], q=5, labels=[1, 2, 3, 4, 5])
            
            # Calculate RFM score
            rfm['rfm_score'] = rfm['r_score'].astype(int) + rfm['f_score'].astype(int) + rfm['m_score'].astype(int)
            
            return rfm.to_dict('index')
        except:
            return {}
    
    def _kmeans_clustering(self, rfm_data: Dict) -> Dict[str, Any]:
        """Perform K-means clustering on RFM data"""
        try:
            if len(rfm_data) < 3:
                return {'success': False, 'error': 'Insufficient data for clustering'}
            
            # Prepare data for clustering
            data = []
            customer_ids = []
            
            for customer_id, metrics in rfm_data.items():
                data.append([metrics['recency'], metrics['frequency'], metrics['monetary']])
                customer_ids.append(customer_id)
            
            # Standardize the data
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(data)
            
            # Perform K-means clustering
            kmeans = KMeans(n_clusters=min(4, len(data)), random_state=42)
            clusters = kmeans.fit_predict(scaled_data)
            
            # Create result
            result = {
                'success': True,
                'clusters': {},
                'cluster_centers': kmeans.cluster_centers_.tolist()
            }
            
            for i, customer_id in enumerate(customer_ids):
                result['clusters'][customer_id] = {
                    'cluster_id': int(clusters[i]),
                    'recency': rfm_data[customer_id]['recency'],
                    'frequency': rfm_data[customer_id]['frequency'],
                    'monetary': rfm_data[customer_id]['monetary']
                }
            
            return result
        except Exception as e:
            return {'success': False, 'error': str(e)} 