package com.careeros.backend.controller;

import com.careeros.backend.model.LearningChat;
import com.careeros.backend.payload.request.LearningChatRequest;
import com.careeros.backend.payload.response.LearningChatResponse;
import com.careeros.backend.service.LearningChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/learning-chat")
@CrossOrigin(origins = "*")
public class LearningChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(LearningChatController.class);
    
    private final LearningChatService learningChatService;
    
    public LearningChatController(LearningChatService learningChatService) {
        this.learningChatService = learningChatService;
    }
    
    /**
     * Send a chat message and get AI response
     */
    @PostMapping("/chat")
    public ResponseEntity<LearningChatResponse> sendChatMessage(@Valid @RequestBody LearningChatRequest request) {
        logger.info("Received chat request from user {} for module {}", request.getUserId(), request.getModuleId());
        
        try {
            LearningChatResponse response = learningChatService.processChatRequest(request);
            
            if (response.isSuccess()) {
                logger.info("Chat processed successfully for user {} in module {}", request.getUserId(), request.getModuleId());
                return ResponseEntity.ok(response);
            } else {
                logger.warn("Chat processing failed for user {} in module {}: {}", request.getUserId(), request.getModuleId(), response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            logger.error("Error processing chat request: {}", e.getMessage(), e);
            LearningChatResponse errorResponse = new LearningChatResponse(
                false,
                "Internal server error: " + e.getMessage(),
                null,
                request.getUserId(),
                request.getModuleId(),
                0.0
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    /**
     * Get chat history for a user and module
     */
    @GetMapping("/history/{userId}/{moduleId}")
    public ResponseEntity<List<LearningChat>> getChatHistory(
            @PathVariable Long userId,
            @PathVariable Long moduleId) {
        
        logger.info("Fetching chat history for user {} in module {}", userId, moduleId);
        
        try {
            List<LearningChat> chatHistory = learningChatService.getChatHistory(userId, moduleId);
            logger.info("Retrieved {} chat messages for user {} in module {}", chatHistory.size(), userId, moduleId);
            return ResponseEntity.ok(chatHistory);
            
        } catch (Exception e) {
            logger.error("Error fetching chat history: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get recent chat messages for a user and module
     */
    @GetMapping("/recent/{userId}/{moduleId}")
    public ResponseEntity<List<LearningChat>> getRecentChatMessages(
            @PathVariable Long userId,
            @PathVariable Long moduleId,
            @RequestParam(defaultValue = "10") int limit) {
        
        logger.info("Fetching recent {} chat messages for user {} in module {}", limit, userId, moduleId);
        
        try {
            List<LearningChat> recentMessages = learningChatService.getRecentChatMessages(userId, moduleId, limit);
            logger.info("Retrieved {} recent chat messages for user {} in module {}", recentMessages.size(), userId, moduleId);
            return ResponseEntity.ok(recentMessages);
            
        } catch (Exception e) {
            logger.error("Error fetching recent chat messages: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get chat statistics for a user and module
     */
    @GetMapping("/stats/{userId}/{moduleId}")
    public ResponseEntity<Long> getChatStats(
            @PathVariable Long userId,
            @PathVariable Long moduleId) {
        
        logger.info("Fetching chat stats for user {} in module {}", userId, moduleId);
        
        try {
            long messageCount = learningChatService.getChatMessageCount(userId, moduleId);
            logger.info("User {} has {} chat messages in module {}", userId, messageCount, moduleId);
            return ResponseEntity.ok(messageCount);
            
        } catch (Exception e) {
            logger.error("Error fetching chat stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 