package com.careeros.backend.controller;

import com.careeros.backend.payload.request.InterviewAnalysisRequest;
import com.careeros.backend.payload.request.InterviewAnalysisCallbackRequest;
import com.careeros.backend.payload.response.InterviewAnalysisResponse;
import com.careeros.backend.payload.response.InterviewJobResponse;
import com.careeros.backend.payload.response.InterviewJobDetailResponse;
import com.careeros.backend.payload.response.FileAnalysisResponse;
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
            
            InterviewJobResponse response = interviewService.createInterviewJob(request);
            System.out.println("✅ Interview analysis job created successfully");
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

    @PostMapping("/analysis-callback")
    public ResponseEntity<?> handleAnalysisCallback(@RequestBody InterviewAnalysisCallbackRequest callbackRequest) {
        try {
            System.out.println("🔄 Analysis callback received for job: " + callbackRequest.getJobId());
            
            InterviewJobResponse response = interviewService.handleAnalysisCallback(callbackRequest);
            System.out.println("✅ Analysis callback processed successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Analysis callback failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Analysis callback failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getJobStatus(@PathVariable String jobId) {
        try {
            System.out.println("📊 Getting job status for: " + jobId);
            
            InterviewJobResponse response = interviewService.getJobStatus(jobId);
            System.out.println("✅ Job status retrieved successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get job status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get job status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/job/{jobId}/detail")
    public ResponseEntity<?> getJobDetail(@PathVariable String jobId) {
        try {
            System.out.println("📊 Getting job details for: " + jobId);
            
            InterviewJobDetailResponse response = interviewService.getJobDetail(jobId);
            System.out.println("✅ Job details retrieved successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get job details: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get job details: " + e.getMessage()));
        }
    }
    
    @GetMapping("/jobs")
    public ResponseEntity<?> getUserJobs() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to get user jobs"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("👤 Getting jobs for user: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            java.util.List<InterviewJobResponse> jobs = interviewService.getUserJobs(userDetails.getId());
            System.out.println("✅ User jobs retrieved successfully");
            return ResponseEntity.ok(jobs);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get user jobs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get user jobs: " + e.getMessage()));
        }
    }
    
    @GetMapping("/files/analysis")
    public ResponseEntity<?> getFileAnalysisData() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                System.err.println("❌ Authentication failed - user not authenticated");
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Authentication required to get file analysis data"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            System.out.println("📁 Getting file analysis data for user: " + userDetails.getUsername() + " (ID: " + userDetails.getId() + ")");
            
            java.util.List<FileAnalysisResponse> fileAnalysisData = interviewService.getFileAnalysisData(userDetails.getId());
            System.out.println("✅ File analysis data retrieved successfully");
            return ResponseEntity.ok(fileAnalysisData);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get file analysis data: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get file analysis data: " + e.getMessage()));
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