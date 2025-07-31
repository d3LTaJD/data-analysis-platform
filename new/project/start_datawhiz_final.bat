@echo off
chcp 65001 >nul
title DataWhiz Analytics - Full Stack Startup

echo ============================================================
echo 🚀 DataWhiz Analytics - Full Stack Startup
echo ============================================================
echo 📊 FastAPI Backend + React Frontend
echo ============================================================

echo.
echo 🔍 Checking dependencies...

REM Check if Python is available
py --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python from: https://python.org/
    pause
    exit /b 1
)
echo ✓ Python is available

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js is available

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ npm is available

echo.
echo 🔧 Setting up environment...

REM Create necessary directories
if not exist "backend\uploads" mkdir "backend\uploads"
if not exist "backend\reports" mkdir "backend\reports"
if not exist "backend\logs" mkdir "backend\logs"
echo ✓ Created necessary directories

REM Check if .env exists, create from example if not
if not exist "backend\.env" (
    if exist "backend\env.example" (
        echo 📝 Creating .env file from template...
        copy "backend\env.example" "backend\.env" >nul
        echo ✓ Created .env file
    )
)

echo.
echo ============================================================
echo 🎯 Starting DataWhiz Analytics...
echo ============================================================

REM Install npm dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing npm dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install npm dependencies
        pause
        exit /b 1
    )
    echo ✓ npm dependencies installed
) else (
    echo ✓ npm dependencies already installed
)

echo.
echo 🚀 Starting servers in separate windows...
echo.

REM Start FastAPI backend in a new window
echo [1/2] Starting FastAPI backend...
start "DataWhiz Backend" cmd /k "cd /d %~dp0backend && echo Starting FastAPI backend... && py start_fastapi.py"

REM Wait a moment for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start React frontend in a new window
echo [2/2] Starting React frontend...
start "DataWhiz Frontend" cmd /k "cd /d %~dp0 && echo Starting React frontend... && npm run dev"

REM Wait a moment for frontend to start
echo Waiting for frontend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ============================================================
echo 🎉 DataWhiz Analytics is starting!
echo ============================================================
echo 📊 FastAPI Backend: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo 🌐 React Frontend: http://localhost:5173
echo ============================================================
echo.
echo 💡 Both servers are running in separate windows.
echo 💡 Close those windows to stop the servers.
echo 💡 Or press any key to close this startup window.
echo ============================================================

pause >nul 