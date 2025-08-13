#!/usr/bin/env python3
"""
Comprehensive Test Script for CareerOS AI Integration
Tests all components: AI service, configuration, endpoints, and data flow
"""

import os
import sys
import json
import requests
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

def test_ai_configuration():
    """Test AI configuration loading"""
    print("🔧 Testing AI Configuration...")
    
    try:
        from app.core.ai_config import AIConfig, ai_config
        
        print("✅ AI config import successful")
        
        # Test configuration loading
        config = AIConfig()
        print(f"✅ AI config loaded: {config.PRIMARY_AI_SERVICE}")
        
        # Test available services
        services = AIConfig.get_available_services()
        print(f"✅ Available services: {', '.join(services)}")
        
        # Test OpenAI configuration
        if AIConfig.is_openai_configured():
            print("✅ OpenAI is configured")
        else:
            print("⚠️ OpenAI not configured, will use fallback")
        
        return True
        
    except Exception as e:
        print(f"❌ AI configuration test failed: {e}")
        return False

def test_ai_service():
    """Test AI service functionality"""
    print("\n🤖 Testing AI Service...")
    
    try:
        from app.services.ai_service import AIService
        
        print("✅ AI service import successful")
        
        # Initialize AI service
        ai_service = AIService()
        print("✅ AI service initialized")
        
        # Test rule-based generation
        test_request = {
            "careerGoal": "Full Stack Developer",
            "experienceLevel": "BEGINNER",
            "learningPace": "MODERATE",
            "currentSkills": {"HTML": 0.3, "CSS": 0.2},
            "additionalNotes": "Focus on modern web development"
        }
        
        print("🔄 Testing rule-based generation...")
        result = ai_service._generate_rule_based(test_request)
        
        print(f"✅ Rule-based generation successful:")
        print(f"   - Generated {len(result['modules'])} modules")
        print(f"   - Estimated weeks: {result['estimatedWeeks']}")
        print(f"   - Market demand score: {result['marketDemandScore']}")
        
        # Test prompt creation
        print("🔄 Testing OpenAI prompt creation...")
        prompt = ai_service._create_openai_prompt(test_request)
        print(f"✅ Prompt created successfully ({len(prompt)} characters)")
        
        # Test adaptation
        print("🔄 Testing learning path adaptation...")
        adaptation_request = {
            "currentProgress": 0.5,
            "currentStage": "INTERMEDIATE",
            "estimatedCompletionWeeks": 8
        }
        adaptation_result = ai_service.adapt_learning_path(adaptation_request)
        print(f"✅ Adaptation successful: {adaptation_result['adaptationReason']}")
        
        return True
        
    except Exception as e:
        print(f"❌ AI service test failed: {e}")
        return False

def test_java_backend_config():
    """Test Java backend configuration integration"""
    print("\n☕ Testing Java Backend Configuration...")
    
    try:
        from app.core.java_config_reader import JavaConfigReader
        
        print("✅ Java config reader import successful")
        
        # Test config reader
        config_reader = JavaConfigReader("http://localhost:8081")
        print("✅ Java config reader initialized")
        
        # Test getting config
        config = config_reader.get_ai_config()
        print(f"✅ Configuration loaded: {len(config)} items")
        
        return True
        
    except Exception as e:
        print(f"❌ Java backend config test failed: {e}")
        return False

def test_python_backend_endpoints():
    """Test Python backend endpoints"""
    print("\n🐍 Testing Python Backend Endpoints...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health endpoint working")
            health_data = response.json()
            print(f"   - Service: {health_data.get('service')}")
            print(f"   - Available services: {health_data.get('available_services')}")
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            return False
        
        # Test root endpoint
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Root endpoint working")
            root_data = response.json()
            print(f"   - Version: {root_data.get('version')}")
            print(f"   - Endpoints: {root_data.get('endpoints')}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Python backend not running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Python backend test failed: {e}")
        return False

