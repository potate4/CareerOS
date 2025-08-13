# CareerOS AI Integration Setup Guide

This guide will help you set up and run the complete CareerOS AI Learning Path system with full integration between the Java backend, Python AI service, and React frontend.

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Python 3.8 or higher
- Node.js 16 or higher
- Maven
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd CareerOS

# Install Python dependencies
cd ai
pip install -r requirements.txt

# Install Node.js dependencies
cd ../frontend
npm install

# Install Java dependencies (from root directory)
cd ../backend
mvn clean install
```

### 2. Environment Configuration

#### Python AI Service Configuration
Create a `.env` file in the `ai` directory:

```env
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.7

# Service Configuration
PRIMARY_AI_SERVICE=openai
ENABLE_FALLBACK=true
FALLBACK_AI_SERVICE=rule_based

# Backend Integration
JAVA_BACKEND_URL=http://localhost:8081
```

#### Java Backend Configuration
Update `backend/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true

# JWT Configuration
app.jwtSecret=your_jwt_secret_here
app.jwtExpirationMs=86400000

# AI Service Configuration
ai.service.url=http://localhost:8000
ai.openai.api.key=your_openai_api_key_here
ai.openai.model=gpt-3.5-turbo
ai.service.primary=openai
ai.service.fallback.enabled=true
ai.service.fallback.type=rule_based

# Server Configuration
server.port=8081
```

#### Frontend Configuration
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8081
VITE_AI_API_URL=http://localhost:8000
VITE_TOKEN_KEY=authToken
```

### 3. Start All Services

#### Terminal 1: Start Python AI Service
```bash
cd ai
python app/main.py
```
The AI service will start on `http://localhost:8000`

#### Terminal 2: Start Java Backend
```bash
cd backend
mvn spring-boot:run
```
The backend will start on `http://localhost:8081`

#### Terminal 3: Start React Frontend
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

### 4. Verify Installation

Run the integration test:
```bash
python test_integration.py
```

## 🔧 Detailed Configuration

### AI Service Features

The Python AI service provides:
- **Learning Path Generation**: Creates personalized learning paths using OpenAI GPT
- **Skill Analysis**: Analyzes current skills and identifies gaps
- **Market Trends**: Incorporates market demand data
- **Adaptive Learning**: Adjusts paths based on user progress
- **Fallback System**: Uses rule-based generation if AI is unavailable

### Backend Integration

The Java backend includes:
- **AI Controller**: Handles AI-related requests
- **Learning Path Controller**: Manages learning path operations
- **AIService**: Communicates with Python AI service
- **Authentication**: JWT-based user authentication
- **Database**: H2 in-memory database for development

### Frontend Features

The React frontend provides:
- **AI Learning Path Generation**: Advanced form with skill mastery levels
- **Current Status**: Real-time learning path overview
- **Progress Update**: Module progress tracking with AI insights
- **Statistics**: Comprehensive learning analytics
- **Responsive Design**: Works on all devices

## 🧪 Testing

### Manual Testing

1. **Create Account**: Visit `http://localhost:5173` and sign up
2. **Generate AI Learning Path**: Use the AI-powered generation form
3. **View Current Status**: Check your learning path overview
4. **Update Progress**: Track your module progress
5. **View Statistics**: Analyze your learning performance

### API Testing

Test individual endpoints:

```bash
# Test AI service health
curl http://localhost:8000/health

# Test backend health
curl http://localhost:8081/api/path/health

# Test AI learning path generation
curl -X POST http://localhost:8081/api/path/ai/learning \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "careerGoal": "Full Stack Developer",
    "currentSkills": ["JavaScript", "HTML", "CSS"],
    "experienceLevel": "BEGINNER",
    "learningPace": "MODERATE"
  }'
```

### Automated Testing

Run the comprehensive integration test:
```bash
python test_integration.py
```

## 🔍 Troubleshooting

### Common Issues

1. **Python AI Service Not Starting**
   - Check if Python dependencies are installed: `pip install -r requirements.txt`
   - Verify OpenAI API key is set in `.env`
   - Check port 8000 is not in use

2. **Java Backend Not Starting**
   - Ensure Java 17+ is installed: `java -version`
   - Check Maven is installed: `mvn -version`
   - Verify port 8081 is not in use

3. **Frontend Not Loading**
   - Check Node.js is installed: `node -version`
   - Install dependencies: `npm install`
   - Verify port 5173 is not in use

4. **AI Integration Not Working**
   - Check both services are running
   - Verify API URLs in configuration
   - Check network connectivity between services

### Debug Mode

Enable debug logging:

**Python AI Service**:
```python
# Add to ai/app/main.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Java Backend**:
```properties
# Add to application.properties
logging.level.com.careeros.backend=DEBUG
logging.level.org.springframework.web=DEBUG
```

**Frontend**:
```javascript
// Add to frontend/src/services/learningPathAPI.ts
console.log('API Request:', request);
console.log('API Response:', response);
```

## 📊 Monitoring

### Health Checks

- **AI Service**: `http://localhost:8000/health`
- **Backend**: `http://localhost:8081/api/path/health`
- **Frontend**: Check browser console for errors

### Logs

- **Python AI Service**: Check terminal output
- **Java Backend**: Check terminal output or logs
- **Frontend**: Check browser developer tools

## 🚀 Production Deployment

### Docker Deployment

1. **Build Images**:
```bash
# Build AI service
cd ai
docker build -t careeros-ai .

# Build backend
cd ../backend
docker build -t careeros-backend .

# Build frontend
cd ../frontend
docker build -t careeros-frontend .
```

2. **Run with Docker Compose**:
```bash
docker-compose up -d
```

### Environment Variables

Set production environment variables:
```bash
export OPENAI_API_KEY=your_production_key
export JAVA_BACKEND_URL=https://your-backend-domain.com
export PYTHON_AI_URL=https://your-ai-domain.com
```

## 📚 API Documentation

### AI Service Endpoints

- `POST /generate-learning-path`: Generate AI learning path
- `GET /health`: Service health check
- `POST /adapt-learning-path`: Adapt existing learning path

### Backend Endpoints

- `POST /api/path/ai/learning`: Generate AI learning path
- `GET /api/path/current`: Get current learning path
- `POST /api/path/progress`: Update module progress
- `GET /api/path/stats`: Get learning statistics
- `GET /api/path/ai/stats`: Get AI-enhanced statistics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

---

**Happy Learning! 🎓**
