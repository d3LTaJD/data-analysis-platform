#!/usr/bin/env python3
"""
Full-stack FastAPI + React startup script
This script sets up and starts both the FastAPI backend and React frontend
"""

import os
import sys
import time
import subprocess
from pathlib import Path

def print_banner():
    """Print startup banner"""
    print("🚀 DataWhiz Full-Stack Platform")
    print("=" * 40)
    print("Starting FastAPI Backend + React Frontend")
    print("=" * 40)

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python
    try:
        result = subprocess.run(["py", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ Python: {result.stdout.strip()}")
        else:
            print("✗ Python not found")
            return False
    except FileNotFoundError:
        print("✗ Python not found")
        return False
    
    # Check npm
    npm_cmd = None
    npm_commands = ['npm', 'npm.cmd', 'npm.exe']
    
    for cmd in npm_commands:
        try:
            result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                npm_cmd = cmd
                print(f"✓ npm: {result.stdout.strip()}")
                break
        except FileNotFoundError:
            continue
    
    if not npm_cmd:
        print("✗ npm not found")
        return False
    
    return True

def setup_backend():
    """Setup FastAPI backend"""
    print("\n🔧 Setting up FastAPI backend...")
    
    # Check if backend directory exists
    if not Path("backend").exists():
        print("✗ Backend directory not found")
        return False
    
    # Check if requirements.txt exists
    requirements_file = Path("backend/requirements.txt")
    if not requirements_file.exists():
        print("✗ requirements.txt not found")
        return False
    
    # Check if virtual environment exists
    venv_path = Path("backend/venv")
    if not venv_path.exists():
        print("📦 Creating virtual environment...")
        try:
            result = subprocess.run(["py", "-m", "venv", "backend/venv"], capture_output=True, text=True)
            if result.returncode != 0:
                print(f"✗ Failed to create virtual environment: {result.stderr}")
                return False
        except Exception as e:
            print(f"✗ Failed to create virtual environment: {e}")
            return False
    
    # Install dependencies
    print("📦 Installing Python dependencies...")
    try:
        if os.name == 'nt':  # Windows
            pip_cmd = "backend/venv/Scripts/pip"
        else:  # Unix/Linux
            pip_cmd = "backend/venv/bin/pip"
        
        result = subprocess.run([pip_cmd, "install", "-r", "backend/requirements.txt"], capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ Python dependencies installed")
        else:
            print(f"✗ Failed to install dependencies: {result.stderr}")
            return False
    except Exception as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False
    
    # Setup environment file
    env_file = Path("backend/.env")
    env_example = Path("backend/env.example")
    
    if not env_file.exists() and env_example.exists():
        print("📝 Creating .env file from template...")
        with open(env_example, 'r') as f:
            content = f.read()
        
        # Update with your OpenAI API key
        content = content.replace(
            "OPENAI_API_KEY=your_openai_api_key_here",
            "OPENAI_API_KEY=your_openai_api_key_here"
        )
        
        with open(env_file, 'w') as f:
            f.write(content)
        print("✓ Created .env file with your OpenAI API key")
    
    return True

def setup_frontend():
    """Setup React frontend"""
    print("\n🔧 Setting up React frontend...")
    
    # Find npm command
    npm_cmd = None
    npm_commands = ['npm', 'npm.cmd', 'npm.exe']
    
    for cmd in npm_commands:
        try:
            result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                npm_cmd = cmd
                break
        except FileNotFoundError:
            continue
    
    if not npm_cmd:
        print("✗ npm not found")
        return False
    
    # Check if node_modules exists
    if not Path("node_modules").exists():
        print("📦 Installing npm dependencies...")
        try:
            result = subprocess.run([npm_cmd, 'install'], capture_output=True, text=True)
            if result.returncode == 0:
                print("✓ npm dependencies installed")
            else:
                print(f"✗ npm install failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"✗ npm install failed: {e}")
            return False
    else:
        print("✓ npm dependencies already installed")
    
    return True

def start_backend():
    """Start FastAPI backend"""
    print("\n🚀 Starting FastAPI backend...")
    try:
        # Change to backend directory
        os.chdir("backend")
        
        # Start the FastAPI server
        process = subprocess.Popen([
            "py", "start_fastapi.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait a bit for server to start
        time.sleep(3)
        
        if process.poll() is None:
            print("✓ FastAPI backend started successfully")
            print("📖 API Documentation: http://localhost:8000/docs")
            print("🔍 Health Check: http://localhost:8000/health")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"✗ FastAPI backend failed to start: {stderr}")
            return None
    except Exception as e:
        print(f"✗ Failed to start FastAPI backend: {e}")
        return None

def start_frontend():
    """Start React frontend"""
    print("\n🚀 Starting React frontend...")
    try:
        # Change back to project root
        os.chdir("..")
        
        # Find npm command
        npm_cmd = None
        npm_commands = ['npm', 'npm.cmd', 'npm.exe']
        
        for cmd in npm_commands:
            try:
                result = subprocess.run([cmd, '--version'], capture_output=True, text=True)
                if result.returncode == 0:
                    npm_cmd = cmd
                    break
            except FileNotFoundError:
                continue
        
        if not npm_cmd:
            print("✗ npm not found")
            return None
        
        # Start the React development server
        process = subprocess.Popen([
            npm_cmd, "run", "dev"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Wait a bit for server to start
        time.sleep(5)
        
        if process.poll() is None:
            print("✓ React frontend started successfully")
            print("🌐 Frontend: http://localhost:5173")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"✗ React frontend failed to start: {stderr}")
            return None
    except Exception as e:
        print(f"✗ Failed to start React frontend: {e}")
        return None

def monitor_processes(backend_process, frontend_process):
    """Monitor running processes"""
    print("\n📊 Monitoring processes...")
    print("Press Ctrl+C to stop all services")
    
    try:
        while True:
            # Check if processes are still running
            if backend_process and backend_process.poll() is not None:
                print("⚠️  Backend process stopped")
                break
            
            if frontend_process and frontend_process.poll() is not None:
                print("⚠️  Frontend process stopped")
                break
            
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n🛑 Stopping services...")
        
        # Stop backend
        if backend_process:
            backend_process.terminate()
            print("✓ Backend stopped")
        
        # Stop frontend
        if frontend_process:
            frontend_process.terminate()
            print("✓ Frontend stopped")
        
        print("👋 Goodbye!")

def main():
    """Main function"""
    print_banner()
    
    # Check dependencies
    if not check_dependencies():
        print("✗ Dependencies check failed")
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("✗ Backend setup failed")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("✗ Frontend setup failed")
        sys.exit(1)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("✗ Failed to start backend")
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("✗ Failed to start frontend")
        backend_process.terminate()
        sys.exit(1)
    
    # Monitor processes
    monitor_processes(backend_process, frontend_process)

if __name__ == "__main__":
    main() 