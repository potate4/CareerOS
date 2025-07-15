package com.careeros.backend.controller;

import com.careeros.backend.payload.request.AIAnalysisRequest;
import com.careeros.backend.payload.request.CareerRecommendationRequest;
import com.careeros.backend.payload.response.AIAnalysisResponse;
import com.careeros.backend.payload.response.CareerRecommendationResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AIController {
    
    @Autowired
    private AIService aiService;
    
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeContent(@Valid @RequestBody AIAnalysisRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Set the user ID from the authenticated user
            request.setUserId(userDetails.getId().intValue());
            
            AIAnalysisResponse response = aiService.analyzeContent(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("AI analysis failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/career-recommendations")
    public ResponseEntity<?> getCareerRecommendations(@Valid @RequestBody CareerRecommendationRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Set the user ID from the authenticated user
            request.setUserId(userDetails.getId().intValue());
            
            CareerRecommendationResponse response = aiService.getCareerRecommendations(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Career recommendations failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> checkAIHealth() {
        try {
            Map<String, Object> healthStatus = aiService.checkAIHealth();
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "unhealthy",
                "service", "AI Services",
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<?> getAIStatus() {
        try {
            Map<String, Object> status = aiService.checkAIHealth();
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "service", "AI Services",
                "status", "unavailable",
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testAuthentication() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                
                return ResponseEntity.ok(Map.of(
                    "message", "Authentication successful",
                    "user", Map.of(
                        "id", userDetails.getId(),
                        "username", userDetails.getUsername(),
                        "email", userDetails.getEmail()
                    ),
                    "timestamp", LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No authentication provided",
                    "status", "anonymous",
                    "timestamp", LocalDateTime.now()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Test endpoint working",
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
} 