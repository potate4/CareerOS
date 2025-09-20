package com.careeros.backend.service;

import com.careeros.backend.model.LearningChat;
import com.careeros.backend.payload.request.LearningChatRequest;
import com.careeros.backend.payload.response.LearningChatResponse;
import com.careeros.backend.repository.LearningChatRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
public class LearningChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(LearningChatService.class);
    
    private final LearningChatRepository learningChatRepository;
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    public LearningChatService(LearningChatRepository learningChatRepository, RestTemplate restTemplate) {
        this.learningChatRepository = learningChatRepository;
        this.restTemplate = restTemplate;
    }
    
    /**
     * Process a chat request and get AI response
     */
    public LearningChatResponse processChatRequest(LearningChatRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            logger.info("Processing chat request for user {} in module {}", request.getUserId(), request.getModuleId());
            
            // Save user message to database
            LearningChat userMessage = new LearningChat(
                request.getUserId(), 
                request.getModuleId(), 
                "user", 
                request.getUserQuery()
            );
            learningChatRepository.save(userMessage);
            
            // Call Python AI service
            String aiReply = callAIService(request);
            
            if (aiReply == null || aiReply.trim().isEmpty()) {
                throw new RuntimeException("AI service returned empty response");
            }
            
            // Save AI response to database
            LearningChat aiMessage = new LearningChat(
                request.getUserId(), 
                request.getModuleId(), 
                "ai", 
                aiReply
            );
            learningChatRepository.save(aiMessage);
            
            double processingTime = (System.currentTimeMillis() - startTime) / 1000.0;
            
            logger.info("Chat processed successfully in {} seconds", processingTime);
            
            return new LearningChatResponse(
                true,
                "Chat reply generated successfully",
                aiReply,
                request.getUserId(),
                request.getModuleId(),
                processingTime
            );
            
        } catch (Exception e) {
            logger.error("Error processing chat request: {}", e.getMessage(), e);
            double processingTime = (System.currentTimeMillis() - startTime) / 1000.0;
            
            return new LearningChatResponse(
                false,
                "Chat processing failed: " + e.getMessage(),
                null,
                request.getUserId(),
                request.getModuleId(),
                processingTime
            );
        }
    }
    
    /**
     * Call Python AI service for chat response
     */
    private String callAIService(LearningChatRequest request) {
        try {
            // Prepare request for Python service
            String pythonEndpoint = aiServiceUrl + "/api/v1/learning-path/chat";
            
            // Convert Java request to Python format
            var pythonRequest = new PythonChatRequest();
            pythonRequest.setUser_id(request.getUserId());
            pythonRequest.setModule_id(request.getModuleId());
            pythonRequest.setUser_query(request.getUserQuery());
            
            // Convert chat history to Python format
            if (request.getChatHistory() != null && !request.getChatHistory().isEmpty()) {
                List<PythonChatMessage> pythonHistory = request.getChatHistory().stream()
                    .map(msg -> new PythonChatMessage(msg.getSpeaker(), msg.getMessage()))
                    .collect(Collectors.toList());
                pythonRequest.setChat_history(pythonHistory);
                
                logger.info("Sending chat history to Python service: {}", pythonHistory);
            } else {
                logger.info("No chat history to send to Python service");
                pythonRequest.setChat_history(new ArrayList<>()); // Send empty list instead of null
            }
            
            logger.info("Full Python request: {}", pythonRequest);
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<PythonChatRequest> entity = new HttpEntity<>(pythonRequest, headers);
            
            logger.info("Calling Python AI service at: {}", pythonEndpoint);
            
            ResponseEntity<PythonChatResponse> response = restTemplate.exchange(
                pythonEndpoint,
                HttpMethod.POST,
                entity,
                PythonChatResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                PythonChatResponse pythonResponse = response.getBody();
                if (pythonResponse.isSuccess()) {
                    logger.info("AI service response received successfully");
                    return pythonResponse.getReply();
                } else {
                    throw new RuntimeException("AI service returned error: " + pythonResponse.getMessage());
                }
            } else {
                throw new RuntimeException("AI service returned status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error calling AI service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to communicate with AI service: " + e.getMessage());
        }
    }
    
    /**
     * Get chat history for a user and module
     */
    public List<LearningChat> getChatHistory(Long userId, Long moduleId) {
        return learningChatRepository.findByUserIdAndModuleIdOrderByCreatedAtAsc(userId, moduleId);
    }
    
    /**
     * Get recent chat messages for a user and module
     */
    public List<LearningChat> getRecentChatMessages(Long userId, Long moduleId, int limit) {
        List<LearningChat> messages = learningChatRepository.findRecentByUserIdAndModuleIdOrderByCreatedAtDesc(userId, moduleId);
        return messages.stream().limit(limit).collect(Collectors.toList());
    }
    
    /**
     * Get chat statistics for a user and module
     */
    public long getChatMessageCount(Long userId, Long moduleId) {
        return learningChatRepository.countByUserIdAndModuleId(userId, moduleId);
    }
    
    // Python API request/response classes (matching Python endpoint schema)
    private static class PythonChatRequest {
        private Long user_id;
        private Long module_id;
        private String user_query;
        private List<PythonChatMessage> chat_history;
        
        // Getters and Setters
        public Long getUser_id() { return user_id; }
        public void setUser_id(Long user_id) { this.user_id = user_id; }
        
        public Long getModule_id() { return module_id; }
        public void setModule_id(Long module_id) { this.module_id = module_id; }
        
        public String getUser_query() { return user_query; }
        public void setUser_query(String user_query) { this.user_query = user_query; }
        
        public List<PythonChatMessage> getChat_history() { return chat_history; }
        public void setChat_history(List<PythonChatMessage> chat_history) { this.chat_history = chat_history; }
    }
    
    private static class PythonChatMessage {
        private String speaker;
        private String message;
        
        public PythonChatMessage() {}
        
        public PythonChatMessage(String speaker, String message) {
            this.speaker = speaker;
            this.message = message;
        }
        
        public String getSpeaker() { return speaker; }
        public void setSpeaker(String speaker) { this.speaker = speaker; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
    
    private static class PythonChatResponse {
        private boolean success;
        private String message;
        private String reply;
        private Long user_id;
        private Long module_id;
        private double processing_time_seconds;
        
        // Getters and Setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        
        public String getReply() { return reply; }
        public void setReply(String reply) { this.reply = reply; }
        
        public Long getUser_id() { return user_id; }
        public void setUser_id(Long user_id) { this.user_id = user_id; }
        
        public Long getModule_id() { return module_id; }
        public void setModule_id(Long module_id) { this.module_id = module_id; }
        
        public double getProcessing_time_seconds() { return processing_time_seconds; }
        public void setProcessing_time_seconds(double processing_time_seconds) { this.processing_time_seconds = processing_time_seconds; }
    }
} 