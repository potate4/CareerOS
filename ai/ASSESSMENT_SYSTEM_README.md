# Assessment System

This document describes the Assessment System implemented in the AI backend for the CareerOS learning platform.

## Overview

The Assessment System allows users to:
1. **Create Assessments**: Generate AI-powered assessment questions based on learning materials
2. **Take Assessments**: Answer questions and receive immediate feedback
3. **Get Scores**: Receive detailed scoring with feedback and explanations

## Architecture

```
Frontend → Java Backend → Python AI Service → Gemini AI
    ↓           ↓              ↓              ↓
  UI        API Gateway    Assessment     Question
                                    Generation
```

## Components

### 1. Assessment Schemas (`app/schemas/learning_path.py`)

#### AssessmentQuestion
- `question`: The question text
- `correct_answer`: The correct answer
- `options`: Multiple choice options (optional)
- `question_type`: Type of question ("text", "multiple_choice", "true_false")
- `difficulty`: Difficulty level ("easy", "medium", "hard")
- `explanation`: Explanation of the correct answer

#### AssessmentRequest
- `user_id`: ID of the user requesting assessment
- `module_id`: ID of the module for assessment
- `assessment_type`: Type of assessment ("quiz", "practice", "test")
- `num_questions`: Number of questions to generate (1-20)
- `difficulty`: Difficulty level ("easy", "medium", "hard")

#### AssessmentResponse
- `success`: Whether the assessment was created successfully
- `assessment_id`: Unique identifier for the assessment
- `questions`: List of assessment questions
- `user_id`, `module_id`: User and module identifiers
- `assessment_type`, `difficulty`: Assessment configuration
- `created_at`: Timestamp of creation

### 2. Assessment Functions (`app/helpers/learning_path.py`)

#### create_assessment()
- Searches user's learning materials for the specific module
- Generates context-aware questions using Gemini AI
- Returns structured assessment with questions and metadata

#### score_assessment()
- Scores user's answers using AI-powered evaluation
- Provides detailed feedback for each answer
- Calculates overall performance metrics

### 3. AI Integration (`app/helpers/llm.py`)

#### get_structured_response_assessment_questions()
- Uses Gemini AI to generate structured assessment questions
- Ensures questions are relevant to learning materials
- Maintains consistent question format

#### get_structured_response_assessment_answers_and_scores()
- Uses Gemini AI to score answers and provide feedback
- Evaluates answer quality on 0.0-1.0 scale
- Generates constructive feedback

## API Endpoints

### Create Assessment
```
POST /api/v1/learning-path/create-assessment
```

**Request Body:**
```json
{
  "user_id": 123,
  "module_id": 456,
  "assessment_type": "quiz",
  "num_questions": 5,
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment created successfully with 5 questions",
  "assessment_id": "assessment_123_456_1234567890",
  "questions": [
    {
      "question": "What is machine learning?",
      "correct_answer": "A subset of AI that enables systems to learn from data",
      "options": null,
      "question_type": "text",
      "difficulty": "medium",
      "explanation": "Machine learning is a method of data analysis that automates analytical model building."
    }
  ],
  "user_id": 123,
  "module_id": 456,
  "assessment_type": "quiz",
  "difficulty": "medium",
  "created_at": "2024-01-01T10:00:00"
}
```

### Score Assessment
```
POST /api/v1/learning-path/score-assessment
```

**Request Body:**
```json
{
  "assessment_id": "assessment_123_456_1234567890",
  "user_id": 123,
  "module_id": 456,
  "answers": [
    {
      "What is machine learning?": "A subset of AI that enables systems to learn from data"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Assessment scored successfully",
  "assessment_id": "assessment_123_456_1234567890",
  "user_id": 123,
  "module_id": 456,
  "total_score": 1.0,
  "max_score": 1.0,
  "percentage": 100.0,
  "answers_and_scores": [
    {
      "question": "What is machine learning?",
      "correct_answer": "A subset of AI that enables systems to learn from data",
      "provided_answer": "A subset of AI that enables systems to learn from data",
      "score": 1.0,
      "feedback": "Excellent answer! You have a clear understanding of machine learning.",
      "is_correct": true
    }
  ],
  "overall_feedback": "Excellent work! You have a strong understanding of the material.",
  "completed_at": "2024-01-01T10:05:00"
}
```

