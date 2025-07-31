import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database.models import Analysis, Report
from database.database import AsyncSessionLocal

class GeneralAnalysisService:
    def __init__(self):
        self.reports_dir = "reports"
        os.makedirs(self.reports_dir, exist_ok=True)

    async def run_general_analysis(self, analysis_id: int, file_path: str, db: AsyncSession):
        """Run complete general analysis pipeline"""
        try:
            # Placeholder implementation
            results = {
                "auto_eda": {"status": "not implemented"},
                "correlation_heatmap": {"status": "not implemented"},
                "gpt_insights": {"status": "not implemented"},
                "auto_sql": {"status": "not implemented"},
                "charts": [],
                "insights": ["General analysis service is under development"],
                "recommendations": ["This feature will be available in future updates"]
            }

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

    async def generate_reports(self, analysis_id: int, results: dict, db: AsyncSession):
        """Generate downloadable reports"""
        try:
            # Generate JSON report
            json_path = os.path.join(self.reports_dir, f"general_analysis_{analysis_id}.json")
            with open(json_path, 'w') as f:
                json.dump(results, f, indent=2, default=str)

            # Save report records to database
            async with AsyncSessionLocal() as db_session:
                json_report = Report(
                    analysis_id=analysis_id,
                    report_type="json",
                    file_path=json_path,
                    file_size=os.path.getsize(json_path)
                )
                db_session.add(json_report)
                await db_session.commit()

        except Exception as e:
            print(f"Error generating reports: {str(e)}") 