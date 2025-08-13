#!/usr/bin/env python3
"""
Test script for CareerOS AI Learning Path Service
Tests the AI integration with OpenAI GPT
"""

import os
import sys
import json
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def test_ai_service():
    """Test the AI service without making actual API calls"""
    print("🧪 Testing AI Service Integration...")
    
    try:
        # Test imports
        from app.services.ai_service import AIService
        from app.core.ai_config import AIConfig
        
        print("✅ AI service imports successful")
        
        # Test configuration
        config = AIConfig()
        print(f"✅ AI config loaded: {config.PRIMARY_AI_SERVICE}")
        
        # Test AI service initialization
        ai_service = AIService()
        print(f"✅ AI service initialized successfully")
        
        # Check if OpenAI is configured
        if ai_service.openai_client:
            print("✅ OpenAI client is available")
        else:
            print("⚠️ OpenAI client not available, will use rule-based fallback")
        
        # Test rule-based generation (no API calls needed)
        test_request = {
            "careerGoal": "Full Stack Developer",
            "experienceLevel": "BEGINNER",
            "learningPace": "MODERATE",
            "currentSkills": {"HTML": 0.3, "CSS": 0.2},
            "additionalNotes": "Focus on modern web development"
        }
        
        print("🔄 Testing rule-based learning path generation...")
        result = ai_service._generate_rule_based(test_request)
        
        print(f"✅ Rule-based generation successful:")
        print(f"   - Generated {len(result['modules'])} modules")
        print(f"   - Estimated weeks: {result['estimatedWeeks']}")
        print(f"   - Market demand score: {result['marketDemandScore']}")
        
        # Test prompt creation
        print("🔄 Testing OpenAI prompt creation...")
        prompt = ai_service._create_openai_prompt(test_request)
        print(f"✅ Prompt created successfully ({len(prompt)} characters)")
        
        print("\n🎉 All AI service tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_openai_configuration():
    """Test OpenAI configuration"""
    print("\n🔑 Testing OpenAI Configuration...")
    
    # Check environment variables
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        print(f"✅ OpenAI API key found: {openai_key[:10]}...")
        
        # Test if it's a valid key format
        if openai_key.startswith("sk-") and len(openai_key) > 20:
            print("✅ OpenAI API key format appears valid")
            return True
        else:
            print("⚠️  OpenAI API key format may be invalid")
            return False
    else:
        print("❌ OpenAI API key not found in environment variables")
        print("   Set OPENAI_API_KEY environment variable to test GPT integration")
        return False

def main():
    """Main test function"""
    print("🚀 CareerOS AI Integration Test Suite")
    print("=" * 50)
    
    # Test basic AI service
    ai_test_passed = test_ai_service()
    
    # Test OpenAI configuration
    openai_test_passed = test_openai_configuration()
    
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   AI Service: {'✅ PASSED' if ai_test_passed else '❌ FAILED'}")
    print(f"   OpenAI Config: {'✅ PASSED' if openai_test_passed else '⚠️  SKIPPED'}")
    
    if ai_test_passed:
        print("\n🎯 AI Service is ready to use!")
        if openai_test_passed:
            print("🤖 OpenAI GPT integration is configured and ready!")
        else:
            print("📚 Rule-based generation is available as fallback")
        
        print("\n📝 Next steps:")
        print("   1. Start your Python backend: python app/main.py")
        print("   2. Test the API endpoint: POST /generate-learning-path")
        print("   3. Check the logs for AI service status")
    else:
        print("\n❌ AI Service setup failed. Check the errors above.")

if __name__ == "__main__":
    main()
