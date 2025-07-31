@echo off
title DataWhiz Analytics - Starting...

echo ============================================================
echo DataWhiz Analytics - Full Stack Startup
echo ============================================================
echo FastAPI Backend + React Frontend
echo ============================================================

echo.
echo Starting DataWhiz Analytics...
echo.

REM Create directories if they don't exist
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\reports" mkdir "backend\reports"
if not exist "backend\logs" mkdir "backend\logs"

REM Create .env if it doesn't exist
if not exist "backend\.env" (
    if exist "backend\env.example" (
        copy "backend\env.example" "backend\.env" >nul
    )
)

REM Install aiosqlite if needed
echo Installing required dependencies...
py -m pip install aiosqlite >nul 2>&1

echo Starting FastAPI backend...
start "DataWhiz Backend" cmd /k "cd /d %~dp0backend && py start_fastapi.py"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo Starting React frontend...
start "DataWhiz Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Waiting 8 seconds for frontend to start...
timeout /t 8 /nobreak >nul

echo.
echo ============================================================
echo DataWhiz Analytics is starting!
echo ============================================================
echo FastAPI Backend: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo React Frontend: http://localhost:5173
echo ============================================================
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo Press any key to close this window...
pause >nul 