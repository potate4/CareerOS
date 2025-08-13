"""
Configuration reader that fetches AI settings from Java backend
"""
import requests
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class JavaConfigReader:
    """Reads AI configuration from Java backend"""
    
    def __init__(self, java_backend_url: str = "http://localhost:8081"):
        self.java_backend_url = java_backend_url
        self.config_cache = None
        self.cache_timestamp = 0
        self.cache_duration = 300  # 5 minutes
    
    def get_ai_config(self) -> Dict[str, Any]:
        """Get AI configuration from Java backend"""
        try:
            # Try to get from Java backend first
            config = self._fetch_from_java_backend()
            if config:
                logger.info("✅ AI configuration loaded from Java backend")
                return config
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch config from Java backend: {e}")
        
        # Fallback to environment variables
        logger.info("📝 Using environment variables as fallback")
        return self._get_from_environment()
    
    def _fetch_from_java_backend(self) -> Optional[Dict[str, Any]]:
        """Fetch configuration from Java backend"""
        try:
            # Create a simple endpoint in Java backend to expose config
            # For now, we'll try to read the properties file directly
            response = requests.get(f"{self.java_backend_url}/api/config/ai", timeout=5)
            if response.status_code == 200:
                return response.json()
        except requests.RequestException as e:
            logger.debug(f"Java backend config endpoint not available: {e}")
        
        return None
    
    def _get_from_environment(self) -> Dict[str, Any]:
        """Get configuration from environment variables"""
        return {
            "openai_api_key": os.getenv("OPENAI_API_KEY"),
            "openai_model": os.getenv("OPENAI_MODEL", "gpt-3.5-turbo"),
            "openai_max_tokens": int(os.getenv("OPENAI_MAX_TOKENS", "2000")),
            "openai_temperature": float(os.getenv("OPENAI_TEMPERATURE", "0.7")),
            "primary_service": os.getenv("PRIMARY_AI_SERVICE", "openai"),
            "fallback_enabled": os.getenv("ENABLE_FALLBACK", "true").lower() == "true",
            "fallback_service": os.getenv("FALLBACK_AI_SERVICE", "rule_based")
        }
    
    def get_openai_api_key(self) -> Optional[str]:
        """Get OpenAI API key from Java backend or environment"""
        config = self.get_ai_config()
        return config.get("openai_api_key")
    
    def get_openai_model(self) -> str:
        """Get OpenAI model from Java backend or environment"""
        config = self.get_ai_config()
        return config.get("openai_model", "gpt-3.5-turbo")
    
    def get_openai_max_tokens(self) -> int:
        """Get OpenAI max tokens from Java backend or environment"""
        config = self.get_ai_config()
        return config.get("openai_max_tokens", 2000)
    
    def get_openai_temperature(self) -> float:
        """Get OpenAI temperature from Java backend or environment"""
        config = self.get_ai_config()
        return config.get("openai_temperature", 0.7)
    
    def get_primary_service(self) -> str:
        """Get primary AI service from Java backend or environment"""
        config = self.get_ai_config()
        return config.get("primary_service", "openai")
    
    def is_fallback_enabled(self) -> bool:
        """Check if fallback is enabled"""
        config = self.get_ai_config()
        return config.get("fallback_enabled", True)
    
    def get_fallback_service(self) -> str:
        """Get fallback service type"""
        config = self.get_ai_config()
        return config.get("fallback_service", "rule_based")

# Global config reader instance
java_config_reader = JavaConfigReader()
