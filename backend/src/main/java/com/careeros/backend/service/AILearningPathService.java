package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.ModuleProgressRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AILearningPathService {
    
    @Autowired
    private LearningPathRepository learningPathRepository;
    
    @Autowired
    private LearningModuleRepository learningModuleRepository;
    
    @Autowired
    private SkillRepository skillRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SkillMasteryRepository skillMasteryRepository;
    
    @Autowired
    private MarketTrendRepository marketTrendRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    @Value("${ai.service.api.key:}")
    private String aiServiceApiKey;
    
    /**
     * Generate a personalized learning path using AI/ML service
     */
    public LearningPathResponse generateAILearningPath(Long userId, LearningPathRequest request) {
        try {
            // Get user and current skills
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Gather user data for AI analysis
            Map<String, Object> userData = gatherUserDataForAI(userId);
            
            // Add request data
            userData.put("careerGoal", request.getCareerGoal());
            userData.put("experienceLevel", request.getExperienceLevel());
            userData.put("learningPace", request.getLearningPace());
            userData.put("additionalNotes", request.getAdditionalNotes());
            
            // Call AI service
            Map<String, Object> aiResponse = callAIService("/generate-learning-path", userData);
            
            // Process AI response and create learning path
            LearningPath learningPath = createLearningPathFromAIResponse(user, request, aiResponse);
            
            // Save and return
            LearningPath savedPath = learningPathRepository.save(learningPath);
            return new LearningPathResponse(savedPath);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate AI learning path: " + e.getMessage(), e);
        }
    }
    
    /**
     * Adapt existing learning path based on progress and market changes
     */
    public LearningPathResponse adaptLearningPath(Long userId, Long learningPathId) {
        try {
            LearningPath learningPath = learningPathRepository.findById(learningPathId)
                .orElseThrow(() -> new RuntimeException("Learning path not found"));
            
            // Check if adaptation is needed
            if (!isAdaptationNeeded(learningPath)) {
                return new LearningPathResponse(learningPath);
            }
            
            // Gather current state data
            Map<String, Object> adaptationData = gatherAdaptationData(userId, learningPathId);
            
            // Call AI service for adaptation
            Map<String, Object> aiResponse = callAIService("/adapt-learning-path", adaptationData);
            
            // Apply adaptations
            applyAIAdaptations(learningPath, aiResponse);
            
            // Update adaptation tracking
            learningPath.setLastAiUpdate(LocalDateTime.now());
            learningPath.setNextAdaptationDate(LocalDateTime.now().plusDays(learningPath.getAdaptationFrequencyDays()));
            
            LearningPath savedPath = learningPathRepository.save(learningPath);
            return new LearningPathResponse(savedPath);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to adapt learning path: " + e.getMessage(), e);
        }
    }
    
    /**
     * Update skill mastery based on progress
     */
    public void updateSkillMastery(Long userId, ModuleProgressRequest request) {
        try {
            LearningModule module = learningModuleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found"));
            
            // Update module progress
            module.setProgressPercentage(request.getProgressPercentage());
            module.setStatus(request.getStatus());
            module.setSkillMasteryLevel(calculateSkillMastery(request.getProgressPercentage(), request.getUserRating()));
            
            if (request.getUserRating() != null) {
                module.setUserRating(request.getUserRating());
            }
            
            if (request.getUserFeedback() != null) {
                module.setUserFeedback(request.getUserFeedback());
            }
            
            learningModuleRepository.save(module);
            
            // Update overall skill mastery
            updateOverallSkillMastery(userId, module.getSkillFocus(), module.getSkillMasteryLevel());
            
            // Check if adaptation is needed
            checkAndTriggerAdaptation(userId, module.getLearningPath().getId());
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update skill mastery: " + e.getMessage(), e);
        }
    }
    
    /**
     * Gather comprehensive user data for AI analysis
     */
    private Map<String, Object> gatherUserDataForAI(Long userId) {
        Map<String, Object> userData = new HashMap<>();
        
        // User profile
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            userData.put("userId", userId);
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
        }
        
        // Current skills and mastery levels
        List<SkillMastery> skillMasteries = skillMasteryRepository.findByUserId(userId);
        Map<String, Double> skillLevels = skillMasteries.stream()
            .collect(Collectors.toMap(SkillMastery::getSkillName, SkillMastery::getMasteryLevel));
        userData.put("currentSkills", skillLevels);
        
        // Interview performance
        userData.put("interviewPerformance", getInterviewPerformance(userId));
        
        // Market trends for relevant skills
        userData.put("marketTrends", getMarketTrendsForSkills(skillLevels.keySet()));
        
        // Learning history
        userData.put("learningHistory", getLearningHistory(userId));
        
        return userData;
    }
    
    /**
     * Gather data for learning path adaptation
     */
    private Map<String, Object> gatherAdaptationData(Long userId, Long learningPathId) {
        Map<String, Object> adaptationData = new HashMap<>();
        
        // Current learning path state
        LearningPath learningPath = learningPathRepository.findById(learningPathId).orElse(null);
        if (learningPath != null) {
            adaptationData.put("learningPathId", learningPathId);
            adaptationData.put("currentProgress", learningPath.getOverallProgress());
            adaptationData.put("currentStage", learningPath.getCurrentStage());
            adaptationData.put("estimatedCompletionWeeks", learningPath.getEstimatedCompletionWeeks());
        }
        
        // Recent progress updates
        adaptationData.put("recentProgress", getRecentProgressUpdates(learningPathId));
        
        // Updated skill mastery levels
        List<SkillMastery> skillMasteries = skillMasteryRepository.findByUserId(userId);
        adaptationData.put("updatedSkillLevels", skillMasteries.stream()
            .collect(Collectors.toMap(SkillMastery::getSkillName, SkillMastery::getMasteryLevel)));
        
        // Market changes
        adaptationData.put("marketChanges", getRecentMarketChanges());
        
        return adaptationData;
    }
    
    /**
     * Call AI service endpoint
     */
    private Map<String, Object> callAIService(String endpoint, Map<String, Object> data) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (aiServiceApiKey != null && !aiServiceApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + aiServiceApiKey);
            }
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(data, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                aiServiceUrl + endpoint, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return (Map<String, Object>) response.getBody();
            } else {
                throw new RuntimeException("AI service returned error: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI service: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create learning path from AI response
     */
    private LearningPath createLearningPathFromAIResponse(User user, LearningPathRequest request, 
                                                        Map<String, Object> aiResponse) {
        LearningPath learningPath = new LearningPath(user, request.getCareerGoal());
        
        // Set AI-specific fields
        learningPath.setAiGenerated(true);
        learningPath.setLastAiUpdate(LocalDateTime.now());
        learningPath.setMarketDemandScore(getDoubleValue(aiResponse, "marketDemandScore"));
        learningPath.setCurrentMarketTrends(getStringValue(aiResponse, "marketTrends"));
        
        // Create modules from AI response
        List<Map<String, Object>> aiModules = (List<Map<String, Object>>) aiResponse.get("modules");
        List<LearningModule> modules = new ArrayList<>();
        
        if (aiModules != null) {
            for (int i = 0; i < aiModules.size(); i++) {
                Map<String, Object> aiModule = aiModules.get(i);
                LearningModule module = createModuleFromAIResponse(aiModule, i + 1);
                module.setLearningPath(learningPath);
                modules.add(module);
            }
        }
        
        learningPath.setModules(modules);
        learningPath.setEstimatedCompletionWeeks(getIntegerValue(aiResponse, "estimatedWeeks"));
        
        return learningPath;
    }
    
    /**
     * Create module from AI response
     */
    private LearningModule createModuleFromAIResponse(Map<String, Object> aiModule, int orderIndex) {
        LearningModule module = new LearningModule();
        
        module.setTitle(getStringValue(aiModule, "title"));
        module.setDescription(getStringValue(aiModule, "description"));
        module.setSkillFocus(getStringValue(aiModule, "skillFocus"));
        module.setDifficultyLevel(parseDifficultyLevel(getStringValue(aiModule, "difficultyLevel")));
        module.setEstimatedHours(getIntegerValue(aiModule, "estimatedHours"));
        module.setOrderIndex(orderIndex);
        module.setAiRecommended(true);
        module.setMarketRelevanceScore(getDoubleValue(aiModule, "marketRelevance"));
        module.setPrerequisites(getStringValue(aiModule, "prerequisites"));
        
        return module;
    }
    
    /**
     * Apply AI adaptations to existing learning path
     */
    private void applyAIAdaptations(LearningPath learningPath, Map<String, Object> aiResponse) {
        // Update existing modules
        List<Map<String, Object>> updatedModules = (List<Map<String, Object>>) aiResponse.get("updatedModules");
        if (updatedModules != null) {
            for (Map<String, Object> updatedModule : updatedModules) {
                Long moduleId = getLongValue(updatedModule, "moduleId");
                LearningModule module = learningPath.getModules().stream()
                    .filter(m -> m.getId().equals(moduleId))
                    .findFirst()
                    .orElse(null);
                
                if (module != null) {
                    applyModuleUpdates(module, updatedModule);
                }
            }
        }
        
        // Add new modules if needed
        List<Map<String, Object>> newModules = (List<Map<String, Object>>) aiResponse.get("newModules");
        if (newModules != null) {
            for (Map<String, Object> newModule : newModules) {
                LearningModule module = createModuleFromAIResponse(newModule, 
                    learningPath.getModules().size() + 1);
                module.setLearningPath(learningPath);
                learningPath.getModules().add(module);
            }
        }
        
        // Update overall path
        learningPath.setOverallProgress(getDoubleValue(aiResponse, "overallProgress"));
        learningPath.setCurrentStage(parseLearningStage(getStringValue(aiResponse, "currentStage")));
        learningPath.setEstimatedCompletionWeeks(getIntegerValue(aiResponse, "estimatedWeeks"));
    }
    
    /**
     * Check if adaptation is needed
     */
    private boolean isAdaptationNeeded(LearningPath learningPath) {
        if (learningPath.getNextAdaptationDate() == null) {
            return true;
        }
        
        return LocalDateTime.now().isAfter(learningPath.getNextAdaptationDate()) ||
               learningPath.getOverallProgress() > 0.8; // High progress might need adaptation
    }
    
    /**
     * Calculate skill mastery level
     */
    private Double calculateSkillMastery(Double progress, Integer rating) {
        double baseMastery = progress / 100.0;
        
        if (rating != null) {
            // Factor in user rating (1-5 scale)
            double ratingFactor = (rating - 3.0) / 2.0; // -1 to 1
            baseMastery += ratingFactor * 0.1; // Adjust by ±10%
        }
        
        return Math.max(0.0, Math.min(1.0, baseMastery));
    }
    
    /**
     * Update overall skill mastery
     */
    private void updateOverallSkillMastery(Long userId, String skillName, Double newLevel) {
        Optional<SkillMastery> optionalSkillMastery = skillMasteryRepository.findByUserIdAndSkillName(userId, skillName);
        SkillMastery skillMastery = optionalSkillMastery.orElseGet(() -> 
            new SkillMastery(userRepository.findById(userId).orElse(null), skillName)
        );
        
        skillMastery.setMasteryLevel(newLevel);
        skillMastery.setLastAssessmentDate(LocalDateTime.now());
        skillMasteryRepository.save(skillMastery);
    }
    
    /**
     * Check and trigger adaptation if needed
     */
    private void checkAndTriggerAdaptation(Long userId, Long learningPathId) {
        LearningPath learningPath = learningPathRepository.findById(learningPathId).orElse(null);
        if (learningPath != null && isAdaptationNeeded(learningPath)) {
            // Trigger adaptation asynchronously
            new Thread(() -> {
                try {
                    adaptLearningPath(userId, learningPathId);
                } catch (Exception e) {
                    System.err.println("Failed to trigger adaptation: " + e.getMessage());
                }
            }).start();
        }
    }
    
    // Helper methods for data extraction
    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }
    
    private Double getDoubleValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return value != null ? Double.parseDouble(value.toString()) : null;
    }
    
    private Integer getIntegerValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return value != null ? Integer.parseInt(value.toString()) : null;
    }
    
    private Long getLongValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return value != null ? Long.parseLong(value.toString()) : null;
    }
    
    // Helper methods for parsing enums
    private LearningModule.DifficultyLevel parseDifficultyLevel(String level) {
        try {
            return LearningModule.DifficultyLevel.valueOf(level.toUpperCase());
        } catch (Exception e) {
            return LearningModule.DifficultyLevel.BEGINNER;
        }
    }
    
    private LearningPath.LearningStage parseLearningStage(String stage) {
        try {
            return LearningPath.LearningStage.valueOf(stage.toUpperCase());
        } catch (Exception e) {
            return LearningPath.LearningStage.BEGINNER;
        }
    }
    
    // Placeholder methods for data gathering (implement based on your existing services)
    private Map<String, Object> getInterviewPerformance(Long userId) {
        // Implement based on your interview service
        return new HashMap<>();
    }
    
    private Map<String, Object> getMarketTrendsForSkills(Set<String> skills) {
        // Implement based on your market trends service
        return new HashMap<>();
    }
    
    private Map<String, Object> getLearningHistory(Long userId) {
        // Implement based on your learning history service
        return new HashMap<>();
    }
    
    private List<Map<String, Object>> getRecentProgressUpdates(Long learningPathId) {
        // Implement based on your progress tracking service
        return new ArrayList<>();
    }
    
    private Map<String, Object> getRecentMarketChanges() {
        // Implement based on your market trends service
        return new HashMap<>();
    }
    
    private void applyModuleUpdates(LearningModule module, Map<String, Object> updates) {
        // Apply updates to module based on AI recommendations
        if (updates.containsKey("title")) {
            module.setTitle(getStringValue(updates, "title"));
        }
        if (updates.containsKey("description")) {
            module.setDescription(getStringValue(updates, "description"));
        }
        if (updates.containsKey("estimatedHours")) {
            module.setEstimatedHours(getIntegerValue(updates, "estimatedHours"));
        }
        if (updates.containsKey("orderIndex")) {
            module.setOrderIndex(getIntegerValue(updates, "orderIndex"));
        }
    }
}
