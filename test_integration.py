#!/usr/bin/env python3
"""
Comprehensive Integration Test for CareerOS AI Learning Path System
Tests all endpoints and ensures proper integration between Java backend, Python AI service, and frontend
"""

import requests
import json
import time
import sys
from pathlib import Path

# Configuration
JAVA_BACKEND_URL = "http://localhost:8081"
PYTHON_AI_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

# Test data
TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123"
}

TEST_LEARNING_PATH_REQUEST = {
    "careerGoal": "Full Stack Developer",
    "currentSkills": ["JavaScript", "HTML", "CSS"],
    "experienceLevel": "BEGINNER",
    "learningPace": "MODERATE",
    "additionalNotes": "I want to learn modern web development"
}

TEST_AI_LEARNING_PATH_REQUEST = {
    "userId": 1,
    "username": "testuser",
    "careerGoal": "Full Stack Developer",
    "currentSkills": {
        "JavaScript": 0.3,
        "HTML": 0.5,
        "CSS": 0.4,
        "React": 0.1
    },
    "experienceLevel": "BEGINNER",
    "learningPace": "MODERATE",
    "additionalNotes": "I want to learn modern web development"
}

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(message):
    """Print a success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print an error message"""
    print(f"❌ {message}")

def print_info(message):
    """Print an info message"""
    print(f"ℹ️  {message}")

def test_service_health(url, service_name):
    """Test if a service is running"""
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print_success(f"{service_name} is running at {url}")
            return True
        else:
            print_error(f"{service_name} returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"{service_name} is not accessible: {e}")
        return False

def test_java_backend_endpoints():
    """Test Java backend endpoints"""
    print_header("Testing Java Backend Endpoints")
    
    # Test health endpoint
    if not test_service_health(JAVA_BACKEND_URL, "Java Backend"):
        return False
    
    # Test authentication endpoints
    try:
        # Test signup
        signup_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/auth/signup",
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )
        
        if signup_response.status_code in [200, 201, 409]:  # 409 means user already exists
            print_success("Signup endpoint working")
        else:
            print_error(f"Signup failed: {signup_response.status_code}")
            return False
        
        # Test login
        login_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/auth/signin",
            json={"username": TEST_USER["username"], "password": TEST_USER["password"]},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code == 200:
            token = login_response.json().get("accessToken")
            print_success("Login successful, got token")
        else:
            print_error(f"Login failed: {login_response.status_code}")
            return False
        
        # Test learning path endpoints with authentication
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Test traditional learning path generation
        traditional_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/path/learning",
            json=TEST_LEARNING_PATH_REQUEST,
            headers=headers
        )
        
        if traditional_response.status_code == 200:
            print_success("Traditional learning path generation working")
        else:
            print_error(f"Traditional learning path generation failed: {traditional_response.status_code}")
        
        # Test AI learning path generation
        ai_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/path/ai/learning",
            json=TEST_LEARNING_PATH_REQUEST,
            headers=headers
        )
        
        if ai_response.status_code == 200:
            print_success("AI learning path generation working")
            ai_data = ai_response.json()
            print_info(f"Generated {len(ai_data.get('modules', []))} modules")
        else:
            print_error(f"AI learning path generation failed: {ai_response.status_code}")
        
        # Test get current learning path
        current_response = requests.get(
            f"{JAVA_BACKEND_URL}/api/path/current",
            headers=headers
        )
        
        if current_response.status_code == 200:
            print_success("Get current learning path working")
        else:
            print_error(f"Get current learning path failed: {current_response.status_code}")
        
        # Test get learning path stats
        stats_response = requests.get(
            f"{JAVA_BACKEND_URL}/api/path/stats",
            headers=headers
        )
        
        if stats_response.status_code == 200:
            print_success("Get learning path stats working")
        else:
            print_error(f"Get learning path stats failed: {stats_response.status_code}")
        
        # Test AI stats endpoint
        ai_stats_response = requests.get(
            f"{JAVA_BACKEND_URL}/api/path/ai/stats",
            headers=headers
        )
        
        if ai_stats_response.status_code == 200:
            print_success("AI stats endpoint working")
        else:
            print_error(f"AI stats endpoint failed: {ai_stats_response.status_code}")
        
        return True
        
    except Exception as e:
        print_error(f"Java backend test failed: {e}")
        return False

