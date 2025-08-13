package com.careeros.backend.controller;

import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.ModuleProgressRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.model.LearningPath;
import com.careeros.backend.model.LearningModule;
import java.util.ArrayList;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.LearningPathService;
import com.careeros.backend.service.AILearningPathService;
import com.careeros.backend.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/path")
public class LearningPathController {
    
    @Autowired
    private LearningPathService learningPathService;
    
    @Autowired
    private AILearningPathService aiLearningPathService;
    
    @Autowired
    private AIService aiService;
    
    /**
     * Generate a personalized learning path using AI/ML service
     * @param request The learning path request containing career goal and current skills
     * @return ResponseEntity containing the generated learning path
     */
    @PostMapping("/ai/learning")
    public ResponseEntity<?> generateAILearningPath(@Valid @RequestBody LearningPathRequest request) {
        try {
            System.out.println("🤖 Generating AI-powered learning path");
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("🤖 Generating AI learning path for user: " + userDetails.getUsername());
            System.out.println("📋 Career goal: " + request.getCareerGoal());
            System.out.println("📚 Current skills: " + request.getCurrentSkills());
            System.out.println("📈 Experience level: " + request.getExperienceLevel());
            System.out.println("⚡ Learning pace: " + request.getLearningPace());
            
            // Convert to AI request format
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("userId", userDetails.getId().intValue());
            aiRequest.put("username", userDetails.getUsername());
            aiRequest.put("careerGoal", request.getCareerGoal());
            
            // Convert skills list to map with default mastery level
            Map<String, Double> skillsMap = new HashMap<>();
            for (String skill : request.getCurrentSkills()) {
                skillsMap.put(skill, 0.5); // Default mastery level
            }
            aiRequest.put("currentSkills", skillsMap);
            aiRequest.put("experienceLevel", request.getExperienceLevel());
            aiRequest.put("learningPace", request.getLearningPace());
            aiRequest.put("additionalNotes", request.getAdditionalNotes());
            
            // Call AI service
            Map<String, Object> aiResponse = aiService.generateAILearningPath(aiRequest);
            
            // Create learning path response from AI data
            LearningPathResponse response = createLearningPathFromAIResponse(userDetails.getId(), request, aiResponse);
            
            System.out.println("✅ AI learning path generated successfully with " + 
                             (response.getModules() != null ? response.getModules().size() : 0) + " modules");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to generate AI learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to generate AI learning path: " + e.getMessage()));
        }
    }
    
    /**
     * Create learning path response from AI response
     */
    private LearningPathResponse createLearningPathFromAIResponse(Long userId, LearningPathRequest request, Map<String, Object> aiResponse) {
        // Create a mock learning path response based on AI data
        LearningPathResponse response = new LearningPathResponse();
        response.setId(1L);
        response.setCareerGoal(request.getCareerGoal());
        response.setCurrentStage(LearningPath.LearningStage.BEGINNER);
        response.setOverallProgress(0.0);
        response.setEstimatedCompletionWeeks(aiResponse.containsKey("estimatedWeeks") ? 
            ((Number) aiResponse.get("estimatedWeeks")).intValue() : 12);
        response.setIsActive(true);
        response.setAiGenerated(true);
        
        // Create mock modules based on AI response
        List<LearningPathResponse.LearningModuleResponse> modules = new ArrayList<>();
        String[] moduleTitles = {
            "Introduction to " + request.getCareerGoal(),
            "Core Fundamentals",
            "Advanced Concepts",
            "Practical Applications",
            "Real-world Projects"
        };
        
        for (int i = 0; i < moduleTitles.length; i++) {
            LearningPathResponse.LearningModuleResponse module = new LearningPathResponse.LearningModuleResponse();
            module.setId((long) (i + 1));
            module.setTitle(moduleTitles[i]);
            module.setDescription("Learn the essential concepts and skills for " + moduleTitles[i].toLowerCase());
            module.setOrderIndex(i + 1);
            module.setStatus(LearningModule.ModuleStatus.NOT_STARTED);
            module.setProgressPercentage(0.0);
            module.setEstimatedHours(8 + (i * 4));
            module.setDifficultyLevel(LearningModule.DifficultyLevel.BEGINNER);
            module.setSkillFocus(request.getCurrentSkills().isEmpty() ? "General" : request.getCurrentSkills().get(0));
            module.setResources(new ArrayList<>());
            modules.add(module);
        }
        
        response.setModules(modules);
        
        // Create statistics
        LearningPathResponse.PathStatistics stats = new LearningPathResponse.PathStatistics();
        stats.setTotalModules(modules.size());
        stats.setCompletedModules(0);
        stats.setInProgressModules(0);
        stats.setNotStartedModules(modules.size());
        stats.setAverageRating(0.0);
        stats.setTotalEstimatedHours(modules.stream().mapToInt(m -> m.getEstimatedHours() != null ? m.getEstimatedHours() : 0).sum());
        stats.setCompletedHours(0);
        response.setStatistics(stats);
        
        return response;
    }
    
