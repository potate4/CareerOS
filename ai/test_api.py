#!/usr/bin/env python3
"""
Test script for CareerOS AI Learning Path Service
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
JWT_TOKEN = "your_jwt_token_here"  # Replace with actual token from your Java backend

# Headers for authenticated requests
headers = {
    "Authorization": f"Bearer {JWT_TOKEN}",
    "Content-Type": "application/json"
}

def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing Health Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\n🔍 Testing Root Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_generate_learning_path():
    """Test the learning path generation endpoint"""
    print("\n🔍 Testing Learning Path Generation...")
    
    # Sample request data
    request_data = {
        "userId": 1,
        "username": "testuser",
        "email": "test@example.com",
        "careerGoal": "Full Stack Developer",
        "currentSkills": {
            "JavaScript": 0.6,
            "Python": 0.4,
            "HTML/CSS": 0.7
        },
        "experienceLevel": "INTERMEDIATE",
        "learningPace": "MODERATE",
        "additionalNotes": "Want to focus on modern web technologies"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/generate-learning-path",
            headers=headers,
            json=request_data
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Success! Generated learning path with {len(response.json()['modules'])} modules")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_market_trends():
    """Test the market trends endpoint"""
    print("\n🔍 Testing Market Trends...")
    
    try:
        response = requests.get(
            f"{BASE_URL}/skills/market-trends?skills=JavaScript,Python,React",
            headers=headers
        )
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Success! Retrieved market trends")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"❌ Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting CareerOS AI Backend Tests...")
    print(f"📍 Testing against: {BASE_URL}")
    print(f"⏰ Timestamp: {datetime.now().isoformat()}")
    
    # Test basic endpoints (no auth required)
    health_success = test_health_endpoint()
    root_success = test_root_endpoint()
    
    # Test authenticated endpoints
    if JWT_TOKEN != "your_jwt_token_here":
        learning_path_success = test_generate_learning_path()
        market_trends_success = test_market_trends()
        
        print(f"\n📊 Test Results:")
        print(f"Health Check: {'✅ PASS' if health_success else '❌ FAIL'}")
        print(f"Root Endpoint: {'✅ PASS' if root_success else '❌ FAIL'}")
        print(f"Learning Path Generation: {'✅ PASS' if learning_path_success else '❌ FAIL'}")
        print(f"Market Trends: {'✅ PASS' if market_trends_success else '❌ FAIL'}")
    else:
        print(f"\n📊 Test Results (Basic Endpoints Only):")
        print(f"Health Check: {'✅ PASS' if health_success else '❌ FAIL'}")
        print(f"Root Endpoint: {'✅ PASS' if root_success else '❌ FAIL'}")
        print(f"\n⚠️  Skipping authenticated endpoints - please set JWT_TOKEN in the script")
    
    print(f"\n🎯 To test authenticated endpoints:")
    print(f"1. Get a JWT token from your Java backend")
    print(f"2. Update JWT_TOKEN variable in this script")
    print(f"3. Run the script again")

if __name__ == "__main__":
    main()

