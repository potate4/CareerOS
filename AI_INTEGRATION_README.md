# CareerOS AI-Powered Learning Path System

## 🚀 Overview

The CareerOS Learning Path System has been enhanced with AI/ML capabilities to provide personalized, adaptive learning experiences. The system analyzes career goals, current skills, interview performance, and market trends to generate intelligent learning paths that continuously adapt based on user progress and market changes.

## 🏗️ System Architecture

### **3-Tier Architecture**
- **Frontend**: React + TypeScript with Tailwind CSS
- **Backend**: Spring Boot (Java) with JPA/Hibernate + PostgreSQL
- **AI/ML Service**: FastAPI (Python) with intelligent learning path generation

### **Key Components**
1. **AI Learning Path Generator** - Analyzes user data and generates personalized paths
2. **Adaptive Learning Engine** - Continuously adapts paths based on progress and market changes
3. **Skill Mastery Tracking** - Monitors individual skill development and progress
4. **Market Trend Analysis** - Integrates real-time market demand data
5. **Interview Performance Integration** - Factors in interview results for better recommendations

## 🔧 Backend Enhancements

### **New Models**

#### **Enhanced LearningPath**
- `aiGenerated`: Boolean flag for AI-generated paths
- `marketDemandScore`: Market demand rating (1-10)
- `skillMasteryThreshold`: Threshold for skill mastery (default: 0.8)
- `adaptationFrequencyDays`: How often to adapt the path (default: 7 days)
- `interviewPerformanceScore`: User's interview performance score
- `currentMarketTrends`: JSON string of current market trends

#### **Enhanced LearningModule**
- `skillMasteryLevel`: Current mastery level (0.0-1.0)
- `prerequisites`: Required skills before starting this module
- `marketRelevanceScore`: Market relevance rating (1-10)
- `timeSpentHours`: Actual time spent on the module
- `aiRecommended`: Boolean flag for AI-recommended modules
- `adaptationPriority`: Priority for adaptation (1-5)

#### **New SkillMastery Model**
- Tracks individual skill progress across users
- Stores assessment scores and market demand levels
- Enables trending analysis and skill gap identification

#### **New MarketTrend Model**
- Real-time market demand data for skills
- Salary trends and job posting counts
- Growth rate percentages and confidence scores

### **New Services**

#### **AILearningPathService**
- `generateAILearningPath()`: Creates AI-powered learning paths
- `adaptLearningPath()`: Adapts existing paths based on progress
- `updateSkillMastery()`: Updates skill mastery with progress tracking
- Integrates with FastAPI AI service for intelligent recommendations

### **New Endpoints**

#### **AI-Powered Endpoints**
- `POST /api/path/ai/learning` - Generate AI learning path
- `POST /api/path/ai/adapt/{id}` - Adapt existing learning path
- `POST /api/path/ai/progress` - Update progress with mastery tracking
- `GET /api/path/ai/stats` - Get AI-enhanced statistics

#### **Enhanced Traditional Endpoints**
- `POST /api/path/learning` - Generate traditional learning path
- `GET /api/path/current` - Get current learning path
- `POST /api/path/progress` - Update module progress
- `GET /api/path/stats` - Get learning path statistics

## 🤖 AI/ML Service (FastAPI)

### **Core Features**
- **Intelligent Path Generation**: Analyzes career goals, skills, and market trends
- **Adaptive Learning**: Continuously adapts paths based on progress and market changes
- **Skill Gap Analysis**: Identifies missing skills and learning priorities
- **Market Trend Integration**: Factors in real-time market demand data

### **AI Models & Logic**

#### **Learning Path Generator**
- Analyzes user's current skills vs. required skills for career goal
- Considers experience level and learning pace
- Factors in interview performance and learning history
- Generates prioritized learning modules with prerequisites

#### **Adaptation Engine**
- Monitors user progress and satisfaction ratings
- Identifies when adaptation is needed (low ratings, high progress, market changes)
- Generates new modules or updates existing ones
- Recalculates timelines and learning stages

#### **Market Analysis**
- Tracks skill demand scores and salary trends
- Identifies trending skills and growth opportunities
- Provides market relevance scores for learning modules

### **API Endpoints**
- `POST /generate-learning-path` - Generate personalized learning path
- `POST /adapt-learning-path` - Adapt existing learning path
- `GET /skills/market-trends` - Get market trends for specific skills

## 🎨 Frontend Enhancements

### **New Components**

#### **AIGenerateLearningPath**
- AI-powered learning path generation form
- Interview performance input (optional)
- Market trends analysis (optional)
- Learning history tracking (optional)
- Toggle between AI and traditional modes

#### **Enhanced CurrentStatus**
- AI-generated indicators and market demand scores
- Skill mastery visualization
- Adaptation triggers and recommendations
- Market trend integration

### **Enhanced Types**
- New AI-specific interfaces and data models
- Skill mastery tracking types
- Market trend data structures
- Adaptation request/response models

### **Enhanced API Service**
- AI-powered endpoints integration
- Skill mastery tracking
- Market trend analysis
- Health monitoring and testing

## 🔄 Workflow

### **1. Learning Path Generation**
```
User Input → Backend → AI Service → Path Generation → Database Storage → Frontend Display
```

1. User submits career goal and current skills
2. Backend gathers user data (skills, interview performance, learning history)
3. AI service analyzes data and generates personalized learning path
4. Backend stores path and returns to frontend
5. Frontend displays AI-generated learning path with market insights