## Usage Flow

### 1. Create Assessment
1. User requests assessment for a specific module
2. System searches user's learning materials
3. AI generates context-aware questions
4. Assessment is returned with unique ID

### 2. Take Assessment
1. User answers questions using the assessment ID
2. Answers are submitted for scoring
3. AI evaluates each answer and provides feedback
4. Overall score and performance metrics are calculated

### 3. Review Results
1. User receives detailed feedback for each question
2. Overall performance assessment is provided
3. Suggestions for improvement are given

## Features

### Question Types
- **Text Questions**: Open-ended questions requiring written answers
- **Multiple Choice**: Questions with predefined answer options
- **True/False**: Binary choice questions

### Difficulty Levels
- **Easy**: Basic concepts and definitions
- **Medium**: Application and understanding
- **Hard**: Analysis and synthesis

### Assessment Types
- **Quiz**: Quick knowledge check
- **Practice**: Learning-focused assessment
- **Test**: Comprehensive evaluation

### AI-Powered Features
- **Context-Aware Questions**: Based on user's actual learning materials
- **Intelligent Scoring**: Nuanced evaluation beyond simple right/wrong
- **Personalized Feedback**: Constructive comments for improvement
- **Adaptive Difficulty**: Questions tailored to user's level

## Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Required for Gemini AI integration

### AI Model Settings
- **Model**: `gemini-2.0-flash`
- **Temperature**: 1.0 (for creative question generation)
- **Response Format**: Structured JSON for consistency

## Error Handling

### Common Issues
1. **No Learning Materials**: Assessment creation may fail if no materials are found
2. **AI Service Errors**: Network or API issues with Gemini
3. **Invalid Data**: Malformed requests or responses

### Error Responses
- `400 Bad Request`: Invalid input parameters
- `500 Internal Server Error`: AI service or processing errors
- Detailed error messages for debugging

## Future Enhancements

### Planned Features
- **Question Bank**: Store and reuse high-quality questions
- **Adaptive Assessments**: Dynamic difficulty adjustment
- **Progress Tracking**: Long-term learning analytics
- **Peer Comparison**: Benchmark against other learners
- **Question Templates**: Predefined question structures

### Technical Improvements
- **Caching**: Store generated questions for reuse
- **Batch Processing**: Generate multiple assessments simultaneously
- **Offline Support**: Local question generation capabilities
- **Multi-language**: Support for different languages

## Testing

### Manual Testing
1. Start the Python AI service
2. Use the API endpoints with sample data
3. Verify question generation and scoring
4. Check error handling with invalid inputs

### Integration Testing
1. Test with real learning materials
2. Verify AI response quality
3. Test error scenarios
4. Performance testing with multiple requests

## Monitoring

### Logs to Watch
- Assessment creation success/failure rates
- AI response quality metrics
- Processing time performance
- Error patterns and frequencies

### Metrics to Track
- Questions generated per assessment
- Scoring accuracy and consistency
- User satisfaction scores
- System response times

## Security Considerations

### Data Privacy
- User answers are processed but not stored permanently
- Assessment IDs are temporary and not linked to personal data
- Learning materials are only accessed for the requesting user

### Rate Limiting
- Consider implementing rate limits for assessment creation
- Prevent abuse of AI resources
- Monitor usage patterns

## Support

For issues or questions about the Assessment System:
1. Check the logs for error details
2. Verify API request/response formats
3. Test with minimal data to isolate issues
4. Contact the development team with specific error messages 