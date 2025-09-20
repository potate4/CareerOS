package com.careeros.backend.service;

import com.careeros.backend.model.LearningPath;
import com.careeros.backend.model.LearningModule;
import com.careeros.backend.model.User;
import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.payload.response.AILearningPathResponse;
import com.careeros.backend.repository.LearningPathRepository;
import com.careeros.backend.repository.LearningModuleRepository;
import com.careeros.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.*;
import java.util.stream.Collectors;
import java.time.Duration;

@Service
@Transactional
public class LearningPathService {
    
    private final LearningPathRepository learningPathRepository;
    private final LearningModuleRepository learningModuleRepository;
    private final UserRepository userRepository;
    private final String aiServiceUrl;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public LearningPathService(
            LearningPathRepository learningPathRepository,
            LearningModuleRepository learningModuleRepository,
            UserRepository userRepository,
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.learningPathRepository = learningPathRepository;
        this.learningModuleRepository = learningModuleRepository;
        this.userRepository = userRepository;
        this.aiServiceUrl = aiServiceUrl;
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Generate a learning path using AI
     * @param userId The user ID
     * @param request The learning path request
     * @return LearningPathResponse containing the generated learning path
     */
    public LearningPathResponse generateLearningPath(Long userId, LearningPathRequest request) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Deactivate existing active learning paths
            deactivateExistingLearningPaths(userId);
            
            // Call AI service to generate modules
            AILearningPathResponse aiResponse = callAILearningPathGeneration(userId, request);
            
            if (aiResponse != null && aiResponse.getModules() != null && !aiResponse.getModules().isEmpty()) {
                return createLearningPathFromAIResponse(user, aiResponse, request);
            } else {
                System.out.println("⚠️ AI service unavailable, falling back to hardcoded generation");
                return generateFallbackLearningPath(userId, request);
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling AI service: " + e.getMessage());
            System.out.println("⚠️ Falling back to hardcoded generation");
            return generateFallbackLearningPath(userId, request);
        }
    }
    
