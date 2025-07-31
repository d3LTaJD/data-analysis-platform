@echo off
title DataWhiz Analytics - Simple Mode (No Database)

echo ============================================================
echo DataWhiz Analytics - Simple Mode Startup
echo ============================================================
echo FastAPI Backend + React Frontend (No Database)
echo ============================================================

echo.
echo Starting DataWhiz Analytics in Simple Mode...
echo.

REM Create directories if they don't exist
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\reports" mkdir "backend\reports"
if not exist "backend\logs" mkdir "backend\logs"

echo Starting FastAPI backend (Simple Mode)...
start "DataWhiz Backend (Simple)" cmd /k "cd /d %~dp0backend && py start_simple.py"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting React frontend...
start "DataWhiz Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Waiting 5 seconds for frontend to start...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo DataWhiz Analytics is starting (Simple Mode)!
echo ============================================================
echo FastAPI Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo React Frontend: http://localhost:5173
echo ============================================================
echo.
echo Features:
echo - No database required
echo - In-memory authentication
echo - Mock analytics results
echo - All 8 analytics roles available
echo ============================================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo Press any key to close this window...
pause >nul 