### **2. Continuous Adaptation**
```
Progress Updates → Skill Mastery Tracking → Adaptation Check → AI Analysis → Path Updates
```

1. User updates module progress
2. System tracks skill mastery levels
3. Checks if adaptation is needed (time-based or progress-based)
4. AI service analyzes current state and generates adaptations
5. Learning path is updated with new modules or modifications

### **3. Market-Driven Updates**
```
Market Changes → Trend Analysis → Skill Relevance Updates → Path Adaptation
```

1. Market trends are updated (job postings, salary changes, demand shifts)
2. AI service analyzes impact on current learning paths
3. Generates recommendations for skill focus changes
4. Updates learning path priorities and content

## 🚀 Getting Started

### **Prerequisites**
- Java 17+ (Spring Boot)
- Python 3.8+ (FastAPI)
- PostgreSQL 12+
- Node.js 16+ (React)

### **Backend Setup**
1. Clone the repository
2. Configure `application.properties` with database and AI service URLs
3. Run Spring Boot application
4. Verify endpoints at `http://localhost:8080/api/path/health`

### **AI Service Setup**
1. Navigate to `ai/` directory
2. Install dependencies: `pip install -r requirements.txt`
3. Run FastAPI service: `python main.py`
4. Verify service at `http://localhost:8000/health`

### **Frontend Setup**
1. Navigate to `frontend/` directory
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`

## 🔧 Configuration

### **Backend Configuration**
```properties
# AI Service Configuration
ai.service.url=http://localhost:8000
ai.service.api.key=your_api_key_here

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/careeros
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### **AI Service Configuration**
```python
# Environment variables
AI_SERVICE_API_KEY=your_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/careeros
LOG_LEVEL=INFO
```

## 📊 API Documentation

### **AI Learning Path Generation**
```http
POST /api/path/ai/learning
Content-Type: application/json
Authorization: Bearer <token>

{
  "careerGoal": "Full Stack Developer",
  "currentSkills": ["JavaScript", "HTML", "CSS"],
  "experienceLevel": "BEGINNER",
  "learningPace": "MODERATE",
  "interviewPerformance": {
    "overallScore": 7,
    "technicalScore": 8,
    "communicationScore": 6
  },
  "marketTrends": [
    {
      "skillName": "React",
      "demandScore": 9.1,
      "trendingDirection": "UP"
    }
  ]
}
```

### **Learning Path Adaptation**
```http
POST /api/path/ai/adapt/{learningPathId}
Authorization: Bearer <token>
```

### **Progress Update with Mastery**
```http
POST /api/path/ai/progress
Content-Type: application/json
Authorization: Bearer <token>

{
  "moduleId": 123,
  "progressPercentage": 75.0,
  "status": "IN_PROGRESS",
  "userRating": 4,
  "userFeedback": "Great content, very helpful"
}
```

## 🧪 Testing

### **Backend Testing**
```bash
# Run Spring Boot tests
./mvnw test

# Test specific endpoints
curl -X GET http://localhost:8080/api/path/health
curl -X GET http://localhost:8080/api/path/test
```

### **AI Service Testing**
```bash
# Run FastAPI tests
pytest

# Test endpoints
curl -X GET http://localhost:8000/health
curl -X POST http://localhost:8000/generate-learning-path \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test_token" \
  -d '{"careerGoal": "Data Scientist", "currentSkills": ["Python"]}'
```

### **Frontend Testing**
```bash
# Run React tests
npm test

# Run E2E tests
npm run test:e2e
```

## 📈 Monitoring & Analytics

### **Health Checks**
- Backend: `/api/path/health`
- AI Service: `/health`
- Database connectivity
- AI service availability

### **Performance Metrics**
- Learning path generation time
- Adaptation frequency and success rate
- User satisfaction ratings
- Market trend accuracy

### **Logging**
- Structured logging with correlation IDs
- AI service request/response logging
- Error tracking and alerting
- Performance monitoring

## 🔒 Security

### **Authentication**
- JWT-based authentication
- Token validation for AI service calls
- Role-based access control
- Secure API key management

### **Data Privacy**
- User data encryption
- Secure skill mastery tracking
- Market trend data anonymization
- GDPR compliance considerations

## 🚀 Future Enhancements

### **Planned Features**
- **Advanced ML Models**: Integration with TensorFlow/PyTorch
- **Real-time Market Data**: Live job posting analysis
- **Peer Learning**: Collaborative learning path recommendations
- **Gamification**: Achievement systems and progress rewards
- **Mobile App**: React Native mobile application

### **AI Improvements**
- **Natural Language Processing**: Career goal understanding
- **Recommendation Engine**: Content-based filtering
- **Predictive Analytics**: Career trajectory forecasting
- **Personalized Content**: Dynamic resource recommendations

## 🤝 Contributing

### **Development Guidelines**
1. Follow existing code patterns and architecture
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Ensure AI service integration is properly tested

### **Code Quality**
- Backend: Follow Spring Boot best practices
- AI Service: Use type hints and comprehensive error handling
- Frontend: Follow React best practices and TypeScript guidelines
- Database: Use proper indexing and query optimization

## 📚 Resources

### **Documentation**
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### **AI/ML Resources**
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [Pandas Documentation](https://pandas.pydata.org/)
- [Machine Learning Best Practices](https://developers.google.com/machine-learning/guides)

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact the development team
- Review the troubleshooting guide
- Check the FAQ section

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Maintainers**: CareerOS Development Team
