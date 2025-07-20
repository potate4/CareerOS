package com.careeros.backend.controller;

import com.careeros.backend.payload.request.InterviewAnalysisRequest;
import com.careeros.backend.payload.response.InterviewAnalysisResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.InterviewService;
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
@RequestMapping("/api/interview")
public class InterviewController {
    
    @Autowired
    private InterviewService interviewService;
    
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeInterview(@RequestBody InterviewAnalysisRequest request) {
        try {
            System.out.println("🎯 Interview analysis request received: " + request.getVideoUrl());
            System.out.println("📋 Request details - analysisType: " + request.getAnalysisType() + ", userId: " + request.getUserId());
            
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔐 Authentication object: " + (authentication != null ? "Present" : "Null"));
            System.out.println("🔐 Authentication name: " + (authentication != null ? authentication.getName() : "N/A"));
            System.out.println("🔐 Authentication isAuthenticated: " + (authentication != null ? authentication.isAuthenticated() : "N/A"));
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required for interview analysis"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("👤 User authenticated: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            // Set the user ID from the authenticated user
            request.setUserId(userDetails.getId().toString());
            
            InterviewAnalysisResponse response = interviewService.analyzeInterview(request);
            System.out.println("✅ Interview analysis completed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Interview analysis failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Interview analysis failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> checkInterviewServiceHealth() {
        try {
            Map<String, Object> healthStatus = interviewService.checkInterviewServiceHealth();
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "unhealthy",
                "service", "Interview Analysis Services",
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testInterviewAuthentication() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                
                return ResponseEntity.ok(Map.of(
                    "message", "Interview service authentication successful",
                    "user", Map.of(
                        "id", userDetails.getId(),
                        "username", userDetails.getUsername(),
                        "email", userDetails.getEmail()
                    ),
                    "timestamp", LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No authentication provided for interview service",
                    "status", "anonymous",
                    "timestamp", LocalDateTime.now()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Interview service test endpoint working",
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    @GetMapping("/test-post")
    public ResponseEntity<?> testPostAccess() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                
                return ResponseEntity.ok(Map.of(
                    "message", "POST access test successful",
                    "user", Map.of(
                        "id", userDetails.getId(),
                        "username", userDetails.getUsername(),
                        "email", userDetails.getEmail()
                    ),
                    "timestamp", LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No authentication provided for POST test",
                    "status", "anonymous",
                    "timestamp", LocalDateTime.now()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "POST test endpoint working",
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }
} 