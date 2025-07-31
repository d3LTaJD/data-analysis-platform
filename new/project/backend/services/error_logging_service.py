from sqlalchemy.ext.asyncio import AsyncSession
from database.models import ErrorLog
from database.database import AsyncSessionLocal
from datetime import datetime
from typing import Optional

class ErrorLoggingService:
    async def log_error(
        self,
        error_type: str,
        error_message: str,
        stack_trace: Optional[str] = None,
        endpoint: Optional[str] = None,
        request_data: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_id: Optional[int] = None
    ):
        async with AsyncSessionLocal() as db:
            error_log = ErrorLog(
                error_type=error_type,
                error_message=error_message,
                stack_trace=stack_trace,
                endpoint=endpoint,
                request_data=request_data,
                ip_address=ip_address,
                user_id=user_id
            )
            
            db.add(error_log)
            await db.commit()
    
    async def get_recent_errors(self, limit: int = 100):
        async with AsyncSessionLocal() as db:
            from sqlalchemy import select, desc
            result = await db.execute(
                select(ErrorLog)
                .order_by(desc(ErrorLog.created_at))
                .limit(limit)
            )
            return result.scalars().all()
    
    async def get_errors_by_type(self, error_type: str, limit: int = 50):
        async with AsyncSessionLocal() as db:
            from sqlalchemy import select, desc
            result = await db.execute(
                select(ErrorLog)
                .where(ErrorLog.error_type == error_type)
                .order_by(desc(ErrorLog.created_at))
                .limit(limit)
            )
            return result.scalars().all() 