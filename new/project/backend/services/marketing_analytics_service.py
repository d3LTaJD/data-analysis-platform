import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.cluster import KMeans
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

class MarketingAnalyticsService:
    def __init__(self):
        self.reports_dir = "reports"
        os.makedirs(self.reports_dir, exist_ok=True)

    async def run_marketing_analysis(self, analysis_id: int, file_path: str, db: AsyncSession):
        """Run complete marketing analysis pipeline"""
        try:
            # Load data
            df = self.load_data(file_path)

            # Data cleaning
            df_clean = self.clean_data(df)

            # Run analyses
            results = {
                "roi_analysis": self.analyze_roi(df_clean),
                "rfm_segmentation": self.rfm_customer_segmentation(df_clean),
                "engagement_funnel": self.analyze_engagement_funnel(df_clean),
                "persona_clustering": self.persona_clustering(df_clean),
                "campaign_testing": self.campaign_performance_analysis(df_clean),
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

    def analyze_roi(self, df: pd.DataFrame) -> dict:
        """Analyze Return on Investment"""
        # Look for cost and revenue columns
        cost_columns = [col for col in df.columns if any(keyword in col.lower() 
                        for keyword in ['cost', 'spend', 'investment', 'budget'])]
        revenue_columns = [col for col in df.columns if any(keyword in col.lower() 
                          for keyword in ['revenue', 'sales', 'income', 'profit'])]

        if not cost_columns or not revenue_columns:
            return {"error": "No cost or revenue columns found for ROI analysis"}

        cost_col = cost_columns[0]
        revenue_col = revenue_columns[0]

        # Calculate ROI
        total_cost = df[cost_col].sum()
        total_revenue = df[revenue_col].sum()
        roi = ((total_revenue - total_cost) / total_cost) * 100 if total_cost > 0 else 0

        return {
            "total_cost": float(total_cost),
            "total_revenue": float(total_revenue),
            "roi_percentage": float(roi),
            "profit": float(total_revenue - total_cost),
            "cost_column": cost_col,
            "revenue_column": revenue_col
        }

    def rfm_customer_segmentation(self, df: pd.DataFrame) -> dict:
        """Perform RFM (Recency, Frequency, Monetary) segmentation"""
        # Look for date, customer, and monetary columns
        date_columns = []
        for col in df.columns:
            try:
                pd.to_datetime(df[col].iloc[0])
                date_columns.append(col)
            except:
                continue

        if not date_columns:
            return {"error": "No date columns found for RFM analysis"}

        date_col = date_columns[0]
        df[date_col] = pd.to_datetime(df[date_col])

        # Use first numeric column as monetary value
        monetary_columns = df.select_dtypes(include=[np.number]).columns
        if len(monetary_columns) == 0:
            return {"error": "No numeric columns for monetary analysis"}

        monetary_col = monetary_columns[0]

        # Calculate RFM metrics
        now = datetime.now()
        rfm = df.groupby('customer_id').agg({
            date_col: lambda x: (now - x.max()).days,  # Recency
            'transaction_id': 'count',  # Frequency
            monetary_col: 'sum'  # Monetary
        }).rename(columns={
            date_col: 'recency',
            'transaction_id': 'frequency',
            monetary_col: 'monetary'
        })

        # Score RFM (1-5 scale)
        rfm['r_score'] = pd.qcut(rfm['recency'], 5, labels=[5, 4, 3, 2, 1])
        rfm['f_score'] = pd.qcut(rfm['frequency'], 5, labels=[1, 2, 3, 4, 5])
        rfm['m_score'] = pd.qcut(rfm['monetary'], 5, labels=[1, 2, 3, 4, 5])

        # Calculate RFM score
        rfm['rfm_score'] = rfm['r_score'].astype(str) + rfm['f_score'].astype(str) + rfm['m_score'].astype(str)

        # Segment customers
        def segment_customers(row):
            if row['rfm_score'] >= '444':
                return 'Champions'
            elif row['rfm_score'] >= '333':
                return 'Loyal Customers'
            elif row['rfm_score'] >= '222':
                return 'At Risk'
            else:
                return 'Lost'

        rfm['segment'] = rfm.apply(segment_customers, axis=1)

        return {
            "rfm_data": rfm.to_dict('records'),
            "segment_counts": rfm['segment'].value_counts().to_dict(),
            "date_column": date_col,
            "monetary_column": monetary_col
        }

    def analyze_engagement_funnel(self, df: pd.DataFrame) -> dict:
        """Analyze customer engagement funnel"""
        # Look for funnel stage columns
        funnel_columns = [col for col in df.columns if any(keyword in col.lower() 
                         for keyword in ['stage', 'funnel', 'step', 'phase'])]

        if not funnel_columns:
            return {"error": "No funnel stage columns found"}

        funnel_col = funnel_columns[0]
        funnel_data = df[funnel_col].value_counts().sort_index()

        # Calculate conversion rates
        conversion_rates = {}
        total_users = funnel_data.iloc[0] if len(funnel_data) > 0 else 0

        for stage, count in funnel_data.items():
            conversion_rate = (count / total_users * 100) if total_users > 0 else 0
            conversion_rates[stage] = {
                "count": int(count),
                "conversion_rate": float(conversion_rate)
            }

        return {
            "funnel_stages": conversion_rates,
            "total_users": int(total_users),
            "funnel_column": funnel_col
        }

    def persona_clustering(self, df: pd.DataFrame) -> dict:
        """Perform customer persona clustering"""
        numeric_columns = df.select_dtypes(include=[np.number]).columns

        if len(numeric_columns) < 2:
            return {"error": "Insufficient numeric columns for clustering"}

        # Select features for clustering
        features = numeric_columns[:5].tolist()
        X = df[features].fillna(0)

        # Standardize features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Perform clustering
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        df['persona_cluster'] = kmeans.fit_predict(X_scaled)

        # Analyze clusters
        cluster_analysis = {}
        for cluster in range(4):
            cluster_data = df[df['persona_cluster'] == cluster]
            cluster_analysis[f"persona_{cluster}"] = {
                "size": len(cluster_data),
                "percentage": len(cluster_data) / len(df) * 100,
                "mean_values": cluster_data[features].mean().to_dict()
            }

        return {
            "cluster_analysis": cluster_analysis,
            "features_used": features,
            "cluster_assignments": df['persona_cluster'].tolist()
        }

    def campaign_performance_analysis(self, df: pd.DataFrame) -> dict:
        """Analyze campaign performance"""
        # Look for campaign and performance columns
        campaign_columns = [col for col in df.columns if any(keyword in col.lower() 
                           for keyword in ['campaign', 'ad', 'channel', 'source'])]
        performance_columns = [col for col in df.columns if any(keyword in col.lower() 
                              for keyword in ['clicks', 'impressions', 'conversions', 'ctr'])]

        if not campaign_columns:
            return {"error": "No campaign columns found"}

        campaign_col = campaign_columns[0]
        campaign_performance = df.groupby(campaign_col).agg({
            'clicks': 'sum',
            'impressions': 'sum',
            'conversions': 'sum',
            'cost': 'sum'
        }).reset_index()

        # Calculate metrics
        campaign_performance['ctr'] = (campaign_performance['clicks'] / campaign_performance['impressions'] * 100).fillna(0)
        campaign_performance['conversion_rate'] = (campaign_performance['conversions'] / campaign_performance['clicks'] * 100).fillna(0)
        campaign_performance['cpc'] = (campaign_performance['cost'] / campaign_performance['clicks']).fillna(0)

        return {
            "campaign_data": campaign_performance.to_dict('records'),
            "campaign_column": campaign_col,
            "total_campaigns": len(campaign_performance)
        }

    def generate_charts(self, df: pd.DataFrame, results: dict) -> list:
        """Generate interactive charts"""
        charts = []

        try:
            # ROI Analysis Chart
            if 'roi_analysis' in results and 'roi_percentage' in results['roi_analysis']:
                roi_data = results['roi_analysis']
                fig = go.Figure(data=[
                    go.Bar(x=['Cost', 'Revenue', 'Profit'], 
                           y=[roi_data['total_cost'], roi_data['total_revenue'], roi_data['profit']])
                ])
                fig.update_layout(title="ROI Analysis", xaxis_title="Metric", yaxis_title="Amount")
                charts.append({
                    "type": "roi_analysis",
                    "data": fig.to_dict(),
                    "title": "ROI Analysis"
                })

            # RFM Segmentation Chart
            if 'rfm_segmentation' in results and 'segment_counts' in results['rfm_segmentation']:
                segment_data = results['rfm_segmentation']['segment_counts']
                fig = px.pie(values=list(segment_data.values()), names=list(segment_data.keys()), title="RFM Customer Segments")
                charts.append({
                    "type": "rfm_segmentation",
                    "data": fig.to_dict(),
                    "title": "RFM Customer Segments"
                })

            # Engagement Funnel Chart
            if 'engagement_funnel' in results and 'funnel_stages' in results['engagement_funnel']:
                funnel_data = results['engagement_funnel']['funnel_stages']
                stages = list(funnel_data.keys())
                rates = [funnel_data[stage]['conversion_rate'] for stage in stages]
                
                fig = go.Figure(data=[
                    go.Funnel(y=stages, x=rates, textinfo="value+percent initial")
                ])
                fig.update_layout(title="Customer Engagement Funnel")
                charts.append({
                    "type": "engagement_funnel",
                    "data": fig.to_dict(),
                    "title": "Customer Engagement Funnel"
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
            # ROI Insights
            if 'roi_analysis' in results and 'roi_percentage' in results['roi_analysis']:
                roi = results['roi_analysis']
                insights.append(f"Total marketing investment: ${roi['total_cost']:,.2f}")
                insights.append(f"Total revenue generated: ${roi['total_revenue']:,.2f}")
                insights.append(f"ROI: {roi['roi_percentage']:.1f}%")

                if roi['roi_percentage'] > 0:
                    recommendations.append("Positive ROI achieved - consider increasing investment in successful campaigns")
                else:
                    recommendations.append("Negative ROI detected - review and optimize campaign strategies")

            # RFM Insights
            if 'rfm_segmentation' in results and 'segment_counts' in results['rfm_segmentation']:
                segments = results['rfm_segmentation']['segment_counts']
                insights.append(f"Customer segmentation completed with {len(segments)} segments")

                if 'Champions' in segments:
                    insights.append(f"Champions: {segments['Champions']} customers (highest value)")
                    recommendations.append("Develop VIP programs for Champions to increase retention")

                if 'At Risk' in segments:
                    insights.append(f"At Risk: {segments['At Risk']} customers need attention")
                    recommendations.append("Implement re-engagement campaigns for At Risk customers")

            # Engagement Funnel Insights
            if 'engagement_funnel' in results and 'funnel_stages' in results['engagement_funnel']:
                funnel = results['engagement_funnel']['funnel_stages']
                insights.append(f"Engagement funnel analyzed with {len(funnel)} stages")

                # Find bottleneck
                lowest_rate = min(funnel.values(), key=lambda x: x['conversion_rate'])
                insights.append(f"Lowest conversion rate: {lowest_rate['conversion_rate']:.1f}%")
                recommendations.append("Optimize the stage with lowest conversion rate")

            # General recommendations
            recommendations.append("Implement A/B testing for campaign optimization")
            recommendations.append("Set up automated reporting for regular performance monitoring")
            recommendations.append("Consider implementing customer lifetime value analysis")

        except Exception as e:
            insights.append(f"Error generating insights: {str(e)}")

        return insights, recommendations

    async def generate_reports(self, analysis_id: int, results: dict, db: AsyncSession):
        """Generate downloadable reports"""
        try:
            # Generate JSON report
            json_path = os.path.join(self.reports_dir, f"marketing_analysis_{analysis_id}.json")
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)

            # Generate Excel report
            excel_path = os.path.join(self.reports_dir, f"marketing_analysis_{analysis_id}.xlsx")
            with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
                # Summary sheet
                summary_data = []
                for key, value in results.items():
                    if isinstance(value, dict):
                        summary_data.append([key, "Complex data - see detailed sheets"])
                    else:
                        summary_data.append([key, str(value)])

                pd.DataFrame(summary_data, columns=['Metric', 'Value']).to_excel(writer, sheet_name='Summary', index=False)

                # ROI Analysis sheet
                if 'roi_analysis' in results:
                    roi_data = [[k, v] for k, v in results['roi_analysis'].items()]
                    pd.DataFrame(roi_data, columns=['Metric', 'Value']).to_excel(writer, sheet_name='ROI Analysis', index=False)

                # RFM Segmentation sheet
                if 'rfm_segmentation' in results and 'rfm_data' in results['rfm_segmentation']:
                    pd.DataFrame(results['rfm_segmentation']['rfm_data']).to_excel(writer, sheet_name='RFM Segmentation', index=False)

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