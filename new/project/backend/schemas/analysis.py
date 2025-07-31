from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class AnalysisRequest(BaseModel):
    analysis_type: str
    parameters: Optional[Dict[str, Any]] = None

class AnalysisResponse(BaseModel):
    id: int
    analysis_type: str
    file_name: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AnalysisResult(BaseModel):
    analysis_id: int
    results: Dict[str, Any]
    charts: List[Dict[str, Any]]
    insights: List[str]
    recommendations: List[str]

class ReportResponse(BaseModel):
    id: int
    analysis_id: int
    report_type: str
    file_path: str
    file_size: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    message: str
    analysis_id: int
    file_name: str
    file_size: int 