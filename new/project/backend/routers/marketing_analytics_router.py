from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import User, Analysis, Report
from routers.auth_router import get_current_user
from services.marketing_analytics_service import MarketingAnalyticsService
from schemas.analysis import AnalysisResponse, AnalysisResult, UploadResponse, ReportResponse
from sqlalchemy import select
from datetime import datetime
import os
from config.settings import settings

router = APIRouter()
marketing_service = MarketingAnalyticsService()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate file type
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Validate file size
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size {file.size} exceeds maximum allowed size of {settings.MAX_FILE_SIZE}"
        )
    
    try:
        # Save file
        file_path = os.path.join(settings.UPLOAD_FOLDER, f"{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create analysis record
        analysis = Analysis(
            user_id=current_user.id,
            analysis_type="marketing_analytics",
            file_name=file.filename,
            file_path=file_path,
            file_size=len(content),
            status="uploaded"
        )
        
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        
        return UploadResponse(
            message="File uploaded successfully",
            analysis_id=analysis.id,
            file_name=file.filename,
            file_size=len(content)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.post("/analyze/{analysis_id}", response_model=AnalysisResult)
async def analyze_data(
    analysis_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get analysis record
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "marketing_analytics"
        )
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis.status == "processing":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis already in progress"
        )
    
    # Update status to processing
    analysis.status = "processing"
    await db.commit()
    
    # Run analysis in background
    background_tasks.add_task(
        marketing_service.run_marketing_analysis,
        analysis_id,
        analysis.file_path,
        db
    )
    
    return {
        "analysis_id": analysis_id,
        "status": "processing",
        "message": "Marketing analytics started in background"
    }

@router.get("/analyses", response_model=list[AnalysisResponse])
async def get_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis)
        .where(
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "marketing_analytics"
        )
        .order_by(Analysis.created_at.desc())
    )
    analyses = result.scalars().all()
    
    return [
        AnalysisResponse(
            id=analysis.id,
            analysis_type=analysis.analysis_type,
            file_name=analysis.file_name,
            status=analysis.status,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at
        )
        for analysis in analyses
    ]

@router.get("/analyses/{analysis_id}", response_model=AnalysisResult)
async def get_analysis_result(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "marketing_analytics"
        )
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis.status != "completed":
        return {
            "analysis_id": analysis_id,
            "status": analysis.status,
            "message": "Analysis not completed yet"
        }
    
    return {
        "analysis_id": analysis_id,
        "results": analysis.results or {},
        "charts": analysis.results.get("charts", []) if analysis.results else [],
        "insights": analysis.results.get("insights", []) if analysis.results else [],
        "recommendations": analysis.results.get("recommendations", []) if analysis.results else []
    }

@router.get("/download/{analysis_id}/{report_type}")
async def download_report(
    analysis_id: int,
    report_type: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validate report type
    if report_type not in ["pdf", "png", "excel", "json"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid report type. Allowed types: pdf, png, excel, json"
        )
    
    # Get report
    result = await db.execute(
        select(Report)
        .join(Analysis)
        .where(
            Report.analysis_id == analysis_id,
            Report.report_type == report_type,
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "marketing_analytics"
        )
    )
    report = result.scalar_one_or_none()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    if not os.path.exists(report.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found"
        )
    
    return FileResponse(
        path=report.file_path,
        filename=f"marketing_analytics_{analysis_id}_{report_type}.{report_type}",
        media_type="application/octet-stream"
    )

@router.post("/generate-reports/{analysis_id}")
async def generate_reports(
    analysis_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Get analysis record
    result = await db.execute(
        select(Analysis).where(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "marketing_analytics"
        )
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Analysis must be completed before generating reports"
        )
    
    # Generate reports in background
    background_tasks.add_task(
        marketing_service.generate_reports,
        analysis_id,
        analysis.results,
        db
    )
    
    return {
        "analysis_id": analysis_id,
        "message": "Report generation started in background"
    } 