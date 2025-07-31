#!/usr/bin/env python3
"""
Backend startup script for DataWhiz
"""

import os
import sys
import subprocess
import time

def install_requirements():
    """Install Python requirements"""
    print("📦 Installing Python requirements...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"], 
                      check=True, cwd=os.path.dirname(os.path.abspath(__file__)))
        print("✅ Requirements installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False
    return True

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting Flask backend server...")
    try:
        # Change to backend directory and start the server
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
        subprocess.run([sys.executable, "app.py"], cwd=backend_dir, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to start backend: {e}")
        return False
    return True

if __name__ == "__main__":
    print("🔧 DataWhiz Backend Setup")
    print("=" * 40)
    
    # Install requirements
    if not install_requirements():
        sys.exit(1)
    
    # Start backend
    start_backend() 