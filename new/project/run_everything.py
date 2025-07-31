#!/usr/bin/env python3
"""
One-Click Runner for DataWhiz Project
Installs dependencies, starts backend, and frontend all together
"""

import subprocess
import sys
import os
import time
import threading
import requests
import webbrowser
from pathlib import Path

class DataWhizRunner:
    def __init__(self):
        self.project_dir = Path(__file__).parent
        self.backend_dir = self.project_dir / "backend"
        self.frontend_dir = self.project_dir
        self.backend_process = None
        self.frontend_process = None
        
    def print_header(self):
        """Print startup header"""
        print("=" * 60)
        print("🚀 DataWhiz - Complete Analytics Platform")
        print("=" * 60)
        print("📊 Business Analyst System")
        print("🔐 Authentication & Admin Panel")
        print("🎨 Modern React Frontend")
        print("=" * 60)
        
    def check_python_version(self):
        """Check if Python version is compatible"""
        print("🐍 Checking Python version...")
        try:
            # Try using 'py' command first (Windows)
            result = subprocess.run(['py', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version_str = result.stdout.strip()
                print(f"✅ {version_str} detected (using 'py' command)")
                return True
        except FileNotFoundError:
            pass
            
        try:
            # Fallback to 'python' command
            result = subprocess.run(['python', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                version_str = result.stdout.strip()
                print(f"✅ {version_str} detected (using 'python' command)")
                return True
        except FileNotFoundError:
            pass
            
        print("❌ Python not found. Please install Python 3.8+")
        return False
        
    def check_node_installed(self):
        """Check if Node.js is installed"""
        print("📦 Checking Node.js installation...")
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Node.js {result.stdout.strip()} detected")
                return True
            else:
                print("❌ Node.js not found")
                return False
        except FileNotFoundError:
            print("❌ Node.js not installed")
            return False
            
    def install_backend_dependencies(self):
        """Install Python backend dependencies"""
        print("\n📦 Installing backend dependencies...")
        try:
            # Check if virtual environment exists
            venv_path = self.backend_dir / "venv"
            if not venv_path.exists():
                print("🔧 Creating virtual environment...")
                # Try 'py' first, then fallback to sys.executable
                try:
                    subprocess.run(['py', '-m', 'venv', str(venv_path)], check=True)
                except (FileNotFoundError, subprocess.CalledProcessError):
                    subprocess.run([sys.executable, '-m', 'venv', str(venv_path)], check=True)
            
            # Determine pip path
            if os.name == 'nt':  # Windows
                pip_path = venv_path / "Scripts" / "pip.exe"
                python_path = venv_path / "Scripts" / "python.exe"
            else:  # Unix/Linux/Mac
                pip_path = venv_path / "bin" / "pip"
                python_path = venv_path / "bin" / "python"
            
            # Install requirements
            requirements_file = self.backend_dir / "requirements.txt"
            if requirements_file.exists():
                print("📥 Installing Python packages...")
                subprocess.run([str(pip_path), "install", "-r", str(requirements_file)], check=True)
                print("✅ Backend dependencies installed")
                return str(python_path)
            else:
                print("⚠️  requirements.txt not found, installing basic packages...")
                packages = [
                    "flask==3.0.0",
                    "flask-cors==4.0.0", 
                    "flask-limiter==3.5.0",
                    "flask-compress==1.14",
                    "werkzeug==3.0.1",
                    "pandas==2.1.4",
                    "numpy==1.24.3",
                    "scikit-learn==1.3.2",
                    "matplotlib==3.8.2",
                    "seaborn==0.13.0",
                    "plotly==5.17.0",
                    "openpyxl==3.1.2",
                    "python-dotenv==1.0.0",
                    "bcrypt==4.1.2",
                    "PyJWT==2.8.0",
                    "email-validator==2.1.0"
                ]
                for package in packages:
                    subprocess.run([str(pip_path), "install", package], check=True)
                print("✅ Basic packages installed")
                return str(python_path)
                
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install backend dependencies: {e}")
            return None
            
    def install_frontend_dependencies(self):
        """Install Node.js frontend dependencies"""
        print("\n📦 Installing frontend dependencies...")
        try:
            # Check if node_modules exists
            node_modules = self.frontend_dir / "node_modules"
            if not node_modules.exists():
                print("📥 Installing npm packages...")
                subprocess.run(['npm', 'install'], cwd=self.frontend_dir, check=True)
                print("✅ Frontend dependencies installed")
            else:
                print("✅ Frontend dependencies already installed")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install frontend dependencies: {e}")
            return False
            
    def start_backend(self, python_path):
        """Start the Flask backend server"""
        print("\n🚀 Starting backend server...")
        try:
            app_file = self.backend_dir / "app.py"
            if not app_file.exists():
                print("❌ Backend app.py not found")
                return False
                
            # Start backend in a separate thread
            def run_backend():
                try:
                    subprocess.run([python_path, str(app_file)], cwd=self.backend_dir)
                except Exception as e:
                    print(f"❌ Backend error: {e}")
                    
            backend_thread = threading.Thread(target=run_backend, daemon=True)
            backend_thread.start()
            self.backend_process = backend_thread
            
            # Wait for backend to start
            print("⏳ Waiting for backend to start...")
            for i in range(30):  # Wait up to 30 seconds
                try:
                    response = requests.get("http://localhost:5000/api/health", timeout=2)
                    if response.status_code == 200:
                        print("✅ Backend server started successfully")
                        return True
                except:
                    pass
                time.sleep(1)
                print(f"   Waiting... ({i+1}/30)")
                
            print("❌ Backend failed to start within 30 seconds")
            return False
            
        except Exception as e:
            print(f"❌ Failed to start backend: {e}")
            return False
            
    def start_frontend(self):
        """Start the React frontend development server"""
        print("\n🎨 Starting frontend development server...")
        try:
            # Start frontend in a separate thread
            def run_frontend():
                try:
                    subprocess.run(['npm', 'run', 'dev'], cwd=self.frontend_dir)
                except Exception as e:
                    print(f"❌ Frontend error: {e}")
                    
            frontend_thread = threading.Thread(target=run_frontend, daemon=True)
            frontend_thread.start()
            self.frontend_process = frontend_thread
            
            # Wait for frontend to start
            print("⏳ Waiting for frontend to start...")
            for i in range(30):  # Wait up to 30 seconds
                try:
                    response = requests.get("http://localhost:5173", timeout=2)
                    if response.status_code == 200:
                        print("✅ Frontend server started successfully")
                        return True
                except:
                    pass
                time.sleep(1)
                print(f"   Waiting... ({i+1}/30)")
                
            print("❌ Frontend failed to start within 30 seconds")
            return False
            
        except Exception as e:
            print(f"❌ Failed to start frontend: {e}")
            return False
            
    def open_browser(self):
        """Open browser to the application"""
        print("\n🌐 Opening browser...")
        try:
            # Wait a bit more for everything to be ready
            time.sleep(3)
            
            # Open main application
            webbrowser.open("http://localhost:5173")
            print("✅ Browser opened to DataWhiz application")
            
            # Also open Business Analyst directly
            webbrowser.open("http://localhost:5173/business-analyst")
            print("✅ Business Analyst interface opened")
            
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
            print("   Please manually open: http://localhost:5173")
            
    def run_tests(self):
        """Run system tests"""
        print("\n🧪 Running system tests...")
        try:
            test_file = self.project_dir / "test_business_analysis.py"
            if test_file.exists():
                print("📊 Testing Business Analyst system...")
                # Try 'py' first, then fallback to sys.executable
                try:
                    subprocess.run(['py', str(test_file)], check=True)
                except (FileNotFoundError, subprocess.CalledProcessError):
                    subprocess.run([sys.executable, str(test_file)], check=True)
                print("✅ System tests completed")
            else:
                print("⚠️  Test file not found, skipping tests")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Tests failed: {e}")
        except Exception as e:
            print(f"⚠️  Could not run tests: {e}")
            
    def show_status(self):
        """Show running status"""
        print("\n" + "=" * 60)
        print("🎉 DataWhiz is now running!")
        print("=" * 60)
        print("📊 Backend API: http://localhost:5000")
        print("🎨 Frontend App: http://localhost:5173")
        print("🏢 Business Analyst: http://localhost:5173/business-analyst")
        print("🔐 Admin Panel: http://localhost:5173/admin")
        print("=" * 60)
        print("📋 Available Features:")
        print("   ✅ User Registration & Authentication")
        print("   ✅ Admin Panel & User Management")
        print("   ✅ Business Analysis (KPIs, Trends, Segmentation)")
        print("   ✅ Data Cleaning & Preprocessing")
        print("   ✅ Interactive Visualizations")
        print("   ✅ Analysis History & Reports")
        print("=" * 60)
        print("🔑 Default Admin Credentials:")
        print("   Email: admin@datawhiz.com")
        print("   Password: admin123")
        print("=" * 60)
        print("⏹️  Press Ctrl+C to stop all services")
        print("=" * 60)
        
    def run(self):
        """Main runner method"""
        try:
            self.print_header()
            
            # Pre-flight checks
            if not self.check_python_version():
                return False
                
            if not self.check_node_installed():
                print("❌ Please install Node.js from https://nodejs.org/")
                return False
                
            # Install dependencies
            python_path = self.install_backend_dependencies()
            if not python_path:
                return False
                
            if not self.install_frontend_dependencies():
                return False
                
            # Start services
            if not self.start_backend(python_path):
                return False
                
            if not self.start_frontend():
                return False
                
            # Run tests
            self.run_tests()
            
            # Open browser
            self.open_browser()
            
            # Show status
            self.show_status()
            
            # Keep running
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n\n🛑 Shutting down DataWhiz...")
                print("✅ All services stopped")
                
        except Exception as e:
            print(f"❌ Runner failed: {e}")
            return False
            
        return True

if __name__ == "__main__":
    runner = DataWhizRunner()
    success = runner.run()
    sys.exit(0 if success else 1) 