    /**
     * Call the Python AI service to generate learning path modules
     * @param userId The user ID
     * @param request The learning path request
     * @return AILearningPathResponse from AI service
     */
    private AILearningPathResponse callAILearningPathGeneration(Long userId, LearningPathRequest request) {
        try {
            String learningPathInfo = request.toAIRequestString();
            System.out.println("🤖 Calling Python AI service for learning path generation...");
            System.out.println("📝 Learning path info: " + learningPathInfo);
            
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("user_id", userId.intValue());
            aiRequest.put("learning_path_info", learningPathInfo);
            
            JsonNode aiResponse = webClient.post()
                .uri(aiServiceUrl + "/api/v1/learning-path/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .block();
            
            if (aiResponse != null && aiResponse.has("modules")) {
                return parseAILearningPathResponse(aiResponse);
            } else {
                System.out.println("⚠️ AI service response format unexpected");
                return null;
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling AI service: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Parse the AI service response
     * @param aiResponse The JSON response from AI service
     * @return AILearningPathResponse object
     */
    private AILearningPathResponse parseAILearningPathResponse(JsonNode aiResponse) {
        try {
            List<AILearningPathResponse.AILearningModule> modules = new ArrayList<>();
            
            if (aiResponse.has("modules") && aiResponse.get("modules").isArray()) {
                for (JsonNode moduleNode : aiResponse.get("modules")) {
                    String moduleName = moduleNode.has("module_name") ? 
                        moduleNode.get("module_name").asText() : "Untitled Module";
                    String moduleDescription = moduleNode.has("module_description") ? 
                        moduleNode.get("module_description").asText() : "No description available";
                    
                    modules.add(new AILearningPathResponse.AILearningModule(moduleName, moduleDescription));
                }
            }
            
            return new AILearningPathResponse(modules);
        } catch (Exception e) {
            System.err.println("❌ Error parsing AI response: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Create a learning path from AI response
     * @param user The user
     * @param aiResponse The AI response
     * @param request The original request
     * @return LearningPathResponse
     */
    private LearningPathResponse createLearningPathFromAIResponse(User user, AILearningPathResponse aiResponse, LearningPathRequest request) {
        // Create the learning path
        LearningPath learningPath = new LearningPath(
            user, 
            request.getCareerGoal(),
            request.getExperienceLevel().name(),
            request.getLearningPace().name()
        );
        
        learningPath = learningPathRepository.save(learningPath);
        
        // Create modules from AI response
        List<LearningModule> modules = new ArrayList<>();
        for (int i = 0; i < aiResponse.getModules().size(); i++) {
            AILearningPathResponse.AILearningModule aiModule = aiResponse.getModules().get(i);
            
            LearningModule module = new LearningModule(
                aiModule.getModule_name(),
                aiModule.getModule_description(),
                i + 1
            );
            module.setLearningPath(learningPath);
            modules.add(module);
        }
        
        // Save all modules
        learningModuleRepository.saveAll(modules);
        learningPath.setModules(modules);
        
        return new LearningPathResponse(learningPath);
    }
    
    /**
     * Generate a fallback learning path when AI is unavailable
     * @param userId The user ID
     * @param request The learning path request
     * @return LearningPathResponse
     */
    private LearningPathResponse generateFallbackLearningPath(Long userId, LearningPathRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create the learning path
        LearningPath learningPath = new LearningPath(
            user, 
            request.getCareerGoal(),
            request.getExperienceLevel().name(),
            request.getLearningPace().name()
        );
        
        learningPath = learningPathRepository.save(learningPath);
        
        // Create fallback modules
        List<LearningModule> modules = new ArrayList<>();
        String[] fallbackModules = {
            "Introduction to " + request.getCareerGoal(),
            "Core Concepts and Fundamentals",
            "Practical Applications",
            "Advanced Techniques",
            "Project Work and Portfolio Building"
        };
        
        for (int i = 0; i < fallbackModules.length; i++) {
            LearningModule module = new LearningModule(
                fallbackModules[i],
                "This module covers essential aspects of " + fallbackModules[i].toLowerCase(),
                i + 1
            );
            module.setLearningPath(learningPath);
            modules.add(module);
        }
        
        // Save all modules
        learningModuleRepository.saveAll(modules);
        learningPath.setModules(modules);
        
        return new LearningPathResponse(learningPath);
    }

    /**
     * Get all learning paths for a user
     * @param userId The user ID
     * @return List of all learning paths for the user
     */
    public List<LearningPath> getAllLearningPathsForUser(Long userId) {
        return learningPathRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    /**
     * Get a specific learning path with modules for a user
     * @param learningPathId The learning path ID
     * @param userId The user ID
     * @return LearningPath with modules loaded
     */
    public LearningPath getLearningPathWithModules(Long learningPathId, Long userId) {
        // Get the learning path
        LearningPath learningPath = learningPathRepository.findById(learningPathId)
            .orElseThrow(() -> new RuntimeException("Learning path not found"));
        
        // Verify the learning path belongs to the user
        if (!learningPath.getUser().getId().equals(userId)) {
            throw new RuntimeException("Learning path does not belong to user");
        }
        
        // Fetch modules for this learning path
        List<LearningModule> modules = learningModuleRepository.findByLearningPathIdOrderByOrderIndex(learningPathId);
        learningPath.setModules(modules);
        
        return learningPath;
    }
    
    /**
     * Deactivate existing active learning paths for a user
     * @param userId The user ID
     */
    public void deactivateExistingLearningPaths(Long userId) {
        Optional<LearningPath> existingPath = learningPathRepository.findActiveLearningPathByUserId(userId);
        if (existingPath.isPresent()) {
            LearningPath path = existingPath.get();
            path.setIsActive(false);
            learningPathRepository.save(path);
        }
    }
} 