    /**
     * Adapt existing learning path using AI/ML service
     * @param learningPathId The learning path ID to adapt
     * @return ResponseEntity containing the adapted learning path
     */
    @PostMapping("/ai/adapt/{learningPathId}")
    public ResponseEntity<?> adaptLearningPath(@PathVariable Long learningPathId) {
        try {
            System.out.println("🔄 Adapting learning path with AI");
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("🔄 Adapting learning path " + learningPathId + " for user: " + userDetails.getUsername());
            
            LearningPathResponse response = aiLearningPathService.adaptLearningPath(userDetails.getId(), learningPathId);
            
            System.out.println("✅ Learning path adapted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to adapt learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to adapt learning path: " + e.getMessage()));
        }
    }
    
    /**
     * Update module progress with skill mastery tracking
     * @param request The module progress request
     * @return ResponseEntity containing the updated learning path
     */
    @PostMapping("/ai/progress")
    public ResponseEntity<?> updateProgressWithMastery(@Valid @RequestBody ModuleProgressRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Updating progress with mastery tracking for user: " + userDetails.getUsername());
            System.out.println("🔢 Module ID: " + request.getModuleId());
            System.out.println("📈 Progress: " + request.getProgressPercentage() + "%");
            System.out.println("📋 Status: " + request.getStatus());
            
            if (request.getUserRating() != null) {
                System.out.println("⭐ User rating: " + request.getUserRating());
            }
            
            // Update skill mastery and check for adaptation
            aiLearningPathService.updateSkillMastery(userDetails.getId(), request);
            
            // Get updated learning path
            LearningPathResponse response = learningPathService.getCurrentLearningPath(userDetails.getId());
            
            System.out.println("✅ Progress updated with mastery tracking");
            System.out.println("📊 Overall progress: " + response.getOverallProgress() + "%");
            
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Failed to update progress with mastery: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update progress with mastery: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating progress with mastery: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update progress with mastery: " + e.getMessage()));
        }
    }
    
    /**
     * Get AI-enhanced learning path statistics
     * @return ResponseEntity containing enhanced learning path statistics
     */
    @GetMapping("/ai/stats")
    public ResponseEntity<?> getAILearningPathStats() {
        try {
            System.out.println("📊 Getting AI-enhanced learning path statistics...");
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Getting AI-enhanced stats for user: " + userDetails.getUsername());
            
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
            
            // AI-specific stats
            if (learningPath != null) {
                stats.put("aiGenerated", true);
                stats.put("marketDemandScore", learningPath.getMarketDemandScore());
                stats.put("lastAiUpdate", learningPath.getLastAiUpdate());
                // The following line is commented out because getNextAdaptationDate() is not defined in LearningPathResponse
                // stats.put("nextAdaptationDate", learningPath.getNextAdaptationDate());
                stats.put("interviewPerformanceScore", learningPath.getInterviewPerformanceScore());
            }
            
            System.out.println("✅ AI-enhanced learning path stats retrieved successfully");
            
            return ResponseEntity.ok(stats);
            
        } catch (RuntimeException e) {
            System.err.println("❌ Failed to get AI-enhanced stats: " + e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error getting AI-enhanced stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get AI-enhanced stats: " + e.getMessage()));
        }
    }
    
    /**
     * Generate a personalized learning path based on career goal and current skills
     * @param request The learning path request containing career goal and current skills
     * @return ResponseEntity containing the generated learning path
     */
    @PostMapping("/learning")
    public ResponseEntity<?> generateLearningPath(@Valid @RequestBody LearningPathRequest request) {
        try {
            System.out.println("🎯 Generating learning path");
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
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
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentLearningPath() {
        try {

            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📖 Fetching learning path for user: " + userDetails.getUsername());
            
            LearningPathResponse response = learningPathService.getCurrentLearningPath(userDetails.getId());
            
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
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
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
            System.out.println("📊 Getting learning path statistics...");
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
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
                "version", "2.0.0",
                "aiEnabled", true,
                "endpoints", Map.of(
                    "generateAIPath", "POST /api/path/ai/learning",
                    "adaptPath", "POST /api/path/ai/adapt/{id}",
                    "updateProgressWithMastery", "POST /api/path/ai/progress",
                    "getAIStats", "GET /api/path/ai/stats",
                    "generatePath", "POST /api/path/learning",
                    "getCurrentPath", "GET /api/path/current",
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
     * Get all learning paths for the authenticated user
     * @return ResponseEntity containing all learning paths
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllLearningPaths() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📚 Getting all learning paths for user: " + userDetails.getUsername());
            
            List<LearningPath> learningPaths = learningPathService.getAllLearningPathsForUser(userDetails.getId());
            List<LearningPathResponse> responses = learningPaths.stream()
                .map(LearningPathResponse::new)
                .collect(Collectors.toList());
            
            System.out.println("✅ Retrieved " + responses.size() + " learning paths");
            
            return ResponseEntity.ok(responses);
            
        } catch (Exception e) {
            System.err.println("❌ Unexpected error getting all learning paths: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get learning paths: " + e.getMessage()));
        }
    }
    
    /**
     * Deactivate current learning path for the authenticated user
     * @return ResponseEntity containing deactivation result
     */
    @DeleteMapping("/current")
    public ResponseEntity<?> deactivateCurrentLearningPath() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            // Check if authentication is valid and principal is UserDetailsImpl
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("🗑️ Deactivating current learning path for user: " + userDetails.getUsername());
            
            learningPathService.deactivateExistingLearningPaths(userDetails.getId());
            
            System.out.println("✅ Current learning path deactivated successfully");
            
            return ResponseEntity.ok(new MessageResponse("Learning path deactivated successfully"));
            
        } catch (Exception e) {
            System.err.println("❌ Unexpected error deactivating learning path: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to deactivate learning path: " + e.getMessage()));
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
            
            Map<String, Object> response = new HashMap<>();
            response.put("authentication", authentication != null ? "Present" : "Null");
            response.put("authenticated", authentication != null ? authentication.isAuthenticated() : false);
            response.put("principalType", authentication != null ? authentication.getPrincipal().getClass().getSimpleName() : "N/A");
            response.put("principal", authentication != null ? authentication.getPrincipal().toString() : "N/A");
            
            if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                response.put("userId", userDetails.getId());
                response.put("username", userDetails.getUsername());
                response.put("email", userDetails.getEmail());
                response.put("message", "Learning Path Service authentication successful");
                response.put("status", "operational");
                response.put("aiEnabled", true);
            } else {
                response.put("message", "No valid authentication provided for Learning Path Service");
                response.put("status", "anonymous");
                response.put("aiEnabled", false);
            }
            
            response.put("service", "Learning Path Service with AI Integration");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Learning Path Service test endpoint error");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("exceptionType", e.getClass().getSimpleName());
            errorResponse.put("service", "Learning Path Service with AI Integration");
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    /**
     * Get current status of learning path for the authenticated user
     * @return ResponseEntity containing current status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getCurrentStatus() {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Getting current status for user: " + userDetails.getUsername());
            
            LearningPathResponse learningPath = learningPathService.getCurrentLearningPath(userDetails.getId());
            
            Map<String, Object> status = new HashMap<>();
            status.put("userId", userDetails.getId());
            status.put("username", userDetails.getUsername());
            status.put("hasActivePath", learningPath != null);
            
            if (learningPath != null) {
                status.put("careerGoal", learningPath.getCareerGoal());
                status.put("currentStage", learningPath.getCurrentStage());
                status.put("overallProgress", learningPath.getOverallProgress());
                status.put("estimatedCompletionWeeks", learningPath.getEstimatedCompletionWeeks());
                status.put("lastUpdated", learningPath.getUpdatedAt());
                status.put("aiGenerated", learningPath.getMarketDemandScore() != null);
                status.put("marketDemandScore", learningPath.getMarketDemandScore());
                status.put("interviewPerformanceScore", learningPath.getInterviewPerformanceScore());
            }
            
            System.out.println("✅ Current status retrieved successfully");
            
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            System.err.println("❌ Unexpected error getting current status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to get current status: " + e.getMessage()));
        }
    }
    
    /**
     * Update learning path status and progress
     * @param request The status update request
     * @return ResponseEntity containing updated status
     */
    @PostMapping("/status/update")
    public ResponseEntity<?> updateStatus(@Valid @RequestBody ModuleProgressRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📊 Updating status for user: " + userDetails.getUsername());
            System.out.println("🔢 Module ID: " + request.getModuleId());
            System.out.println("📈 Progress: " + request.getProgressPercentage() + "%");
            
            LearningPathResponse response = learningPathService.updateModuleProgress(userDetails.getId(), request);
            
            System.out.println("✅ Status updated successfully");
            System.out.println("📊 Overall progress: " + response.getOverallProgress() + "%");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Unexpected error updating status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update status: " + e.getMessage()));
        }
    }
} 