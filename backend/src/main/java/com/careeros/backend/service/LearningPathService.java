package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.LearningPathRequest;
import com.careeros.backend.payload.request.ModuleProgressRequest;
import com.careeros.backend.payload.response.LearningPathResponse;
import com.careeros.backend.repository.LearningPathRepository;
import com.careeros.backend.repository.LearningModuleRepository;
import com.careeros.backend.repository.SkillRepository;
import com.careeros.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class LearningPathService {
    
    @Autowired
    private LearningPathRepository learningPathRepository;
    
    @Autowired
    private LearningModuleRepository learningModuleRepository;
    
    @Autowired
    private SkillRepository skillRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Generate a personalized learning path based on career goal and current skills
     * @param userId The user ID
     * @param request The learning path request containing career goal and current skills
     * @return LearningPathResponse containing the generated learning path
     */
    public LearningPathResponse generateLearningPath(Long userId, LearningPathRequest request) {
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Deactivate any existing active learning paths
        deactivateExistingLearningPaths(userId);
        
        // Create new learning path
        LearningPath learningPath = new LearningPath(user, request.getCareerGoal());
        
        // Determine required skills based on career goal
        List<String> requiredSkills = mapCareerGoalToSkills(request.getCareerGoal());
        
        // Get user's current skills
        List<Skill> userSkills = skillRepository.findByUserId(userId);
        Set<String> userSkillNames = userSkills.stream()
            .map(Skill::getName)
            .map(String::toLowerCase)
            .collect(Collectors.toSet());
        
        // Identify skill gaps
        List<String> skillGaps = requiredSkills.stream()
            .filter(skill -> !userSkillNames.contains(skill.toLowerCase()))
            .collect(Collectors.toList());
        
        // Generate learning modules based on skill gaps and experience level
        List<LearningModule> modules = generateLearningModules(learningPath, skillGaps, 
                                                              request.getExperienceLevel(), 
                                                              request.getLearningPace());
        
        // Set estimated completion weeks based on learning pace
        int estimatedWeeks = calculateEstimatedWeeks(modules, request.getLearningPace());
        learningPath.setEstimatedCompletionWeeks(estimatedWeeks);
        
        // Save learning path and modules
        final LearningPath savedLearningPath = learningPathRepository.save(learningPath);
        
        // Set the learning path reference for each module and save
        modules.forEach(module -> {
            module.setLearningPath(savedLearningPath);
            learningModuleRepository.save(module);
        });
        
        return new LearningPathResponse(learningPath);
    }
    
    /**
     * Get the current active learning path for a user
     * @param userId The user ID
     * @return LearningPathResponse containing the active learning path
     */
    public LearningPathResponse getCurrentLearningPath(Long userId) {
        LearningPath learningPath = learningPathRepository.findActiveLearningPathByUserId(userId)
            .orElseThrow(() -> new RuntimeException("No active learning path found for user"));
        
        return new LearningPathResponse(learningPath);
    }
    
    /**
     * Update module progress and adapt the learning path
     * @param userId The user ID
     * @param request The module progress request
     * @return LearningPathResponse containing the updated learning path
     */
    public LearningPathResponse updateModuleProgress(Long userId, ModuleProgressRequest request) {
        // Get the module
        LearningModule module = learningModuleRepository.findById(request.getModuleId())
            .orElseThrow(() -> new RuntimeException("Module not found"));
        
        // Verify the module belongs to the user's learning path
        if (!module.getLearningPath().getUser().getId().equals(userId)) {
            throw new RuntimeException("Module does not belong to user's learning path");
        }
        
        // Update module progress
        module.setProgressPercentage(request.getProgressPercentage());
        module.setStatus(request.getStatus());
        
        if (request.getUserRating() != null) {
            module.setUserRating(request.getUserRating());
        }
        
        if (request.getUserFeedback() != null) {
            module.setUserFeedback(request.getUserFeedback());
        }
        
        learningModuleRepository.save(module);
        
        // Update overall learning path progress
        updateLearningPathProgress(module.getLearningPath());
        
        // Adapt the learning path based on progress and feedback
        adaptLearningPath(module.getLearningPath());
        
        return new LearningPathResponse(module.getLearningPath());
    }
    
    /**
     * Map career goal to required skills (mock implementation)
     * @param careerGoal The career goal
     * @return List of required skills
     */
    private List<String> mapCareerGoalToSkills(String careerGoal) {
        Map<String, List<String>> careerSkillMap = new HashMap<>();
        
        // Full Stack Developer skills
        careerSkillMap.put("full stack developer", Arrays.asList(
            "HTML", "CSS", "JavaScript", "React", "Node.js", "Express.js", 
            "MongoDB", "SQL", "Git", "REST APIs", "TypeScript", "Docker"
        ));
        
        // Frontend Developer skills
        careerSkillMap.put("frontend developer", Arrays.asList(
            "HTML", "CSS", "JavaScript", "React", "Vue.js", "Angular", 
            "TypeScript", "SASS", "Webpack", "Git", "Responsive Design"
        ));
        
        // Backend Developer skills
        careerSkillMap.put("backend developer", Arrays.asList(
            "Java", "Spring Boot", "Python", "Django", "Node.js", "Express.js",
            "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "REST APIs"
        ));
        
        // Data Scientist skills
        careerSkillMap.put("data scientist", Arrays.asList(
            "Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", 
            "TensorFlow", "PyTorch", "Jupyter", "Statistics", "Machine Learning"
        ));
        
        // DevOps Engineer skills
        careerSkillMap.put("devops engineer", Arrays.asList(
            "Docker", "Kubernetes", "AWS", "Azure", "Jenkins", "GitLab CI/CD",
            "Terraform", "Ansible", "Linux", "Shell Scripting", "Monitoring"
        ));
        
        return careerSkillMap.getOrDefault(careerGoal.toLowerCase(), Arrays.asList(
            "Problem Solving", "Communication", "Teamwork", "Learning"
        ));
    }
    
    /**
     * Generate learning modules based on skill gaps and user preferences
     * @param learningPath The learning path
     * @param skillGaps List of skill gaps to address
     * @param experienceLevel User's experience level
     * @param learningPace User's learning pace
     * @return List of generated learning modules
     */
    private List<LearningModule> generateLearningModules(LearningPath learningPath, 
                                                        List<String> skillGaps,
                                                        LearningPathRequest.ExperienceLevel experienceLevel,
                                                        LearningPathRequest.LearningPace learningPace) {
        List<LearningModule> modules = new ArrayList<>();
        int orderIndex = 1;
        
        // Group skills by difficulty level based on experience
        Map<LearningModule.DifficultyLevel, List<String>> skillsByLevel = groupSkillsByDifficulty(skillGaps, experienceLevel);
        
        // Generate modules for each difficulty level
        for (LearningModule.DifficultyLevel level : LearningModule.DifficultyLevel.values()) {
            List<String> skillsForLevel = skillsByLevel.get(level);
            if (skillsForLevel != null && !skillsForLevel.isEmpty()) {
                for (String skill : skillsForLevel) {
                    LearningModule module = createModuleForSkill(skill, level, learningPace, orderIndex++);
                    modules.add(module);
                }
            }
        }
        
        return modules;
    }
    
    /**
     * Group skills by difficulty level based on user experience
     * @param skills List of skills
     * @param experienceLevel User's experience level
     * @return Map of skills grouped by difficulty level
     */
    private Map<LearningModule.DifficultyLevel, List<String>> groupSkillsByDifficulty(
            List<String> skills, LearningPathRequest.ExperienceLevel experienceLevel) {
        
        Map<LearningModule.DifficultyLevel, List<String>> skillsByLevel = new HashMap<>();
        
        // Define skill difficulty mapping (mock data)
        Map<String, LearningModule.DifficultyLevel> skillDifficultyMap = new HashMap<>();
        
        // Beginner skills
        skillDifficultyMap.put("HTML", LearningModule.DifficultyLevel.BEGINNER);
        skillDifficultyMap.put("CSS", LearningModule.DifficultyLevel.BEGINNER);
        skillDifficultyMap.put("JavaScript", LearningModule.DifficultyLevel.BEGINNER);
        skillDifficultyMap.put("Git", LearningModule.DifficultyLevel.BEGINNER);
        
        // Intermediate skills
        skillDifficultyMap.put("React", LearningModule.DifficultyLevel.INTERMEDIATE);
        skillDifficultyMap.put("Node.js", LearningModule.DifficultyLevel.INTERMEDIATE);
        skillDifficultyMap.put("Express.js", LearningModule.DifficultyLevel.INTERMEDIATE);
        skillDifficultyMap.put("MongoDB", LearningModule.DifficultyLevel.INTERMEDIATE);
        skillDifficultyMap.put("TypeScript", LearningModule.DifficultyLevel.INTERMEDIATE);
        
        // Advanced skills
        skillDifficultyMap.put("Docker", LearningModule.DifficultyLevel.ADVANCED);
        skillDifficultyMap.put("Kubernetes", LearningModule.DifficultyLevel.ADVANCED);
        skillDifficultyMap.put("AWS", LearningModule.DifficultyLevel.ADVANCED);
        skillDifficultyMap.put("Microservices", LearningModule.DifficultyLevel.ADVANCED);
        
        // Expert skills
        skillDifficultyMap.put("System Design", LearningModule.DifficultyLevel.EXPERT);
        skillDifficultyMap.put("Architecture Patterns", LearningModule.DifficultyLevel.EXPERT);
        
        // Group skills by difficulty level
        for (String skill : skills) {
            LearningModule.DifficultyLevel level = skillDifficultyMap.getOrDefault(skill, LearningModule.DifficultyLevel.BEGINNER);
            skillsByLevel.computeIfAbsent(level, k -> new ArrayList<>()).add(skill);
        }
        
        return skillsByLevel;
    }
    
    /**
     * Create a learning module for a specific skill
     * @param skill The skill to create a module for
     * @param difficultyLevel The difficulty level
     * @param learningPace The user's learning pace
     * @param orderIndex The order index
     * @return LearningModule for the skill
     */
    private LearningModule createModuleForSkill(String skill, 
                                               LearningModule.DifficultyLevel difficultyLevel,
                                               LearningPathRequest.LearningPace learningPace,
                                               int orderIndex) {
        
        String title = String.format("Learn %s", skill);
        String description = String.format("Master %s fundamentals and advanced concepts", skill);
        
        // Calculate estimated hours based on difficulty and learning pace
        int baseHours = getBaseHoursForDifficulty(difficultyLevel);
        int adjustedHours = adjustHoursForLearningPace(baseHours, learningPace);
        
        LearningModule module = new LearningModule(title, description, skill, difficultyLevel, adjustedHours);
        module.setOrderIndex(orderIndex);
        
        // Add learning resources
        List<LearningResource> resources = generateLearningResources(skill, difficultyLevel, module);
        module.setResources(resources);
        
        return module;
    }
    
    /**
     * Get base hours for a difficulty level
     * @param difficultyLevel The difficulty level
     * @return Base hours for the difficulty level
     */
    private int getBaseHoursForDifficulty(LearningModule.DifficultyLevel difficultyLevel) {
        switch (difficultyLevel) {
            case BEGINNER: return 10;
            case INTERMEDIATE: return 20;
            case ADVANCED: return 30;
            case EXPERT: return 40;
            default: return 15;
        }
    }
    
    /**
     * Adjust hours based on learning pace
     * @param baseHours Base hours for the difficulty level
     * @param learningPace User's learning pace
     * @return Adjusted hours
     */
    private int adjustHoursForLearningPace(int baseHours, LearningPathRequest.LearningPace learningPace) {
        switch (learningPace) {
            case SLOW: return (int) (baseHours * 1.5);
            case MODERATE: return baseHours;
            case FAST: return (int) (baseHours * 0.75);
            case INTENSIVE: return (int) (baseHours * 0.5);
            default: return baseHours;
        }
    }
    
    /**
     * Generate learning resources for a skill (mock implementation)
     * @param skill The skill
     * @param difficultyLevel The difficulty level
     * @param learningModule The learning module to associate resources with
     * @return List of learning resources
     */
    private List<LearningResource> generateLearningResources(String skill, LearningModule.DifficultyLevel difficultyLevel, LearningModule learningModule) {
        List<LearningResource> resources = new ArrayList<>();
        
        // Mock resources - in production, this would fetch from external APIs
        Map<String, List<Map<String, Object>>> mockResources = new HashMap<>();
        
        // JavaScript resources
        mockResources.put("JavaScript", Arrays.asList(
            Map.of("title", "JavaScript Tutorial for Beginners", "url", "https://www.youtube.com/watch?v=W6NZfCO5SIk", "platform", "YouTube", "type", "VIDEO"),
            Map.of("title", "JavaScript: The Complete Guide", "url", "https://www.udemy.com/course/javascript-the-complete-guide", "platform", "Udemy", "type", "COURSE"),
            Map.of("title", "MDN JavaScript Guide", "url", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "platform", "MDN", "type", "ARTICLE")
        ));
        
        // React resources
        mockResources.put("React", Arrays.asList(
            Map.of("title", "React Tutorial for Beginners", "url", "https://www.youtube.com/watch?v=Ke90Tje7VS0", "platform", "YouTube", "type", "VIDEO"),
            Map.of("title", "React - The Complete Guide", "url", "https://www.udemy.com/course/react-the-complete-guide-incl-redux", "platform", "Udemy", "type", "COURSE"),
            Map.of("title", "React Official Documentation", "url", "https://reactjs.org/docs/getting-started.html", "platform", "React", "type", "ARTICLE")
        ));
        
        // Node.js resources
        mockResources.put("Node.js", Arrays.asList(
            Map.of("title", "Node.js Tutorial for Beginners", "url", "https://www.youtube.com/watch?v=Oe421EPjeBE", "platform", "YouTube", "type", "VIDEO"),
            Map.of("title", "Node.js API Masterclass", "url", "https://www.udemy.com/course/nodejs-api-masterclass", "platform", "Udemy", "type", "COURSE"),
            Map.of("title", "Node.js Official Documentation", "url", "https://nodejs.org/en/docs", "platform", "Node.js", "type", "ARTICLE")
        ));
        
        // Get resources for the skill or use default
        List<Map<String, Object>> skillResources = mockResources.getOrDefault(skill, Arrays.asList(
            Map.of("title", "Learn " + skill, "url", "https://www.youtube.com/results?search_query=" + skill, "platform", "YouTube", "type", "VIDEO"),
            Map.of("title", skill + " Course", "url", "https://www.udemy.com/search/?q=" + skill, "platform", "Udemy", "type", "COURSE"),
            Map.of("title", skill + " Documentation", "url", "https://www.google.com/search?q=" + skill + "+documentation", "platform", "Google", "type", "ARTICLE")
        ));
        
        // Create LearningResource objects
        for (Map<String, Object> resourceData : skillResources) {
            LearningResource resource = new LearningResource(
                (String) resourceData.get("title"),
                "Learn " + skill + " with this comprehensive resource",
                (String) resourceData.get("url"),
                LearningResource.ResourceType.valueOf((String) resourceData.get("type")),
                (String) resourceData.get("platform")
            );
            resource.setDifficultyLevel(LearningResource.DifficultyLevel.valueOf(difficultyLevel.name()));
            resource.setDurationMinutes(60); // Mock duration
            resource.setRating(4.5); // Mock rating
            resource.setLearningModule(learningModule); // Set the relationship
            resources.add(resource);
        }
        
        return resources;
    }
    
    /**
     * Calculate estimated completion weeks based on modules and learning pace
     * @param modules List of learning modules
     * @param learningPace User's learning pace
     * @return Estimated completion weeks
     */
    private int calculateEstimatedWeeks(List<LearningModule> modules, LearningPathRequest.LearningPace learningPace) {
        int totalHours = modules.stream()
            .mapToInt(m -> m.getEstimatedHours() != null ? m.getEstimatedHours() : 0)
            .sum();
        
        // Assume 10 hours per week for moderate pace
        int hoursPerWeek = 10;
        switch (learningPace) {
            case SLOW: hoursPerWeek = 5; break;
            case MODERATE: hoursPerWeek = 10; break;
            case FAST: hoursPerWeek = 15; break;
            case INTENSIVE: hoursPerWeek = 25; break;
        }
        
        return Math.max(1, (int) Math.ceil((double) totalHours / hoursPerWeek));
    }
    
    /**
     * Update overall learning path progress
     * @param learningPath The learning path to update
     */
    private void updateLearningPathProgress(LearningPath learningPath) {
        List<LearningModule> modules = learningModuleRepository.findByLearningPathIdOrderByOrderIndex(learningPath.getId());
        
        if (modules.isEmpty()) {
            learningPath.setOverallProgress(0.0);
        } else {
            double totalProgress = modules.stream()
                .mapToDouble(m -> m.getProgressPercentage() != null ? m.getProgressPercentage() : 0.0)
                .sum();
            double averageProgress = totalProgress / modules.size();
            learningPath.setOverallProgress(averageProgress);
        }
        
        learningPathRepository.save(learningPath);
    }
    
    /**
     * Adapt the learning path based on user progress and feedback
     * @param learningPath The learning path to adapt
     */
    private void adaptLearningPath(LearningPath learningPath) {
        List<LearningModule> modules = learningModuleRepository.findByLearningPathIdOrderByOrderIndex(learningPath.getId());
        
        // Check if user is progressing well
        double averageRating = modules.stream()
            .filter(m -> m.getUserRating() != null)
            .mapToInt(LearningModule::getUserRating)
            .average()
            .orElse(0.0);
        
        // If user is struggling (low ratings), add more beginner modules
        if (averageRating < 3.0 && !modules.isEmpty()) {
            // Add remedial modules (implementation would depend on business logic)
            System.out.println("User is struggling, consider adding remedial modules");
        }
        
        // Update current stage based on progress
        updateCurrentStage(learningPath, modules);
    }
    
    /**
     * Update the current learning stage based on progress
     * @param learningPath The learning path
     * @param modules List of modules
     */
    private void updateCurrentStage(LearningPath learningPath, List<LearningModule> modules) {
        long completedModules = modules.stream()
            .filter(m -> m.getStatus() == LearningModule.ModuleStatus.COMPLETED)
            .count();
        
        long totalModules = modules.size();
        double completionRatio = totalModules > 0 ? (double) completedModules / totalModules : 0.0;
        
        if (completionRatio >= 0.75) {
            learningPath.setCurrentStage(LearningPath.LearningStage.EXPERT);
        } else if (completionRatio >= 0.5) {
            learningPath.setCurrentStage(LearningPath.LearningStage.ADVANCED);
        } else if (completionRatio >= 0.25) {
            learningPath.setCurrentStage(LearningPath.LearningStage.INTERMEDIATE);
        } else {
            learningPath.setCurrentStage(LearningPath.LearningStage.BEGINNER);
        }
        
        learningPathRepository.save(learningPath);
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