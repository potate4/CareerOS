#!/usr/bin/env python3
"""
Test script for Java Backend Configuration Integration
Tests if Python backend can read AI config from Java backend
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def test_java_config_integration():
    """Test Java backend configuration integration"""
    print("🧪 Testing Java Backend Configuration Integration...")
    
    try:
        # Test Java config reader
        from core.java_config_reader import JavaConfigReader
        
        print("✅ Java config reader import successful")
        
        # Create config reader
        config_reader = JavaConfigReader("http://localhost:8081")
        print("✅ Java config reader initialized")
        
        # Test getting config
        config = config_reader.get_ai_config()
        print(f"✅ Configuration loaded: {len(config)} items")
        
        # Test specific config values
        openai_key = config_reader.get_openai_api_key()
        if openai_key:
            print(f"✅ OpenAI API key found: {openai_key[:10]}...")
        else:
            print("⚠️ OpenAI API key not found")
        
        model = config_reader.get_openai_model()
        print(f"✅ OpenAI model: {model}")
        
        max_tokens = config_reader.get_openai_max_tokens()
        print(f"✅ Max tokens: {max_tokens}")
        
        temperature = config_reader.get_openai_temperature()
        print(f"✅ Temperature: {temperature}")
        
        primary_service = config_reader.get_primary_service()
        print(f"✅ Primary service: {primary_service}")
        
        fallback_enabled = config_reader.is_fallback_enabled()
        print(f"✅ Fallback enabled: {fallback_enabled}")
        
        print("\n🎉 Java backend configuration integration test passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_ai_config_with_java():
    """Test AI config using Java backend configuration"""
    print("\n🤖 Testing AI Config with Java Backend...")
    
    try:
        from core.ai_config import AIConfig
        
        print("✅ AI config import successful")
        
        # Create AI config (should load from Java backend)
        ai_config = AIConfig()
        print("✅ AI config initialized")
        
        # Check if OpenAI is configured
        if AIConfig.is_openai_configured():
            print("✅ OpenAI is properly configured")
            print(f"   Model: {ai_config.OPENAI_MODEL}")
            print(f"   Max Tokens: {ai_config.OPENAI_MAX_TOKENS}")
            print(f"   Temperature: {ai_config.OPENAI_TEMPERATURE}")
        else:
            print("⚠️ OpenAI not configured, will use fallback")
        
        # Check available services
        services = AIConfig.get_available_services()
        print(f"✅ Available services: {', '.join(services)}")
        
        print("\n🎉 AI config with Java backend test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 CareerOS Java Backend Configuration Test Suite")
    print("=" * 60)
    
    # Test Java config integration
    java_test_passed = test_java_config_integration()
    
    # Test AI config with Java backend
    ai_test_passed = test_ai_config_with_java()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   Java Config Integration: {'✅ PASSED' if java_test_passed else '❌ FAILED'}")
    print(f"   AI Config with Java: {'✅ PASSED' if ai_test_passed else '❌ FAILED'}")
    
    if java_test_passed and ai_test_passed:
        print("\n🎯 Java backend configuration integration is working!")
        print("\n📝 Next steps:")
        print("   1. Make sure your Java backend is running on port 8081")
        print("   2. Set your OpenAI API key in Java backend's application.properties")
        print("   3. Start your Python AI backend: python app/main.py")
        print("   4. Test the AI learning path generation")
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        print("\n🔧 Troubleshooting:")
        print("   1. Make sure Java backend is running")
        print("   2. Check if the config endpoint is accessible")
        print("   3. Verify your application.properties configuration")

if __name__ == "__main__":
    main()
