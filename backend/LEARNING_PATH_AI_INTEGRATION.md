# Learning Path AI Integration

## Overview
This document describes the implementation of AI-powered learning path generation in the CareerOS Java backend, integrating with the Python AI service.

## New Endpoints

### 1. AI Learning Path Generation
- **Endpoint**: `POST /api/path/ai-generate`
- **Purpose**: Generate learning paths directly using the Python AI service
- **Request Schema**: `AILearningPathRequest`
- **Response Schema**: `AILearningPathResponse`

### 2. Enhanced Learning Path Generation
- **Endpoint**: `POST /api/path/learning` (existing, enhanced)
- **Purpose**: Generate learning paths with AI integration and fallback
- **Request Schema**: `LearningPathRequest` (enhanced with `toAIRequestString()` method)
- **Response Schema**: `LearningPathResponse`

## New Request/Response Schemas

### AILearningPathRequest
```java
{
    "user_id": 123,
    "learning_path_info": "Career Goal: Full Stack Developer. Experience Level: BEGINNER. Learning Pace: MODERATE. Current Skills: HTML, CSS. Additional Notes: Want to focus on React and Node.js"
}
```

### AILearningPathResponse
```java
{
    "modules": [
        {
            "module_name": "JavaScript Fundamentals",
            "module_description": "Learn JavaScript basics including variables, functions, and DOM manipulation"
        },
        {
            "module_name": "React Basics",
            "module_description": "Introduction to React components, state, and props"
        }
    ]
}
```

## Enhanced LearningPathRequest
The existing `LearningPathRequest` now includes a `toAIRequestString()` method that converts the structured request into a natural language string for the AI service.

## Service Layer Changes

### LearningPathService
- **New Method**: `callAILearningPathGeneration()` - Calls Python AI service
- **Enhanced Method**: `generateLearningPath()` - Now uses AI service with fallback
- **New Helper Methods**: 
  - `parseAILearningPathResponse()` - Parses AI service response
  - `createModuleFromAIResponse()` - Creates modules from AI response
  - `extractSkillFocusFromTitle()` - Extracts skill focus from module titles
  - `mapExperienceLevelToDifficulty()` - Maps user experience to module difficulty
  - `estimateHoursFromDescription()` - Estimates module duration

## AI Service Integration

### Configuration
- **Property**: `ai.service.url=http://localhost:8000`
- **Service**: Python FastAPI service running on port 8000
- **Endpoint**: `/api/v1/learning-path/generate`

### Request Flow
1. Frontend sends `LearningPathRequest` with career goals, skills, etc.
2. Java backend converts request to natural language using `toAIRequestString()`
3. Java backend calls Python AI service with user preferences
4. Python AI service generates structured learning modules
5. Java backend parses response and creates `LearningPath` and `LearningModule` entities
6. Java backend returns `LearningPathResponse` to frontend

### Fallback Mechanism
If the AI service is unavailable or fails:
1. System logs warning and falls back to hardcoded generation
2. Uses existing `generateFallbackLearningPath()` method
3. Maintains system reliability

## Database Models

### LearningPath
- **Fields**: id, user, careerGoal, currentStage, overallProgress, estimatedCompletionWeeks, isActive, createdAt, updatedAt
- **Relationships**: One-to-Many with LearningModule

### LearningModule
- **Fields**: id, learningPath, title, description, skillFocus, difficultyLevel, estimatedHours, progressPercentage, status, userRating, userFeedback, orderIndex, createdAt, updatedAt
- **Relationships**: Many-to-One with LearningPath, One-to-Many with LearningResource

## Frontend Integration Points

### 1. Career Goal Input Form
- Career goal text input
- Experience level selection (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)
- Learning pace selection (SLOW, MODERATE, FAST, INTENSIVE)
- Current skills list input
- Additional notes textarea

### 2. Learning Path Display
- Module list with titles and descriptions
- Progress tracking per module
- Overall learning path progress
- Estimated completion time

## Error Handling

### AI Service Failures
- Connection timeouts (60 seconds)
- Invalid response formats
- Service unavailable errors
- Automatic fallback to hardcoded generation

### Validation
- User authentication required
- Request field validation
- Response format validation

## Testing

### Health Check
- **Endpoint**: `GET /api/path/health`
- **Features**: Service status, AI integration status, available endpoints, AI service URL

### Test Endpoint
- **Endpoint**: `GET /api/path/test`
- **Purpose**: Verify authentication and service connectivity

## Next Steps

### 1. Frontend Implementation
- Create career goal input form
- Implement learning path display components
- Add progress tracking UI

### 2. Enhanced AI Integration
- Add file upload processing
- Implement learning material search
- Add assessment generation

### 3. Performance Optimization
- Add caching for AI responses
- Implement async processing for long-running operations
- Add rate limiting for AI service calls

## Configuration

### Environment Variables
```properties
# AI Service Configuration
ai.service.url=http://localhost:8000

# Optional: Override in production
AI_SERVICE_URL=https://your-ai-service.com
```

### Dependencies
- Spring WebFlux (WebClient)
- Jackson for JSON processing
- Spring Security for authentication
- JPA/Hibernate for database operations

## Security Considerations

### Authentication
- All endpoints require valid JWT authentication
- User ID validation for all operations
- Session-based user context

### Input Validation
- Request field validation with constraints
- SQL injection prevention via JPA
- XSS protection via input sanitization

### Rate Limiting
- Consider implementing rate limiting for AI service calls
- Monitor API usage and costs
- Implement circuit breaker pattern for AI service failures 