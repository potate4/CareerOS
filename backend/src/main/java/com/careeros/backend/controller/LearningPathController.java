package com.careeros.backend.controller;

import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.ModuleProgressRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.model.LearningPath;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.LearningPathService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
     * Upload and process learning materials (PDF, DOCX, PPTX)
     * @param files The uploaded files
     * @return ResponseEntity containing processing results
     */
    @PostMapping("/upload-materials")
    public ResponseEntity<?> uploadLearningMaterials(@RequestParam("files") List<MultipartFile> files) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            System.out.println("📁 Processing " + files.size() + " learning materials for user: " + userDetails.getUsername());
            
            // Validate file types
            List<String> allowedTypes = List.of("pdf", "docx", "pptx", "doc", "ppt");
            for (MultipartFile file : files) {
                String originalFilename = file.getOriginalFilename();
                if (originalFilename == null) {
                    return ResponseEntity.badRequest()
                        .body(new MessageResponse("Invalid file: filename is null"));
                }
                
                String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
                if (!allowedTypes.contains(fileExtension)) {
                    return ResponseEntity.badRequest()
                        .body(new MessageResponse("Unsupported file type: " + fileExtension + 
                                                ". Allowed types: " + String.join(", ", allowedTypes)));
                }
            }
            
            // TODO: Save files and create file info list
            // For now, return a mock response indicating AI integration is needed
            List<Map<String, Object>> fileInfos = new ArrayList<>();
            for (MultipartFile file : files) {
                Map<String, Object> fileInfo = new HashMap<>();
                fileInfo.put("filename", file.getOriginalFilename());
                fileInfo.put("file_size", file.getSize());
                fileInfo.put("file_type", file.getOriginalFilename().substring(
                    file.getOriginalFilename().lastIndexOf(".") + 1).toLowerCase());
                // fileInfo.put("file_path", savedFilePath); // Would be actual saved path
                fileInfos.add(fileInfo);
            }
            
            // Process materials using AI service
            Map<String, Object> processingResult = learningPathService.processLearningMaterials(
                userDetails.getId(), fileInfos);
            
            System.out.println("✅ Learning materials processed successfully");
            
            return ResponseEntity.ok(processingResult);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to process learning materials: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to process learning materials: " + e.getMessage()));
        }
    }

    /**
     * Chat with learning resources for a specific module
     * @param request The chat request containing query and context
     * @return ResponseEntity containing the chat response
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chatWithLearningResources(@Valid @RequestBody Map<String, Object> request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Extract request parameters
            Long moduleId = Long.valueOf(request.get("module_id").toString());
            String query = request.get("query").toString();
            @SuppressWarnings("unchecked")
            List<Map<String, String>> chatHistory = (List<Map<String, String>>) request.get("chat_history");
            
            System.out.println("💬 Processing chat query for user: " + userDetails.getUsername() + 
                             ", module: " + moduleId);
            
            // Call AI service for chat functionality
            Map<String, Object> chatResponse = learningPathService.chatWithLearningResources(
                userDetails.getId(), moduleId, query, chatHistory);
            
            System.out.println("✅ Chat response generated successfully");
            
            return ResponseEntity.ok(chatResponse);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to process chat query: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to process chat query: " + e.getMessage()));
        }
    }

    /**
     * Generate assessment for a learning module
     * @param request The assessment generation request
     * @return ResponseEntity containing the generated assessment
     */
    @PostMapping("/generate-assessment")
    public ResponseEntity<?> generateAssessment(@Valid @RequestBody Map<String, Object> request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Extract request parameters
            Long moduleId = Long.valueOf(request.get("module_id").toString());
            String skillFocus = request.get("skill_focus").toString();
            String difficultyLevel = request.get("difficulty_level").toString();
            
            System.out.println("📝 Generating assessment for user: " + userDetails.getUsername() + 
                             ", module: " + moduleId + ", skill: " + skillFocus);
            
            // Call AI service for assessment generation
            Map<String, Object> assessment = learningPathService.generateAssessment(
                userDetails.getId(), moduleId, skillFocus, difficultyLevel);
            
            System.out.println("✅ Assessment generated successfully");
            
            return ResponseEntity.ok(assessment);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to generate assessment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to generate assessment: " + e.getMessage()));
        }
    }

    /**
     * Submit and evaluate assessment responses
     * @param request The assessment submission request
     * @return ResponseEntity containing the evaluation results
     */
    @PostMapping("/submit-assessment")
    public ResponseEntity<?> submitAssessment(@Valid @RequestBody Map<String, Object> request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Extract request parameters
            String assessmentId = request.get("assessment_id").toString();
            @SuppressWarnings("unchecked")
            Map<String, Object> responses = (Map<String, Object>) request.get("responses");
            
            System.out.println("📊 Evaluating assessment for user: " + userDetails.getUsername() + 
                             ", assessment: " + assessmentId);
            
            // Call AI service for assessment evaluation
            Map<String, Object> evaluation = learningPathService.evaluateAssessment(
                userDetails.getId(), assessmentId, responses);
            
            System.out.println("✅ Assessment evaluated successfully");
            
            return ResponseEntity.ok(evaluation);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to evaluate assessment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to evaluate assessment: " + e.getMessage()));
        }
    }

    /**
     * Process web resources (YouTube videos, articles) for a learning module
     * @param request The web resource processing request
     * @return ResponseEntity containing processing results
     */
    @PostMapping("/process-web-resources")
    public ResponseEntity<?> processWebResources(@Valid @RequestBody Map<String, Object> request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated() || 
                !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                return ResponseEntity.status(401)
                    .body(new MessageResponse("Authentication required. Please login again."));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            
            // Extract request parameters
            Long moduleId = Long.valueOf(request.get("module_id").toString());
            @SuppressWarnings("unchecked")
            List<String> urls = (List<String>) request.get("urls");
            
            System.out.println("🌐 Processing " + urls.size() + " web resources for user: " + 
                             userDetails.getUsername() + ", module: " + moduleId);
            
            // TODO: Implement web resource processing via AI service
            // For now, return a success response
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("processed_urls", urls.size());
            result.put("message", "Web resources processing initiated");
            
            System.out.println("✅ Web resources processing initiated");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ Failed to process web resources: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to process web resources: " + e.getMessage()));
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
                "version", "1.0.0",
                "ai_integration", "enabled",
                "endpoints", Map.of(
                    "generatePath", "POST /api/path/learning",
                    "getCurrentPath", "GET /api/path/current",
                    "updateProgress", "POST /api/path/progress",
                    "getStats", "GET /api/path/stats",
                    "uploadMaterials", "POST /api/path/upload-materials",
                    "chat", "POST /api/path/chat",
                    "generateAssessment", "POST /api/path/generate-assessment",
                    "submitAssessment", "POST /api/path/submit-assessment",
                    "processWebResources", "POST /api/path/process-web-resources"
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
            } else {
                response.put("message", "No valid authentication provided for Learning Path Service");
                response.put("status", "anonymous");
            }
            
            response.put("service", "Learning Path Service");
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Learning Path Service test endpoint error");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("exceptionType", e.getClass().getSimpleName());
            errorResponse.put("service", "Learning Path Service");
            errorResponse.put("timestamp", java.time.LocalDateTime.now().toString());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 