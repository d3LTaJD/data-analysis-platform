#!/usr/bin/env python3
"""
Simple test script to verify DataWhiz system is working
"""

import requests
import time
import sys

def test_backend():
    """Test if backend is running"""
    print("🧪 Testing Backend...")
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_frontend():
    """Test if frontend is running"""
    print("🧪 Testing Frontend...")
    try:
        response = requests.get("http://localhost:5173", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
            return True
        else:
            print(f"❌ Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Frontend not accessible: {e}")
        return False

def test_business_analysis():
    """Test business analysis endpoint"""
    print("🧪 Testing Business Analysis API...")
    try:
        response = requests.get("http://localhost:5000/api/business-analysis/analyses", timeout=5)
        if response.status_code in [200, 401]:  # 401 is expected without auth
            print("✅ Business Analysis API is accessible")
            return True
        else:
            print(f"❌ Business Analysis API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Business Analysis API not accessible: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 DataWhiz System Test")
    print("=" * 40)
    
    # Wait a bit for services to start
    print("⏳ Waiting for services to start...")
    time.sleep(3)
    
    # Run tests
    backend_ok = test_backend()
    frontend_ok = test_frontend()
    api_ok = test_business_analysis()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"   Backend: {'✅' if backend_ok else '❌'}")
    print(f"   Frontend: {'✅' if frontend_ok else '❌'}")
    print(f"   Business Analysis API: {'✅' if api_ok else '❌'}")
    
    if backend_ok and frontend_ok and api_ok:
        print("\n🎉 All tests passed! DataWhiz is running correctly.")
        print("\n🌐 Access your application at:")
        print("   Main App: http://localhost:5173")
        print("   Business Analyst: http://localhost:5173/business-analyst")
        print("   Admin Panel: http://localhost:5173/admin")
        return True
    else:
        print("\n❌ Some tests failed. Please check the services.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 