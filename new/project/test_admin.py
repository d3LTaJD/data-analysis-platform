#!/usr/bin/env python3
"""
Test script for the admin functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_admin_workflow():
    """Test the complete admin workflow"""
    print("🧪 Testing DataWhiz Admin System")
    print("=" * 50)
    
    # Step 1: Create a regular user
    print("\n1️⃣ Creating regular user...")
    user_data = {
        "username": "regularuser",
        "email": "regular@example.com",
        "password": "password123",
        "first_name": "Regular",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code != 201:
        print(f"❌ Failed to create regular user: {response.json()}")
        return
    print("✅ Regular user created")
    
    # Step 2: Create an admin user
    print("\n2️⃣ Creating admin user...")
    admin_data = {
        "username": "adminuser",
        "email": "admin@example.com",
        "password": "adminpass123",
        "first_name": "Admin",
        "last_name": "User"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
    if response.status_code != 201:
        print(f"❌ Failed to create admin user: {response.json()}")
        return
    print("✅ Admin user created")
    
    # Step 3: Login as admin
    print("\n3️⃣ Logging in as admin...")
    login_data = {
        "username": "adminuser",
        "password": "adminpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Failed to login as admin: {response.json()}")
        return
    
    admin_session = response.json()
    session_token = admin_session.get('session_token')
    if not session_token:
        print("❌ No session token received")
        return
    print("✅ Admin logged in")
    
    # Step 4: Manually promote admin (in real app, this would be done by super admin)
    print("\n4️⃣ Promoting user to admin role...")
    # For testing, we'll need to manually update the database or create a super admin first
    print("⚠️ Note: In production, this would require super admin privileges")
    
    # Step 5: Test admin endpoints (assuming admin role is set)
    print("\n5️⃣ Testing admin endpoints...")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    
    # Get all users
    print("   📋 Getting all users...")
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    if response.status_code == 200:
        users = response.json()
        print(f"   ✅ Found {users.get('total_count', 0)} users")
    else:
        print(f"   ❌ Failed to get users: {response.json()}")
    
    # Get system stats
    print("   📊 Getting system stats...")
    response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print(f"   ✅ System stats retrieved")
        print(f"      Total users: {stats.get('stats', {}).get('users', {}).get('total', 0)}")
    else:
        print(f"   ❌ Failed to get stats: {response.json()}")
    
    # Get error logs
    print("   🚨 Getting error logs...")
    response = requests.get(f"{BASE_URL}/admin/errors", headers=headers)
    if response.status_code == 200:
        errors = response.json()
        print(f"   ✅ Found {errors.get('total_count', 0)} error logs")
    else:
        print(f"   ❌ Failed to get error logs: {response.json()}")
    
    # Get admin actions
    print("   📝 Getting admin actions...")
    response = requests.get(f"{BASE_URL}/admin/actions", headers=headers)
    if response.status_code == 200:
        actions = response.json()
        print(f"   ✅ Found {actions.get('total_count', 0)} admin actions")
    else:
        print(f"   ❌ Failed to get admin actions: {response.json()}")
    
    print("\n✅ Admin system test completed!")

def test_user_management():
    """Test user management functionality"""
    print("\n🔧 Testing User Management")
    print("=" * 30)
    
    # Login as admin
    login_data = {
        "username": "adminuser",
        "password": "adminpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print("❌ Failed to login as admin")
        return
    
    session_token = response.json().get('session_token')
    headers = {"Authorization": f"Bearer {session_token}"}
    
    # Get users to find a target user
    response = requests.get(f"{BASE_URL}/admin/users", headers=headers)
    if response.status_code != 200:
        print("❌ Failed to get users")
        return
    
    users = response.json().get('users', [])
    if not users:
        print("❌ No users found")
        return
    
    target_user = users[0]  # Use first user as target
    user_id = target_user['id']
    
    print(f"🎯 Testing with user: {target_user['username']} (ID: {user_id})")
    
    # Get user details
    print("   📋 Getting user details...")
    response = requests.get(f"{BASE_URL}/admin/users/{user_id}", headers=headers)
    if response.status_code == 200:
        details = response.json()
        print(f"   ✅ User details retrieved")
        print(f"      Role: {details.get('user', {}).get('role', 'unknown')}")
        print(f"      Active: {details.get('user', {}).get('is_active', False)}")
    else:
        print(f"   ❌ Failed to get user details: {response.json()}")
    
    # Test role update (if admin access is available)
    print("   🔄 Testing role update...")
    new_role = "admin" if target_user['role'] == 'user' else 'user'
    response = requests.put(f"{BASE_URL}/admin/users/{user_id}/role", 
                          json={"role": new_role}, headers=headers)
    if response.status_code == 200:
        print(f"   ✅ Role updated to {new_role}")
    else:
        print(f"   ❌ Failed to update role: {response.json()}")
    
    # Test status toggle
    print("   🔄 Testing status toggle...")
    response = requests.put(f"{BASE_URL}/admin/users/{user_id}/status", headers=headers)
    if response.status_code == 200:
        result = response.json()
        new_status = result.get('new_status', 'unknown')
        print(f"   ✅ Status toggled to {new_status}")
    else:
        print(f"   ❌ Failed to toggle status: {response.json()}")

if __name__ == "__main__":
    test_admin_workflow()
    test_user_management() 