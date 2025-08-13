"""
AI Configuration for CareerOS Learning Path Generator
Reads configuration from environment variables
"""

import os
from typing import Optional

class AIConfig:
    """Configuration for AI services"""
    
    def __init__(self):
        # Try to get config from Java backend first
        self._load_config()
    
    def _load_config(self):
        """Load configuration from environment variables"""
        # Load from environment variables
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "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")
        self.OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
        self.OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
        self.OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
        self.PRIMARY_AI_SERVICE = os.getenv("PRIMARY_AI_SERVICE", "openai")
        self.ENABLE_FALLBACK = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"
        self.FALLBACK_AI_SERVICE = os.getenv("FALLBACK_AI_SERVICE", "rule_based")
    
    @classmethod
    def is_openai_configured(cls) -> bool:
        """Check if OpenAI is properly configured"""
        config = cls()
        return bool(config.OPENAI_API_KEY)
    
    @classmethod
    def is_anthropic_configured(cls) -> bool:
        """Check if Anthropic is properly configured"""
        return bool(os.getenv("ANTHROPIC_API_KEY"))
    
    @classmethod
    def is_google_ai_configured(cls) -> bool:
        """Check if Google AI is properly configured"""
        return bool(os.getenv("GOOGLE_AI_API_KEY"))
    
    @classmethod
    def get_available_services(cls) -> list:
        """Get list of available AI services"""
        services = []
        if cls.is_openai_configured():
            services.append("openai")
        if cls.is_anthropic_configured():
            services.append("anthropic")
        if cls.is_google_ai_configured():
            services.append("google_ai")
        services.append("rule_based")  # Always available as fallback
        return services

# Global AI configuration instance
ai_config = AIConfig()