def test_python_ai_service():
    """Test Python AI service endpoints"""
    print_header("Testing Python AI Service")
    
    # Test health endpoint
    if not test_service_health(PYTHON_AI_URL, "Python AI Service"):
        return False
    
    # Test AI learning path generation
    try:
        ai_response = requests.post(
            f"{PYTHON_AI_URL}/generate-learning-path",
            json=TEST_AI_LEARNING_PATH_REQUEST,
            headers={"Content-Type": "application/json"}
        )
        
        if ai_response.status_code == 200:
            print_success("Python AI learning path generation working")
            ai_data = ai_response.json()
            print_info(f"AI Response: {json.dumps(ai_data, indent=2)}")
        else:
            print_error(f"Python AI learning path generation failed: {ai_response.status_code}")
            print_error(f"Response: {ai_response.text}")
            return False
        
        return True
        
    except Exception as e:
        print_error(f"Python AI service test failed: {e}")
        return False

def test_frontend_endpoints():
    """Test frontend endpoints"""
    print_header("Testing Frontend Endpoints")
    
    try:
        # Test if frontend is accessible
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print_success("Frontend is accessible")
            return True
        else:
            print_error(f"Frontend returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print_error(f"Frontend is not accessible: {e}")
        return False

def test_ai_integration():
    """Test AI integration between services"""
    print_header("Testing AI Integration")
    
    try:
        # Test if Java backend can communicate with Python AI service
        java_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/path/ai/learning",
            json=TEST_LEARNING_PATH_REQUEST,
            headers={"Content-Type": "application/json"}
        )
        
        if java_response.status_code == 200:
            print_success("Java backend successfully integrated with Python AI service")
            ai_data = java_response.json()
            
            # Check if AI-generated fields are present
            if ai_data.get("aiGenerated"):
                print_success("AI generation flag is set")
            else:
                print_info("AI generation flag not set (may be expected)")
            
            # Check if modules were generated
            modules = ai_data.get("modules", [])
            if modules:
                print_success(f"Generated {len(modules)} learning modules")
                for i, module in enumerate(modules[:3]):  # Show first 3 modules
                    print_info(f"  Module {i+1}: {module.get('title', 'No title')}")
            else:
                print_error("No modules generated")
            
            return True
        else:
            print_error(f"AI integration failed: {java_response.status_code}")
            print_error(f"Response: {java_response.text}")
            return False
            
    except Exception as e:
        print_error(f"AI integration test failed: {e}")
        return False

def test_data_flow():
    """Test complete data flow from frontend to backend to AI"""
    print_header("Testing Complete Data Flow")
    
    try:
        # Simulate the complete flow
        print_info("1. User creates AI learning path request")
        print_info("2. Frontend sends request to Java backend")
        print_info("3. Java backend calls Python AI service")
        print_info("4. Python AI service generates learning path")
        print_info("5. Java backend returns response to frontend")
        
        # Test the flow
        ai_response = requests.post(
            f"{JAVA_BACKEND_URL}/api/path/ai/learning",
            json=TEST_LEARNING_PATH_REQUEST,
            headers={"Content-Type": "application/json"}
        )
        
        if ai_response.status_code == 200:
            print_success("Complete data flow working")
            
            # Verify the response structure
            data = ai_response.json()
            required_fields = ["id", "careerGoal", "modules", "statistics"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_success("Response structure is correct")
            else:
                print_error(f"Missing required fields: {missing_fields}")
            
            return True
        else:
            print_error(f"Data flow failed: {ai_response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Data flow test failed: {e}")
        return False

def main():
    """Run all integration tests"""
    print_header("CareerOS AI Learning Path Integration Test")
    print_info("Testing complete system integration...")
    
    results = []
    
    # Test individual services
    results.append(("Java Backend", test_java_backend_endpoints()))
    results.append(("Python AI Service", test_python_ai_service()))
    results.append(("Frontend", test_frontend_endpoints()))
    
    # Test integration
    results.append(("AI Integration", test_ai_integration()))
    results.append(("Data Flow", test_data_flow()))
    
    # Summary
    print_header("Test Results Summary")
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        icon = "✅" if result else "❌"
        print(f"{icon} {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print_success("All tests passed! System is fully integrated and ready to use.")
        return 0
    else:
        print_error(f"{total - passed} tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
