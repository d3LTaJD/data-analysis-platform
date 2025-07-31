from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import User, Analysis
from routers.auth_router import get_current_user
from schemas.analysis import AnalysisResponse, UploadResponse
from sqlalchemy import select
from datetime import datetime
import os
from config.settings import settings

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_extension} not allowed"
        )
    
    try:
        file_path = os.path.join(settings.UPLOAD_FOLDER, f"{current_user.id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file.filename}")
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        analysis = Analysis(
            user_id=current_user.id,
            analysis_type="ecommerce_analytics",
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

@router.get("/analyses", response_model=list[AnalysisResponse])
async def get_analyses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Analysis)
        .where(
            Analysis.user_id == current_user.id,
            Analysis.analysis_type == "ecommerce_analytics"
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