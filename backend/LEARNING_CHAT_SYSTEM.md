# Learning Chat System

This document describes the Learning Chat System implemented in the Java backend that communicates with the Python AI service.

## Overview

The Learning Chat System allows users to have interactive conversations with an AI assistant based on their learning materials and context for specific learning modules.

## Architecture

- **Java Backend**: Manages chat persistence, user authentication, and API endpoints
- **Python AI Service**: Provides AI-powered responses using RAG (Retrieval-Augmented Generation)
- **Database**: Stores chat history and message metadata

## Components

### 1. LearningChat Model
- Stores individual chat messages
- Links messages to users and learning modules
- Tracks speaker (user/AI) and timestamps

### 2. LearningChatService
- Processes chat requests
- Communicates with Python AI service
- Manages chat persistence and retrieval

### 3. LearningChatController
- REST API endpoints for chat operations
- Handles HTTP requests and responses

## API Endpoints

### Send Chat Message
```
POST /api/learning-chat/chat
```

**Request Body:**
```json
{
  "userId": 123,
  "moduleId": 456,
  "userQuery": "What is machine learning?",
  "chatHistory": [
    {
      "speaker": "user",
      "message": "Hello",
      "timestamp": "2024-01-01T10:00:00Z"
    },
    {
      "speaker": "ai",
      "message": "Hi! How can I help you today?",
      "timestamp": "2024-01-01T10:00:01Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat reply generated successfully",
  "reply": "Machine learning is a subset of artificial intelligence...",
  "userId": 123,
  "moduleId": 456,
  "processingTimeSeconds": 2.5,
  "timestamp": "2024-01-01T10:00:05Z"
}
```

### Get Chat History
```
GET /api/learning-chat/history/{userId}/{moduleId}
```

Returns all chat messages for a user in a specific module, ordered chronologically.

### Get Recent Messages
```
GET /api/learning-chat/recent/{userId}/{moduleId}?limit=10
```

Returns recent chat messages (default: 10) for a user in a specific module.

### Get Chat Statistics
```
GET /api/learning-chat/stats/{userId}/{moduleId}
```

Returns the total number of chat messages for a user in a specific module.

## Configuration

The system requires the following configuration in `application.properties`:

```properties
# AI Service Configuration
ai.service.url=http://localhost:8000
```

## Database Schema

The `learning_chats` table has the following structure:

```sql
CREATE TABLE learning_chats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL,
    speaker VARCHAR(10) NOT NULL, -- 'user' or 'ai'
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_user_module ON learning_chats(user_id, module_id);
CREATE INDEX idx_chat_created ON learning_chats(created_at);
```

## Integration with Python AI Service

The Java backend communicates with the Python AI service using the `/api/v1/learning-path/chat` endpoint. The communication follows this flow:

1. User sends chat request to Java backend
2. Java backend saves user message to database
3. Java backend calls Python AI service with chat context
4. Python AI service generates response using RAG
5. Java backend saves AI response to database
6. Java backend returns response to user

## Error Handling

- Network errors when calling AI service are logged and returned as user-friendly messages
- Database errors are logged and return appropriate HTTP status codes
- Validation errors return 400 Bad Request with detailed error messages

## Security

- All chat endpoints are currently set to permit all requests (`/api/learning-chat/**`)
- In production, consider adding authentication and authorization
- Validate user ownership of modules before allowing chat access

## Usage Example

```java
// Send a chat message
LearningChatRequest request = new LearningChatRequest();
request.setUserId(123L);
request.setModuleId(456L);
request.setUserQuery("Explain neural networks");

LearningChatResponse response = learningChatService.processChatRequest(request);

if (response.isSuccess()) {
    System.out.println("AI Response: " + response.getReply());
} else {
    System.out.println("Error: " + response.getMessage());
}
```

## Testing

To test the system:

1. Ensure the Python AI service is running on the configured URL
2. Start the Java backend application
3. Use the API endpoints to send chat messages
4. Verify responses are generated and stored correctly

## Future Enhancements

- Add authentication and authorization
- Implement chat session management
- Add support for file attachments in chat
- Implement chat analytics and insights
- Add support for multiple AI models 