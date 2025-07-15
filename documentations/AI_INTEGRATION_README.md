# AI Integration Workflow - CareerOS

This document describes the complete AI integration workflow between the FastAPI AI backend, Spring Boot core backend, and React frontend.

## Architecture Overview

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐    HTTP Requests    ┌─────────────────┐
│   React Frontend │ ──────────────────► │ Spring Boot Core │ ──────────────────► │ FastAPI AI Backend │
│   (Port 5173)   │                     │   (Port 8080)   │                     │   (Port 8000)   │
└─────────────────┘                     └─────────────────┘                     └─────────────────┘
         │                                      │                                      │
         │                                      │                                      │
         └────────── JWT Authentication ────────┘                                      │
                                                                                        │
         ┌────────── AI Service Response ───────┐                                      │
         │                                      │                                      │
         └──────────────────────────────────────┘                                      │
```

## Workflow Description

1. **Frontend** → **Core Backend**: User makes authenticated requests to Spring Boot
2. **Core Backend** → **AI Backend**: Spring Boot forwards requests to FastAPI AI service
3. **AI Backend** → **Core Backend**: FastAPI returns AI analysis results
4. **Core Backend** → **Frontend**: Spring Boot returns processed results to React

## API Endpoints

### FastAPI AI Backend (Port 8000)

#### Content Analysis
- **POST** `/api/v1/ai/analyze`
  - Analyzes content using AI
  - Supports: general, sentiment, skills analysis
  - Returns: analysis results with confidence scores

#### Career Recommendations
- **POST** `/api/v1/ai/career-recommendations`
  - Generates AI-powered career recommendations
  - Returns: job recommendations, skill gaps, courses, market trends

#### Health Checks
- **GET** `/api/v1/ai/health` - Service health status
- **GET** `/api/v1/ai/status` - Detailed service status

### Spring Boot Core Backend (Port 8080)

#### AI Service Integration
- **POST** `/api/ai/analyze` - Content analysis (authenticated)
- **POST** `/api/ai/career-recommendations` - Career recommendations (authenticated)
- **GET** `/api/ai/health` - AI service health check
- **GET** `/api/ai/status` - AI service status

#### Authentication
- **POST** `/api/auth/signin` - User login
- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/logout` - User logout
- **GET** `/api/auth/validate` - Token validation

### React Frontend (Port 5173)

#### Pages
- `/auth` - Authentication page (login/signup)
- `/dashboard` - Main dashboard
- `/ai-services` - AI services testing page

## Setup Instructions

### 1. Start FastAPI AI Backend

```bash
cd ai
# Create virtual environment (if not exists)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start Spring Boot Core Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 3. Start React Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing the Integration

### 1. Authentication Flow
1. Visit `http://localhost:5173`
2. Create a new account or login
3. You'll be redirected to the dashboard

### 2. AI Services Testing
1. Navigate to "AI Services" in the navigation
2. Test Content Analysis:
   - Enter text content
   - Select analysis type (general/sentiment/skills)
   - Click "Analyze Content"
   - View results

3. Test Career Recommendations:
   - Add/remove skills
   - Set experience years
   - Click "Get Recommendations"
   - View job recommendations, skill gaps, and courses

### 3. API Testing

#### Test AI Backend Directly
```bash
# Health check
curl http://localhost:8000/api/v1/ai/health

# Content analysis
curl -X POST http://localhost:8000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "content": "I love working with Python and React",
    "analysis_type": "sentiment"
  }'

# Career recommendations
curl -X POST http://localhost:8000/api/v1/ai/career-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "skills": ["Python", "React"],
    "experience_years": 3,
    "interests": ["Web Development"]
  }'
```

#### Test Core Backend Integration
```bash
# Login first to get token
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'

# Use the token for AI requests
curl -X POST http://localhost:8080/api/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "content": "I love working with Python and React",
    "analysis_type": "sentiment"
  }'
```

## Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=CareerOS
VITE_DEV_MODE=true
```

#### Backend (application.properties)
```properties
# AI Service Configuration
ai.service.url=http://localhost:8000
```

## Data Flow Examples

### Content Analysis Flow
1. User submits content in React frontend
2. Frontend sends POST to `/api/ai/analyze` (Spring Boot)
3. Spring Boot forwards to FastAPI `/api/v1/ai/analyze`
4. FastAPI processes with AI and returns results
5. Spring Boot returns results to frontend
6. Frontend displays analysis results

### Career Recommendations Flow
1. User submits skills/experience in React frontend
2. Frontend sends POST to `/api/ai/career-recommendations` (Spring Boot)
3. Spring Boot forwards to FastAPI `/api/v1/ai/career-recommendations`
4. FastAPI generates AI recommendations
5. Spring Boot returns recommendations to frontend
6. Frontend displays job matches, skill gaps, and courses

## Error Handling

### Frontend
- Network errors are caught and displayed
- API errors show user-friendly messages
- Loading states during requests

### Core Backend
- AI service unavailable errors
- Authentication errors
- Validation errors

### AI Backend
- Processing errors
- Invalid request errors
- Service health monitoring

## Monitoring

### Health Checks
- Frontend: No specific health check
- Core Backend: `/api/ai/health` and `/api/ai/status`
- AI Backend: `/api/v1/ai/health` and `/api/v1/ai/status`

### Logging
- All services log requests and errors
- AI service logs processing times
- Authentication events are logged

## Security

- JWT authentication for all AI service requests
- CORS configured for cross-origin requests
- Input validation on all endpoints
- Error messages don't expose sensitive information

## Performance

- AI service responses are cached (if implemented)
- Request timeouts configured
- Async processing for AI operations
- Connection pooling for database operations

## Troubleshooting

### Common Issues

1. **AI Service Unavailable**
   - Check if FastAPI is running on port 8000
   - Verify network connectivity
   - Check AI service logs

2. **Authentication Errors**
   - Ensure user is logged in
   - Check JWT token validity
   - Verify token in Authorization header

3. **CORS Errors**
   - Check CORS configuration in FastAPI
   - Verify frontend URL in allowed origins

4. **Network Errors**
   - Check if all services are running
   - Verify port configurations
   - Check firewall settings

### Debug Commands

```bash
# Check AI service health
curl http://localhost:8000/api/v1/ai/health

# Check core backend health
curl http://localhost:8080/api/ai/health

# Test authentication
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test"}'
```

## Future Enhancements

1. **Real AI Models**: Replace dummy data with actual AI models
2. **Caching**: Implement Redis for response caching
3. **Rate Limiting**: Add rate limiting for AI service calls
4. **Monitoring**: Add Prometheus/Grafana monitoring
5. **Queue System**: Implement async processing with message queues
6. **Multiple AI Services**: Support multiple AI service providers

## File Structure

```
CareerOS/
├── ai/                          # FastAPI AI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/
│   │   │   └── ai_services.py   # AI service endpoints
│   │   └── main.py              # FastAPI app
│   └── requirements.txt
├── backend/                      # Spring Boot Core Backend
│   ├── src/main/java/com/careeros/backend/
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   └── AIController.java # AI integration controller
│   │   ├── service/
│   │   │   └── AIService.java    # AI service client
│   │   └── payload/
│   │       ├── request/
│   │       │   ├── AIAnalysisRequest.java
│   │       │   └── CareerRecommendationRequest.java
│   │       └── response/
│   │           ├── AIAnalysisResponse.java
│   │           └── CareerRecommendationResponse.java
│   └── src/main/resources/
│       └── application.properties # AI service URL config
└── frontend/                     # React Frontend
    ├── src/
    │   ├── components/
    │   │   └── ai/
    │   │       └── AIServicesPage.tsx # AI testing page
    │   ├── services/
    │   │   └── api.ts            # AI API calls
    │   └── types/
    │       └── ai.ts             # AI service types
    └── .env                      # API URL configuration
```

This integration provides a complete workflow for AI services in the CareerOS application, with proper authentication, error handling, and a user-friendly interface for testing. 