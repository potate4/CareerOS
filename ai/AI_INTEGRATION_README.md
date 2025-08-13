# CareerOS AI Integration Guide

This guide explains how to integrate AI models for generating personalized learning paths in CareerOS.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd ai
pip install -r requirements.txt
```

### 2. Set Up OpenAI API Key
```bash
# Set your OpenAI API key as an environment variable
export OPENAI_API_KEY="your_openai_api_key_here"

# Or create a .env file
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
```

### 3. Test the Integration
```bash
python test_ai_integration.py
```

### 4. Start the AI Service
```bash
python app/main.py
```

## 🤖 AI Models Supported

### Primary: OpenAI GPT
- **Model**: GPT-3.5-turbo (default) or GPT-4
- **Features**: 
  - Personalized learning path generation
  - Market trend analysis
  - Skill gap assessment
  - Adaptive learning strategies
- **Cost**: ~$0.002 per 1K tokens

### Fallback: Rule-Based Engine
- **Features**: 
  - Predefined skill mappings
  - Difficulty progression
  - Market demand scoring
- **Cost**: Free (no API calls)
- **Use Case**: When AI service is unavailable

## 🔧 Configuration

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# AI Service Selection
PRIMARY_AI_SERVICE=openai
ENABLE_FALLBACK=true
FALLBACK_AI_SERVICE=rule_based
```

### AI Configuration File
The service automatically loads configuration from `app/core/ai_config.py`:

```python
class AIConfig:
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    PRIMARY_AI_SERVICE: str = os.getenv("PRIMARY_AI_SERVICE", "openai")
    ENABLE_FALLBACK: bool = os.getenv("ENABLE_FALLBACK", "true").lower() == "true"
```

## 📊 How It Works

### 1. Request Processing
```python
# Frontend sends learning path request
request = {
    "careerGoal": "Full Stack Developer",
    "experienceLevel": "BEGINNER",
    "learningPace": "MODERATE",
    "currentSkills": {"HTML": 0.3, "CSS": 0.2},
    "interviewPerformance": {...},
    "marketTrends": [...],
    "learningHistory": {...}
}
```

### 2. AI Analysis
The AI service:
- Analyzes current skills vs. required skills
- Considers interview performance and learning history
- Evaluates market trends and demand
- Generates personalized learning modules

### 3. Response Generation
```python
response = {
    "modules": [
        {
            "title": "JavaScript Fundamentals",
            "description": "Learn modern JavaScript ES6+ features...",
            "skillFocus": "JavaScript",
            "difficultyLevel": "BEGINNER",
            "estimatedHours": 25,
            "marketRelevance": 9.2,
            "prerequisites": "Basic HTML & CSS"
        }
    ],
    "estimatedWeeks": 16,
    "marketDemandScore": 8.8,
    "skillGapAnalysis": {...},
    "learningStrategy": "Focus on hands-on projects..."
}
```

## 🧪 Testing

### Test AI Service
```bash
python test_ai_integration.py
```

### Test API Endpoint
```bash
# Using curl
curl -X POST http://localhost:8000/generate-learning-path \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{
    "careerGoal": "Data Scientist",
    "experienceLevel": "BEGINNER",
    "learningPace": "MODERATE",
    "currentSkills": {"Python": 0.5}
  }'

# Using Postman
POST http://localhost:8000/generate-learning-path
Headers: Authorization: Bearer your_token
Body: JSON with learning path request
```

### Test Health Check
```bash
curl http://localhost:8000/health
```

## 🔄 Fallback Mechanism

The system automatically falls back to rule-based generation when:

1. **OpenAI API is unavailable**
2. **API key is invalid or expired**
3. **Rate limits are exceeded**
4. **Network issues occur**

Fallback features:
- Predefined skill mappings for common career paths
- Progressive difficulty levels
- Market demand scoring
- Estimated completion times

## 📈 Performance Optimization

### Token Usage Optimization
- **Prompt Engineering**: Structured prompts for consistent JSON responses
- **Response Validation**: Ensures AI responses meet expected format
- **Fallback Strategy**: Rule-based generation when AI fails

### Caching Strategy
- **Response Caching**: Cache similar requests to reduce API calls
- **Skill Mapping Cache**: Pre-computed skill relationships
- **Market Data Cache**: Cached market trend information

## 🚨 Error Handling

### Common Errors
1. **Invalid API Key**: Falls back to rule-based generation
2. **Rate Limit Exceeded**: Automatic retry with exponential backoff
3. **Invalid Response Format**: Response validation and fallback
4. **Network Timeout**: Configurable timeout and retry logic

### Logging
```python
# Check logs for AI service status
logger.info("🤖 Using OpenAI GPT for learning path generation")
logger.error("❌ OpenAI generation failed: {error}")
logger.info("🔄 Falling back to rule-based generation")
```

## 🔮 Future Enhancements

### Planned AI Models
- **Anthropic Claude**: Alternative to GPT for better reasoning
- **Google PaLM**: Specialized for technical content
- **Local Models**: On-premise AI for privacy-sensitive deployments

### Advanced Features
- **Multi-Modal Learning**: Video and audio content analysis
- **Real-time Adaptation**: Dynamic learning path updates
- **Collaborative Learning**: Group-based path optimization
- **Industry-Specific Models**: Specialized for different domains

## 💰 Cost Management

### OpenAI Cost Estimation
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **Typical Request**: 500-1000 tokens
- **Typical Response**: 1000-2000 tokens
- **Cost per Request**: ~$0.003-0.006

### Cost Optimization
- **Response Length Limits**: Configurable max tokens
- **Caching**: Reduce duplicate API calls
- **Fallback Usage**: Use rule-based generation for simple requests
- **Batch Processing**: Group similar requests

## 🛡️ Security & Privacy

### Data Handling
- **No Data Storage**: AI requests are not stored
- **Token Validation**: JWT token verification
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize user inputs

### API Security
- **Environment Variables**: Secure API key storage
- **HTTPS Only**: Encrypted communication
- **CORS Configuration**: Controlled cross-origin access
- **Request Logging**: Audit trail for debugging

## 📞 Support & Troubleshooting

### Common Issues
1. **Import Errors**: Check Python path and dependencies
2. **API Key Issues**: Verify environment variable setup
3. **Network Problems**: Check firewall and proxy settings
4. **Memory Issues**: Monitor token usage and response sizes

### Debug Mode
```bash
# Enable debug logging
export VITE_DEBUG_LOGGING=true

# Check service logs
python app/main.py --log-level DEBUG
```

### Getting Help
- Check the logs for detailed error messages
- Verify your OpenAI API key and billing status
- Test with the provided test scripts
- Review the configuration settings

## 🎯 Best Practices

### For Developers
1. **Always implement fallback mechanisms**
2. **Validate AI responses before using them**
3. **Monitor API usage and costs**
4. **Use structured prompts for consistent results**
5. **Implement proper error handling**

### For Users
1. **Provide detailed skill assessments**
2. **Include relevant learning history**
3. **Specify realistic learning pace**
4. **Add context through additional notes**
5. **Review and adjust generated paths**

---

**Happy Learning! 🚀**

For more information, check the main CareerOS documentation or contact the development team.