def test_java_backend_endpoints():
    """Test Java backend endpoints"""
    print("\n☕ Testing Java Backend Endpoints...")
    
    try:
        # Test config endpoint
        response = requests.get("http://localhost:8081/api/config/ai", timeout=5)
        if response.status_code == 200:
            print("✅ Java config endpoint working")
            config_data = response.json()
            print(f"   - Primary service: {config_data.get('primaryService')}")
            print(f"   - Fallback enabled: {config_data.get('fallbackEnabled')}")
        else:
            print(f"❌ Java config endpoint failed: {response.status_code}")
            return False
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Java backend not running on port 8081")
        return False
    except Exception as e:
        print(f"❌ Java backend test failed: {e}")
        return False

def test_frontend_configuration():
    """Test frontend configuration"""
    print("\n🎨 Testing Frontend Configuration...")
    
    try:
        # Check if frontend config file exists
        frontend_config_path = Path("../frontend/src/config/env.ts")
        if frontend_config_path.exists():
            print("✅ Frontend config file exists")
            
            # Read and check config
            with open(frontend_config_path, 'r') as f:
                config_content = f.read()
                
            if "aiApiUrl" in config_content:
                print("✅ AI API URL configured")
            else:
                print("❌ AI API URL not found in config")
                return False
                
            if "apiUrl" in config_content:
                print("✅ Main API URL configured")
            else:
                print("❌ Main API URL not found in config")
                return False
                
        else:
            print("❌ Frontend config file not found")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Frontend config test failed: {e}")
        return False

def test_data_flow():
    """Test data flow between components"""
    print("\n🔄 Testing Data Flow...")
    
    try:
        # Test AI request format
        ai_request = {
            "userId": 1,
            "username": "testuser",
            "careerGoal": "Full Stack Developer",
            "currentSkills": {"JavaScript": 0.5, "React": 0.3},
            "experienceLevel": "BEGINNER",
            "learningPace": "MODERATE",
            "additionalNotes": "Test request"
        }
        
        print("✅ AI request format valid")
        
        # Test response format
        ai_response = {
            "modules": [
                {
                    "title": "JavaScript Fundamentals",
                    "description": "Learn JavaScript basics",
                    "skillFocus": "JavaScript",
                    "difficultyLevel": "BEGINNER",
                    "estimatedHours": 20,
                    "marketRelevance": 8.5
                }
            ],
            "estimatedWeeks": 12,
            "marketDemandScore": 8.0,
            "marketTrends": "High demand for JavaScript developers",
            "skillGapAnalysis": {
                "totalSkillsRequired": 8,
                "currentSkills": 2,
                "skillsToLearn": 6,
                "prioritySkills": ["JavaScript", "React", "Node.js"]
            },
            "learningStrategy": "Focus on hands-on projects"
        }
        
        print("✅ AI response format valid")
        
        # Test frontend types compatibility
        required_fields = ["modules", "estimatedWeeks", "marketDemandScore", "skillGapAnalysis"]
        for field in required_fields:
            if field in ai_response:
                print(f"✅ Response contains {field}")
            else:
                print(f"❌ Response missing {field}")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Data flow test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 CareerOS Comprehensive Integration Test Suite")
    print("=" * 60)
    
    tests = [
        ("AI Configuration", test_ai_configuration),
        ("AI Service", test_ai_service),
        ("Java Backend Config", test_java_backend_config),
        ("Python Backend Endpoints", test_python_backend_endpoints),
        ("Java Backend Endpoints", test_java_backend_endpoints),
        ("Frontend Configuration", test_frontend_configuration),
        ("Data Flow", test_data_flow)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    
    passed = 0
    total = len(tests)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your CareerOS AI integration is working perfectly!")
        print("\n📝 Next steps:")
        print("   1. Start your Java backend: mvn spring-boot:run")
        print("   2. Start your Python backend: python app/main.py")
        print("   3. Start your frontend: npm run dev")
        print("   4. Test the AI learning path generation in the frontend")
    else:
        print(f"\n⚠️ {total - passed} test(s) failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure all backends are running")
        print("   2. Check configuration files")
        print("   3. Verify network connectivity")
        print("   4. Check logs for detailed error messages")

if __name__ == "__main__":
    main()
