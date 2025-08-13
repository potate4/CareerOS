"""
Sample AI Configuration for CareerOS
Copy this file and rename it to ai_config.py, then fill in your actual API keys
"""

# AI Service Configuration
AI_CONFIG = {
    # OpenAI Configuration (Primary AI Service)
    "OPENAI_API_KEY": "your_openai_api_key_here",
    "OPENAI_MODEL": "gpt-3.5-turbo",
    "OPENAI_MAX_TOKENS": 2000,
    "OPENAI_TEMPERATURE": 0.7,
    
    # Alternative AI Services (Optional)
    "ANTHROPIC_API_KEY": "your_anthropic_api_key_here",
    "GOOGLE_AI_API_KEY": "your_google_ai_api_key_here",
    
    # AI Service Selection
    "PRIMARY_AI_SERVICE": "openai",
    "ENABLE_FALLBACK": True,
    "FALLBACK_AI_SERVICE": "rule_based"
}

# To use this configuration:
# 1. Copy this file to ai_config.py
# 2. Fill in your actual API keys
# 3. Import it in your main.py: from ai_config import AI_CONFIG
# 4. Set openai.api_key = AI_CONFIG["OPENAI_API_KEY"]
