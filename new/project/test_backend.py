#!/usr/bin/env python3
"""
Simple test script for the backend authentication system
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_health():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_register():
    """Test user registration"""
    print("\n🔍 Testing user registration...")
    user_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        print(f"✅ Registration: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Registration failed: {e}")
        return None

def test_login():
    """Test user login"""
    print("\n🔍 Testing user login...")
    login_data = {
        "username": "testuser",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"✅ Login: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Login failed: {e}")
        return None

def test_profile(session_token):
    """Test getting user profile"""
    print("\n🔍 Testing get profile...")
    
    try:
        headers = {"Authorization": f"Bearer {session_token}"}
        response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
        print(f"✅ Get profile: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Get profile failed: {e}")
        return None

def test_update_profile(session_token):
    """Test updating user profile"""
    print("\n🔍 Testing update profile...")
    
    update_data = {
        "first_name": "Updated",
        "last_name": "Name"
    }
    
    try:
        headers = {"Authorization": f"Bearer {session_token}"}
        response = requests.put(f"{BASE_URL}/auth/profile", json=update_data, headers=headers)
        print(f"✅ Update profile: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Update profile failed: {e}")
        return None

def test_logout(session_token):
    """Test user logout"""
    print("\n🔍 Testing user logout...")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/logout", json={"session_token": session_token})
        print(f"✅ Logout: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.json()
    except Exception as e:
        print(f"❌ Logout failed: {e}")
        return None

def main():
    """Run all tests"""
    print("🧪 Testing DataWhiz Backend Authentication System")
    print("=" * 50)
    
    # Test health check
    if not test_health():
        print("❌ Backend is not running. Please start the backend first.")
        return
    
    # Test registration
    register_result = test_register()
    if not register_result or not register_result.get('success'):
        print("❌ Registration test failed")
        return
    
    # Test login
    login_result = test_login()
    if not login_result or not login_result.get('success'):
        print("❌ Login test failed")
        return
    
    session_token = login_result.get('session_token')
    if not session_token:
        print("❌ No session token received")
        return
    
    # Test profile operations
    test_profile(session_token)
    test_update_profile(session_token)
    
    # Test logout
    test_logout(session_token)
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    main() 