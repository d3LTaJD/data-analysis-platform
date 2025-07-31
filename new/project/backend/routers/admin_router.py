from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from database.database import get_db
from database.models import User, Analysis, Report, ErrorLog, SystemStats, AdminAction
from routers.auth_router import get_current_user
from sqlalchemy import select, func
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

@router.get("/users")
async def get_users(
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all users"""
    result = await db.execute(select(User))
    users = result.scalars().all()
    
    return [
        {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
        for user in users
    ]

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get specific user details"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's analyses
    analyses_result = await db.execute(
        select(Analysis).where(Analysis.user_id == user_id)
    )
    analyses = analyses_result.scalars().all()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
        },
        "analyses_count": len(analyses),
        "analyses": [
            {
                "id": analysis.id,
                "analysis_type": analysis.analysis_type,
                "file_name": analysis.file_name,
                "status": analysis.status,
                "created_at": analysis.created_at
            }
            for analysis in analyses
        ]
    }

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: str,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user role"""
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'user' or 'admin'"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = role
    user.updated_at = datetime.utcnow()
    
    # Log admin action
    admin_action = AdminAction(
        admin_user_id=admin_user.id,
        action_type="update_role",
        action_details=f"Changed user {user.email} role to {role}",
        target_user_id=user_id
    )
    db.add(admin_action)
    
    await db.commit()
    
    return {"message": f"User role updated to {role}"}

@router.put("/users/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Toggle user active status"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    user.updated_at = datetime.utcnow()
    
    # Log admin action
    admin_action = AdminAction(
        admin_user_id=admin_user.id,
        action_type="toggle_status",
        action_details=f"Changed user {user.email} status to {'active' if user.is_active else 'inactive'}",
        target_user_id=user_id
    )
    db.add(admin_action)
    
    await db.commit()
    
    return {"message": f"User status changed to {'active' if user.is_active else 'inactive'}"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete user"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Log admin action before deletion
    admin_action = AdminAction(
        admin_user_id=admin_user.id,
        action_type="delete_user",
        action_details=f"Deleted user {user.email}",
        target_user_id=user_id
    )
    db.add(admin_action)
    
    await db.delete(user)
    await db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/stats")
async def get_system_stats(
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get system statistics"""
    # Count users
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar()
    
    # Count active users
    active_users_result = await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )
    active_users = active_users_result.scalar()
    
    # Count analyses
    analyses_result = await db.execute(select(func.count(Analysis.id)))
    total_analyses = analyses_result.scalar()
    
    # Count completed analyses
    completed_analyses_result = await db.execute(
        select(func.count(Analysis.id)).where(Analysis.status == "completed")
    )
    completed_analyses = completed_analyses_result.scalar()
    
    # Count reports
    reports_result = await db.execute(select(func.count(Report.id)))
    total_reports = reports_result.scalar()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_analyses_result = await db.execute(
        select(func.count(Analysis.id)).where(Analysis.created_at >= week_ago)
    )
    recent_analyses = recent_analyses_result.scalar()
    
    # Error count
    errors_result = await db.execute(select(func.count(ErrorLog.id)))
    total_errors = errors_result.scalar()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_analyses": total_analyses,
        "completed_analyses": completed_analyses,
        "total_reports": total_reports,
        "recent_analyses_7_days": recent_analyses,
        "total_errors": total_errors,
        "completion_rate": (completed_analyses / total_analyses * 100) if total_analyses > 0 else 0
    }

@router.get("/errors")
async def get_error_logs(
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get error logs"""
    result = await db.execute(
        select(ErrorLog)
        .order_by(ErrorLog.created_at.desc())
        .limit(limit)
    )
    errors = result.scalars().all()
    
    return [
        {
            "id": error.id,
            "error_type": error.error_type,
            "error_message": error.error_message,
            "endpoint": error.endpoint,
            "ip_address": error.ip_address,
            "created_at": error.created_at
        }
        for error in errors
    ]

@router.get("/actions")
async def get_admin_actions(
    limit: int = 100,
    admin_user: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Get admin actions log"""
    result = await db.execute(
        select(AdminAction)
        .order_by(AdminAction.created_at.desc())
        .limit(limit)
    )
    actions = result.scalars().all()
    
    return [
        {
            "id": action.id,
            "admin_user_id": action.admin_user_id,
            "action_type": action.action_type,
            "action_details": action.action_details,
            "target_user_id": action.target_user_id,
            "created_at": action.created_at
        }
        for action in actions
    ] 