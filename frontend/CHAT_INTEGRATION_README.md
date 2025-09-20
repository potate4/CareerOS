# Learning Chat Integration

This document describes the chat functionality integration between the frontend and Java backend for the CareerOS learning system.

## Overview

The chat system allows users to interact with an AI assistant for each learning module. The frontend communicates with the Java backend, which then communicates with the Python AI service to generate responses.

## Architecture

```
Frontend (React) → Java Backend → Python AI Service
     ↓                ↓              ↓
  Chat UI        Chat API        RAG AI
```

## Frontend Components

### 1. LearningChat Component
- **Location**: `src/components/learning-path/LearningChat.tsx`
- **Purpose**: Main chat interface for learning modules
- **Features**: 
  - Real-time chat with AI
  - Chat history loading
  - Authentication checks
  - Error handling
  - Suggested questions

### 2. Chat Button Integration
- **Location**: `src/components/learning-path/AllLearningPaths.tsx`
- **Implementation**: Each module displays a "Chat" button that opens the chat modal

## API Integration

### Chat Endpoints
- **Send Message**: `POST /api/learning-chat/chat`
- **Get History**: `GET /api/learning-chat/history/{userId}/{moduleId}`
- **Get Recent**: `GET /api/learning-chat/recent/{userId}/{moduleId}?limit=10`
- **Get Stats**: `GET /api/learning-chat/stats/{userId}/{moduleId}`

### API Service
- **Location**: `src/services/learningPathAPI.ts`
- **Methods**:
  - `chatWithLearningAssistant()` - Send chat message
  - `getChatHistory()` - Load chat history
  - `getRecentChatMessages()` - Get recent messages

## Data Types

### ChatMessage
```typescript
interface ChatMessage {
  speaker: 'user' | 'ai';
  message: string;
  timestamp: string;
}
```

### LearningChatRequest
```typescript
interface LearningChatRequest {
  userId: number;
  moduleId: number;
  userQuery: string;
  chatHistory?: ChatMessage[];
}
```

### LearningChatResponse
```typescript
interface LearningChatResponse {
  success: boolean;
  message: string;
  reply: string;
  userId: number;
  moduleId: number;
  processingTimeSeconds: number;
  timestamp: string;
}
```

## Authentication

The chat system integrates with the existing authentication system:
- Uses `useAuthStore` to get current user information
- Requires user login to send messages
- Shows warning for unauthenticated users
- Still allows viewing chat history when not logged in

## Testing the Chat System

### Prerequisites
1. **Java Backend**: Must be running on `http://localhost:8080`
2. **Python AI Service**: Must be running on `http://localhost:8000`
3. **Frontend**: Must be running on `http://localhost:5173` (or configured port)

### Test Steps

1. **Start the Backend Services**
   ```bash
   # Terminal 1: Start Java backend
   cd backend
   mvn spring-boot:run
   
   # Terminal 2: Start Python AI service
   cd ai
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Start the Frontend**
   ```bash
   # Terminal 3: Start React frontend
   cd frontend
   npm run dev
   ```

3. **Navigate to Learning Paths**
   - Go to `http://localhost:5173/learning-path`
   - Or navigate through the app to the learning paths section

4. **Test Chat Functionality**
   - Expand a learning path to see modules
   - Click the "Chat" button on any module
   - The chat modal should open
   - Try sending a message

### Expected Behavior

- **Authenticated User**: Can send messages and receive AI responses
- **Unauthenticated User**: Sees warning message, input is disabled
- **Chat History**: Previous conversations are loaded automatically
- **Error Handling**: Network errors show user-friendly messages

## Troubleshooting

### Common Issues

1. **Chat Button Not Working**
   - Check browser console for errors
   - Verify Java backend is running on port 8080
   - Check network tab for failed API calls

2. **No AI Response**
   - Verify Python AI service is running on port 8000
   - Check Java backend logs for AI service communication errors
   - Verify the `ai.service.url` configuration in Java backend

3. **Authentication Issues**
   - Check if user is logged in
   - Verify token is stored in localStorage
   - Check auth store state in React DevTools

4. **CORS Issues**
   - Verify Java backend CORS configuration
   - Check if frontend URL is allowed in backend CORS settings

### Debug Information

The system includes comprehensive logging:
- Frontend: Console logs for API calls and responses
- Java Backend: Logs for chat processing and AI service communication
- Python AI Service: Logs for request processing and response generation

## Configuration

### Environment Variables
- **Frontend**: `VITE_API_URL` (defaults to `http://localhost:8080/api`)
- **Java Backend**: `ai.service.url` in `application.properties`
- **Python AI Service**: Port configuration in startup command

### Database
The chat system requires the `learning_chats` table to be created:
```sql
CREATE TABLE learning_chats (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    module_id BIGINT NOT NULL,
    speaker VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Future Enhancements

- Real-time chat updates using WebSockets
- File attachments in chat
- Chat analytics and insights
- Multi-language support
- Chat session management
- Integration with external AI models 