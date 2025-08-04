package com.careeros.backend.controller;

import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.ModuleProgressRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.LearningPathService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/path")
public class LearningPathController {
    
    @Autowired
    private LearningPathService learningPathService;
    
    /**
     * Generate a personalized learning path based on career goal and current skills
     * @param request The learning path request containing career goal and current skills
     * @return ResponseEntity containing the generated learning path
     */
    @PostMapping
    public ResponseEntity<?> generateLearningPath(@Valid @RequestBody LearningPathRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("🎯 Generating learning path for user: " + userDetails.getUsername());
            System.out.println("📋 Career goal: " + request.getCareerGoal());
            System.out.println("📚 Current skills: " + request.getCurrentSkills());
            System.out.println("📈 Experience level: " + request.getExperienceLevel());
            System.out.println("⚡ Learning pace: " + request.getLearningPace());
            
            LearningPathResponse response = learningPathService.generateLearningPath(userDetails.getId(), request);
            
            System.out.println("✅ Learning path generated successfully with " + 
                             (response.getModules() != null ? response.getModules().size() : 0) + " modules");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to generate learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to generate learning path: " + e.getMessage()));
        }
    }
    
    /**
     * Get the current active learning path for the authenticated user
     * @return ResponseEntity containing the current learning path
     */
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCurrentLearningPath(@PathVariable Long userId) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Verify the user is requesting their own learning path
            if (!userDetails.getId().equals(userId)) {
                return ResponseEntity.status(403)
                        .body(new MessageResponse("Access denied: You can only view your own learning path"));
            }
            
            System.out.println("📖 Fetching learning path for user: " + userDetails.getUsername());
            
            LearningPathResponse response = learningPathService.getCurrentLearningPath(userId);
            
            System.out.println("✅ Learning path retrieved successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Failed to get learning path: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error getting learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get learning path: " + e.getMessage()));
        }
    }
    
    /**
     * Update module progress and adapt the learning path
     * @param request The module progress request
     * @return ResponseEntity containing the updated learning path
     */
    @PostMapping("/progress")
    public ResponseEntity<?> updateModuleProgress(@Valid @RequestBody ModuleProgressRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Updating module progress for user: " + userDetails.getUsername());
            System.out.println("🔢 Module ID: " + request.getModuleId());
            System.out.println("📈 Progress: " + request.getProgressPercentage() + "%");
            System.out.println("📋 Status: " + request.getStatus());
            
            if (request.getUserRating() != null) {
                System.out.println("⭐ User rating: " + request.getUserRating());
            }
            
            LearningPathResponse response = learningPathService.updateModuleProgress(userDetails.getId(), request);
            
            System.out.println("✅ Module progress updated successfully");
            System.out.println("📊 Overall progress: " + response.getOverallProgress() + "%");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Failed to update module progress: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update module progress: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating module progress: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update module progress: " + e.getMessage()));
        }
    }
    
    /**
     * Get learning path statistics for the authenticated user
     * @return ResponseEntity containing learning path statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getLearningPathStats() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Getting learning path stats for user: " + userDetails.getUsername());
            
            LearningPathResponse learningPath = learningPathService.getCurrentLearningPath(userDetails.getId());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("userId", userDetails.getId());
            stats.put("username", userDetails.getUsername());
            stats.put("careerGoal", learningPath != null ? learningPath.getCareerGoal() : "No career goal set");
            stats.put("currentStage", learningPath != null ? learningPath.getCurrentStage() : null);
            stats.put("overallProgress", learningPath != null ? learningPath.getOverallProgress() : 0.0);
            stats.put("estimatedCompletionWeeks", learningPath != null ? learningPath.getEstimatedCompletionWeeks() : 0);
            stats.put("totalModules", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getTotalModules() : 0);
            stats.put("completedModules", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getCompletedModules() : 0);
            stats.put("inProgressModules", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getInProgressModules() : 0);
            stats.put("notStartedModules", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getNotStartedModules() : 0);
            stats.put("averageRating", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getAverageRating() : 0.0);
            stats.put("totalEstimatedHours", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getTotalEstimatedHours() : 0);
            stats.put("completedHours", learningPath != null && learningPath.getStatistics() != null ? learningPath.getStatistics().getCompletedHours() : 0);
            
            System.out.println("✅ Learning path stats retrieved successfully");
            
            return ResponseEntity.ok(stats);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Failed to get learning path stats: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error getting learning path stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get learning path stats: " + e.getMessage()));
        }
    }
    
    /**
     * Health check endpoint for learning path service
     * @return ResponseEntity containing service health status
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkLearningPathHealth() {
        try {
            Map<String, Object> healthStatus = Map.of(
                "status", "healthy",
                "service", "Learning Path Service",
                "timestamp", java.time.LocalDateTime.now().toString(),
                "version", "1.0.0",
                "endpoints", Map.of(
                    "generatePath", "POST /api/path",
                    "getCurrentPath", "GET /api/path/{userId}",
                    "updateProgress", "POST /api/path/progress",
                    "getStats", "GET /api/path/stats"
                )
            );
            
            return ResponseEntity.ok(healthStatus);
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "status", "unhealthy",
                "service", "Learning Path Service",
                "error", e.getMessage(),
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
    
    /**
     * Test endpoint to verify authentication and service connectivity
     * @return ResponseEntity containing test results
     */
    @GetMapping("/test")
    public ResponseEntity<?> testLearningPathService() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                
                return ResponseEntity.ok(Map.of(
                    "message", "Learning Path Service authentication successful",
                    "user", Map.of(
                        "id", userDetails.getId(),
                        "username", userDetails.getUsername(),
                        "email", userDetails.getEmail()
                    ),
                    "service", "Learning Path Service",
                    "status", "operational",
                    "timestamp", java.time.LocalDateTime.now().toString()
                ));
            } else {
                return ResponseEntity.ok(Map.of(
                    "message", "No authentication provided for Learning Path Service",
                    "status", "anonymous",
                    "service", "Learning Path Service",
                    "timestamp", java.time.LocalDateTime.now().toString()
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "message", "Learning Path Service test endpoint working",
                "error", e.getMessage(),
                "service", "Learning Path Service",
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        }
    }
} 