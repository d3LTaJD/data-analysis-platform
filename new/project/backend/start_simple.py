#!/usr/bin/env python3
"""
DataWhiz Analytics FastAPI Backend Startup Script (Simplified - No Database)
"""

import os
import sys
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
        print("All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        print("Please install dependencies with: pip install fastapi uvicorn")
        return False

def main():
    """Main startup function"""
    print("Starting DataWhiz Analytics FastAPI Backend (Simplified)...")
    print("=" * 60)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    print("\n" + "=" * 60)
    print("Starting FastAPI server (No Database Mode)...")
    print("API Documentation will be available at: http://localhost:8000/docs")
    print("Health check available at: http://localhost:8000/health")
    print("=" * 60)
    
    # Start the server
    try:
        uvicorn.run(
            "main_simple:app",
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