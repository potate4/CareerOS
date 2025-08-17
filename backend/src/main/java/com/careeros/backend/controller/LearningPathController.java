package com.careeros.backend.controller;

import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.AILearningPathRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.payload.response.AILearningPathResponse;
import com.careeros.backend.model.LearningPath;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.LearningPathService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/path")
public class LearningPathController {
    
    @Autowired
    private LearningPathService learningPathService;
    
    @Value("${ai.service.url:http://localhost:8001}")
    private String aiServiceUrl;
    
    private final WebClient webClient;
    
    public LearningPathController() {
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    
    /**
     * Generate a learning path using AI
     * @param request The learning path request
     * @return ResponseEntity containing the generated learning path
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateLearningPath(@Valid @RequestBody LearningPathRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("🚀 Generating learning path for user: " + userDetails.getId());
            
            LearningPathResponse response = learningPathService.generateLearningPath(userDetails.getId(), request);
            
            System.out.println("✅ Learning path generated successfully with " + 
                (response.getModules() != null ? response.getModules().size() : 0) + " modules");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to generate learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(new MessageResponse("Failed to generate learning path: " + e.getMessage()));
        }
    }
    
    /**
     * Get all learning paths for the current user
     * @return ResponseEntity containing all learning paths (without modules)
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllLearningPaths() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📚 Getting all learning paths for user: " + userDetails.getId());
            
            // Just get the learning paths without modules to avoid N+1 queries
            List<LearningPath> learningPaths = learningPathService.getAllLearningPathsForUser(userDetails.getId());
            
            // Convert to response DTOs
            List<LearningPathResponse> responses = learningPaths.stream()
                .map(LearningPathResponse::new)
                .collect(Collectors.toList());
            
            System.out.println("✅ Retrieved " + responses.size() + " learning paths");
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get all learning paths: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(new MessageResponse("Failed to retrieve learning paths: " + e.getMessage()));
        }
    }
    
    /**
     * Get modules for a specific learning path
     * @param learningPathId The learning path ID
     * @return ResponseEntity containing the learning path with modules
     */
    @GetMapping("/{learningPathId}/modules")
    public ResponseEntity<?> getLearningPathWithModules(@PathVariable Long learningPathId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📚 Getting modules for learning path: " + learningPathId);
            
            // Get the specific learning path with modules
            LearningPath learningPath = learningPathService.getLearningPathWithModules(learningPathId, userDetails.getId());
            
            // Convert to response DTO
            LearningPathResponse response = new LearningPathResponse(learningPath);
            
            System.out.println("✅ Retrieved learning path with " + (learningPath.getModules() != null ? learningPath.getModules().size() : 0) + " modules");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to get learning path with modules: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(new MessageResponse("Failed to retrieve learning path modules: " + e.getMessage()));
        }
    }
} 