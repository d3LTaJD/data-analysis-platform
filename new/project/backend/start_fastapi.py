#!/usr/bin/env python3
"""
DataWhiz Analytics FastAPI Backend Startup Script
"""

import os
import sys
import asyncio
import uvicorn
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

def create_directories():
    """Create necessary directories if they don't exist"""
    directories = ['uploads', 'reports', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"Created directory: {directory}")

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import pandas
        import numpy
        import plotly
        print("All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install dependencies with: pip install -r requirements_fastapi.txt")
        return False

def check_environment():
    """Check environment variables"""
    required_vars = ['SECRET_KEY']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these variables in your .env file or environment")
        return False
    
    print("Environment variables are configured")
    return True

def main():
    """Main startup function"""
    print("Starting DataWhiz Analytics FastAPI Backend...")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    # Check environment
    if not check_environment():
        print("\nWarning: Some environment variables are missing.")
        print("The application will use default values for development.")
    
    print("\n" + "=" * 50)
    print("Starting FastAPI server...")
    print("API Documentation will be available at: http://localhost:8000/docs")
    print("Health check available at: http://localhost:8000/health")
    print("=" * 50)
    
    # Start the server
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"\nError starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 