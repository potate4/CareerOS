package com.careeros.backend.controller;

import com.careeros.backend.payload.request.MindFlowAnalysisRequest;
import com.careeros.backend.payload.request.MindFlowAnalysisCallbackRequest;
import com.careeros.backend.payload.request.CreateMindFlowSessionRequest;
import com.careeros.backend.payload.request.UpdateMindFlowSessionRequest;
import com.careeros.backend.payload.request.MindFlowConversationMessageRequest;
import com.careeros.backend.payload.response.MindFlowJobResponse;
import com.careeros.backend.payload.response.MindFlowSessionResponse;
import com.careeros.backend.payload.response.MindFlowConversationMessageResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.payload.response.FileAnalysisResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.MindFlowService;
import com.careeros.backend.service.MindFlowSessionService;
import com.careeros.backend.service.MindFlowConversationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/mindflow")
public class MindFlowController {
    
    @Autowired
    private MindFlowService mindFlowService;

    @Autowired
    private MindFlowSessionService mindFlowSessionService;

    @Autowired
    private MindFlowConversationService mindFlowConversationService;
    
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeMindFlow(@RequestBody MindFlowAnalysisRequest request) {
        try {
            System.out.println("🎯 MindFlow analysis request received: " + request.getVideoUrl());
            System.out.println("📋 MindFlow Request details - analysisType: " + request.getAnalysisType() + 
                             ", userId: " + request.getUserId() + ", scenarioType: " + request.getScenarioType());
            
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔐 MindFlow Authentication object: " + (authentication != null ? "Present" : "Null"));
            System.out.println("🔐 MindFlow Authentication name: " + (authentication != null ? authentication.getName() : "N/A"));
            System.out.println("🔐 MindFlow Authentication isAuthenticated: " + (authentication != null ? authentication.isAuthenticated() : "N/A"));
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ MindFlow Authentication failed - user not authenticated");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required for MindFlow analysis"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("👤 MindFlow User authenticated: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            // Set the user ID from the authenticated user
            request.setUserId(userDetails.getId().toString());
            
            MindFlowJobResponse response = mindFlowService.createMindFlowJob(request);
            System.out.println("✅ MindFlow analysis job created successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ MindFlow analysis failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("MindFlow analysis failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<?> checkMindFlowServiceHealth() {
        try {
            Map<String, Object> healthStatus = mindFlowService.checkMindFlowServiceHealth();
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "unhealthy",
                "service", "MindFlow Soft Skills Training Services",
                "error", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/test-auth")
    public ResponseEntity<?> testMindFlowAuthentication() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            System.out.println("🔍 MindFlow test-auth - Authentication object: " + (authentication != null ? "Present" : "Null"));
            System.out.println("🔍 MindFlow test-auth - Authentication name: " + (authentication != null ? authentication.getName() : "N/A"));
            System.out.println("🔍 MindFlow test-auth - isAuthenticated: " + (authentication != null ? authentication.isAuthenticated() : "N/A"));
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                
                return ResponseEntity.ok(Map.of(
                    "message", "MindFlow service authentication successful",
                    "user", Map.of(
                        "id", userDetails.getId(),
                        "username", userDetails.getUsername(),
                        "email", userDetails.getEmail()
                    ),
                    "timestamp", LocalDateTime.now()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No authentication provided for MindFlow service",
                    "status", "anonymous",
                    "authentication", authentication != null ? authentication.getName() : "null",
                    "timestamp", LocalDateTime.now()
                ));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of(
                "message", "MindFlow service test endpoint working",
                "error", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    @PostMapping("/analysis-callback")
    public ResponseEntity<?> handleAnalysisCallback(@RequestBody MindFlowAnalysisCallbackRequest callbackRequest) {
        try {
            System.out.println("🔄 MindFlow Analysis callback received for job: " + callbackRequest.getJobId());
            
            MindFlowJobResponse response = mindFlowService.handleAnalysisCallback(callbackRequest);
            System.out.println("✅ MindFlow Analysis callback processed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ MindFlow Analysis callback failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("MindFlow analysis callback failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable String jobId) {
        try {
            System.out.println("📊 Getting MindFlow job status for: " + jobId);
            
            MindFlowJobResponse response = mindFlowService.getJobStatus(jobId);
            System.out.println("✅ MindFlow Job status retrieved successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get MindFlow job status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get MindFlow job status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/jobs")
    public ResponseEntity<?> getUserJobs() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated for MindFlow jobs");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to get MindFlow user jobs"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("👤 Getting MindFlow jobs for user: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            java.util.List<MindFlowJobResponse> jobs = mindFlowService.getUserJobs(userDetails.getId());
            System.out.println("✅ MindFlow User jobs retrieved successfully");
            return ResponseEntity.ok(jobs);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get MindFlow user jobs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get MindFlow user jobs: " + e.getMessage()));
        }
    }

    @GetMapping("/files/analysis")
    public ResponseEntity<?> getFileAnalysisData() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated for MindFlow file analysis");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to get MindFlow file analysis data"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("📁 Getting MindFlow file analysis data for user: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            java.util.List<FileAnalysisResponse> fileAnalysisData = mindFlowService.getFileAnalysisData(userDetails.getId());
            System.out.println("✅ MindFlow File analysis data retrieved successfully");
            return ResponseEntity.ok(fileAnalysisData);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get MindFlow file analysis data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get MindFlow file analysis data: " + e.getMessage()));
        }
    }

    // ===== Session Management Endpoints =====

    @PostMapping("/sessions")
    public ResponseEntity<?> createSession(@RequestBody(required = false) CreateMindFlowSessionRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated for MindFlow session");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to create MindFlow session"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MindFlowSessionResponse response = mindFlowSessionService.createSession(userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to create MindFlow session: " + e.getMessage()));
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> listSessions(@RequestParam(value = "status", required = false) String status) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to list MindFlow sessions"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            java.util.List<MindFlowSessionResponse> sessions = mindFlowSessionService.listSessions(userDetails.getId(), status);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to list MindFlow sessions: " + e.getMessage()));
        }
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to get MindFlow session"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MindFlowSessionResponse response = mindFlowSessionService.getSession(sessionId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to get MindFlow session: " + e.getMessage()));
        }
    }

    @PatchMapping("/sessions/{sessionId}")
    public ResponseEntity<?> updateSession(@PathVariable String sessionId, @RequestBody UpdateMindFlowSessionRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to update MindFlow session"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MindFlowSessionResponse response = mindFlowSessionService.updateSession(sessionId, userDetails.getId(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to update MindFlow session: " + e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/end")
    public ResponseEntity<?> endSession(@PathVariable String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to end MindFlow session"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MindFlowSessionResponse response = mindFlowSessionService.endSession(sessionId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to end MindFlow session: " + e.getMessage()));
        }
    }

    // ===== Conversation Endpoints =====

    @GetMapping("/sessions/{sessionId}/conversation")
    public ResponseEntity<?> getConversation(@PathVariable String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403).body(new MessageResponse("Authentication required to fetch MindFlow conversation"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<MindFlowConversationMessageResponse> history = mindFlowConversationService.getConversation(sessionId, userDetails.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to fetch MindFlow conversation: " + e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/conversation")
    public ResponseEntity<?> addConversationMessage(@PathVariable String sessionId, @Valid @RequestBody MindFlowConversationMessageRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403).body(new MessageResponse("Authentication required to add MindFlow message"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            MindFlowConversationMessageResponse saved = mindFlowConversationService.appendMessage(sessionId, userDetails.getId(), request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to add MindFlow message: " + e.getMessage()));
        }
    }

    // Sim flow helpers

    @PostMapping("/sessions/{sessionId}/start")
    public ResponseEntity<?> startSimulation(@PathVariable String sessionId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403).body(new MessageResponse("Authentication required to start MindFlow simulation"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            // Get initial session data
            MindFlowSessionResponse session = mindFlowSessionService.getSession(sessionId, userDetails.getId());
            Map<String, Object> initialData;
            try {
                initialData = session.getSessionData() != null && !session.getSessionData().isEmpty()
                        ? new com.fasterxml.jackson.databind.ObjectMapper().readValue(session.getSessionData(), Map.class)
                        : Map.of();
            } catch (Exception ex) {
                initialData = Map.of();
            }
            Map<String, Object> result = mindFlowConversationService.generateFirstQuestionAndTTS(sessionId, userDetails.getId(), initialData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to start MindFlow simulation: " + e.getMessage()));
        }
    }

    @PostMapping("/sessions/{sessionId}/answer")
    public ResponseEntity<?> processUserAnswer(@PathVariable String sessionId, @RequestBody Map<String, String> body) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.status(403).body(new MessageResponse("Authentication required to process MindFlow answer"));
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String audioUrl = body.get("audioUrl");
            // Fire-and-forget async processing
            mindFlowConversationService.processUserAnswerAsync(sessionId, userDetails.getId(), audioUrl);
            // Return 202 with a jobId token for tracking (optional)
            String jobId = java.util.UUID.randomUUID().toString();
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "jobId", jobId,
                "status", "PENDING"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to process MindFlow answer: " + e.getMessage()));
        }
    }
}