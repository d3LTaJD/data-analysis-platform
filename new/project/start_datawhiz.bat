@echo off
title DataWhiz Analytics Platform

echo.
echo ============================================================
echo    DataWhiz Analytics Platform - Starting Up
echo ============================================================
echo.
echo This will start both the backend and frontend servers.
echo Please wait while we get everything ready...
echo.

REM Check if Python is available
echo [1/4] Checking Python...
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from: https://python.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Python is available

REM Check if Node.js is available
echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ Node.js is available

REM Check if npm is available
echo [3/4] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✓ npm is available

REM Create necessary directories
echo [4/4] Setting up directories...
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\reports" mkdir "backend\reports"
if not exist "backend\logs" mkdir "backend\logs"
echo ✓ Directories created

echo.
echo ============================================================
echo    Starting DataWhiz Analytics Platform
echo ============================================================
echo.

REM Install Python dependencies if needed
echo Installing Python dependencies...
py -m pip install -r backend/requirements_simple.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
echo ✓ Python dependencies installed

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install npm dependencies
        pause
        exit /b 1
    )
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend dependencies already installed
)

echo.
echo Starting servers...
echo.

REM Start FastAPI backend in a new window
echo Starting backend server...
start "DataWhiz Backend" cmd /k "cd /d %~dp0backend && echo Starting DataWhiz Backend... && py start_simple.py"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

REM Start React frontend in a new window
echo Starting frontend server...
start "DataWhiz Frontend" cmd /k "cd /d %~dp0 && echo Starting DataWhiz Frontend... && npm run dev"

REM Wait for frontend to start
echo Waiting for frontend to initialize...
timeout /t 6 /nobreak >nul

echo.
echo ============================================================
echo    DataWhiz Analytics Platform is Ready!
echo ============================================================
echo.
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo.
echo ============================================================
echo.
echo 💡 How to use:
echo    1. Open http://localhost:5173 in your browser
echo    2. Register a new account or login
echo    3. Choose an analytics role
echo    4. Upload your data and start analyzing!
echo.
echo 🛑 To stop the servers:
echo    Close the backend and frontend windows
echo.
echo ============================================================
echo.
echo Press any key to close this window...
pause >nul 