package com.careeros.backend.payload.response;

import com.careeros.backend.model.LearningPath;
import com.careeros.backend.model.LearningModule;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class LearningPathResponse {
    
    private Long id;
    private String careerGoal;
    private LearningPath.LearningStage currentStage;
    private Double overallProgress;
    private Integer estimatedCompletionWeeks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LearningModuleResponse> modules;
    private PathStatistics statistics;
    
    // New AI-related fields
    private Boolean aiGenerated;
    private LocalDateTime lastAiUpdate;
    private Double marketDemandScore;
    private String currentMarketTrends;
    private Double interviewPerformanceScore;
    
    // Nested classes
    public static class LearningModuleResponse {
        private Long id;
        private String title;
        private String description;
        private String skillFocus;
        private LearningModule.DifficultyLevel difficultyLevel;
        private Integer estimatedHours;
        private Double progressPercentage;
        private LearningModule.ModuleStatus status;
        private Integer userRating;
        private String userFeedback;
        private Integer orderIndex;
        private List<LearningResourceResponse> resources;
        
        // New AI-related fields
        private Double skillMasteryLevel;
        private String prerequisites;
        private Double marketRelevanceScore;
        private Double timeSpentHours;
        private LocalDateTime lastPracticeDate;
        private LocalDateTime nextPracticeDate;
        private Boolean aiRecommended;
        private Integer adaptationPriority;
        
        // Constructors
        public LearningModuleResponse() {}
        
        public LearningModuleResponse(LearningModule module) {
            this.id = module.getId();
            this.title = module.getTitle();
            this.description = module.getDescription();
            this.skillFocus = module.getSkillFocus();
            this.difficultyLevel = module.getDifficultyLevel();
            this.estimatedHours = module.getEstimatedHours();
            this.progressPercentage = module.getProgressPercentage();
            this.status = module.getStatus();
            this.userRating = module.getUserRating();
            this.userFeedback = module.getUserFeedback();
            this.orderIndex = module.getOrderIndex();
            
            // New AI-related fields
            this.skillMasteryLevel = module.getSkillMasteryLevel();
            this.prerequisites = module.getPrerequisites();
            this.marketRelevanceScore = module.getMarketRelevanceScore();
            this.timeSpentHours = module.getTimeSpentHours();
            this.lastPracticeDate = module.getLastPracticeDate();
            this.nextPracticeDate = module.getNextPracticeDate();
            this.aiRecommended = module.getAiRecommended();
            this.adaptationPriority = module.getAdaptationPriority();
            
            if (module.getResources() != null) {
                this.resources = module.getResources().stream()
                    .map(LearningResourceResponse::new)
                    .collect(Collectors.toList());
            }
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getSkillFocus() { return skillFocus; }
        public void setSkillFocus(String skillFocus) { this.skillFocus = skillFocus; }
        
        public LearningModule.DifficultyLevel getDifficultyLevel() { return difficultyLevel; }
        public void setDifficultyLevel(LearningModule.DifficultyLevel difficultyLevel) { this.difficultyLevel = difficultyLevel; }
        
        public Integer getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
        
        public Double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(Double progressPercentage) { this.progressPercentage = progressPercentage; }
        
        public LearningModule.ModuleStatus getStatus() { return status; }
        public void setStatus(LearningModule.ModuleStatus status) { this.status = status; }
        
        public Integer getUserRating() { return userRating; }
        public void setUserRating(Integer userRating) { this.userRating = userRating; }
        
        public String getUserFeedback() { return userFeedback; }
        public void setUserFeedback(String userFeedback) { this.userFeedback = userFeedback; }
        
        public Integer getOrderIndex() { return orderIndex; }
        public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
        
        public List<LearningResourceResponse> getResources() { return resources; }
        public void setResources(List<LearningResourceResponse> resources) { this.resources = resources; }
        
        // New AI-related getters and setters
        public Double getSkillMasteryLevel() { return skillMasteryLevel; }
        public void setSkillMasteryLevel(Double skillMasteryLevel) { this.skillMasteryLevel = skillMasteryLevel; }
        
        public String getPrerequisites() { return prerequisites; }
        public void setPrerequisites(String prerequisites) { this.prerequisites = prerequisites; }
        
        public Double getMarketRelevanceScore() { return marketRelevanceScore; }
        public void setMarketRelevanceScore(Double marketRelevanceScore) { this.marketRelevanceScore = marketRelevanceScore; }
        
        public Double getTimeSpentHours() { return timeSpentHours; }
        public void setTimeSpentHours(Double timeSpentHours) { this.timeSpentHours = timeSpentHours; }
        
        public LocalDateTime getLastPracticeDate() { return lastPracticeDate; }
        public void setLastPracticeDate(LocalDateTime lastPracticeDate) { this.lastPracticeDate = lastPracticeDate; }
        
        public LocalDateTime getNextPracticeDate() { return nextPracticeDate; }
        public void setNextPracticeDate(LocalDateTime nextPracticeDate) { this.nextPracticeDate = nextPracticeDate; }
        
        public Boolean getAiRecommended() { return aiRecommended; }
        public void setAiRecommended(Boolean aiRecommended) { this.aiRecommended = aiRecommended; }
        
        public Integer getAdaptationPriority() { return adaptationPriority; }
        public void setAdaptationPriority(Integer adaptationPriority) { this.adaptationPriority = adaptationPriority; }
    }
    
    public static class LearningResourceResponse {
        private Long id;
        private String title;
        private String description;
        private String url;
        private String platform;
        private Integer durationMinutes;
        private Double rating;
        private Boolean isFree;
        private String language;
        
        // Constructors
        public LearningResourceResponse() {}
        
        public LearningResourceResponse(com.careeros.backend.model.LearningResource resource) {
            this.id = resource.getId();
            this.title = resource.getTitle();
            this.description = resource.getDescription();
            this.url = resource.getUrl();
            this.platform = resource.getPlatform();
            this.durationMinutes = resource.getDurationMinutes();
            this.rating = resource.getRating();
            this.isFree = resource.getIsFree();
            this.language = resource.getLanguage();
        }
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        
        public String getPlatform() { return platform; }
        public void setPlatform(String platform) { this.platform = platform; }
        
        public Integer getDurationMinutes() { return durationMinutes; }
        public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
        
        public Double getRating() { return rating; }
        public void setRating(Double rating) { this.rating = rating; }
        
        public Boolean getIsFree() { return isFree; }
        public void setIsFree(Boolean isFree) { this.isFree = isFree; }
        
        public String getLanguage() { return language; }
        public void setLanguage(String language) { this.language = language; }
    }
    
    public static class PathStatistics {
        private Integer totalModules;
        private Integer completedModules;
        private Integer inProgressModules;
        private Integer notStartedModules;
        private Double averageRating;
        private Integer totalEstimatedHours;
        private Integer completedHours;
        
        // Constructors
        public PathStatistics() {}
        
        public PathStatistics(List<LearningModule> modules) {
            this.totalModules = modules.size();
            this.completedModules = (int) modules.stream()
                .filter(m -> m.getStatus() == LearningModule.ModuleStatus.COMPLETED)
                .count();
            this.inProgressModules = (int) modules.stream()
                .filter(m -> m.getStatus() == LearningModule.ModuleStatus.IN_PROGRESS)
                .count();
            this.notStartedModules = (int) modules.stream()
                .filter(m -> m.getStatus() == LearningModule.ModuleStatus.NOT_STARTED)
                .count();
            
            this.averageRating = modules.stream()
                .filter(m -> m.getUserRating() != null)
                .mapToInt(LearningModule::getUserRating)
                .average()
                .orElse(0.0);
            
            this.totalEstimatedHours = modules.stream()
                .mapToInt(m -> m.getEstimatedHours() != null ? m.getEstimatedHours() : 0)
                .sum();
            
            this.completedHours = modules.stream()
                .filter(m -> m.getStatus() == LearningModule.ModuleStatus.COMPLETED)
                .mapToInt(m -> m.getEstimatedHours() != null ? m.getEstimatedHours() : 0)
                .sum();
        }
        
        // Getters and Setters
        public Integer getTotalModules() { return totalModules; }
        public void setTotalModules(Integer totalModules) { this.totalModules = totalModules; }
        
        public Integer getCompletedModules() { return completedModules; }
        public void setCompletedModules(Integer completedModules) { this.completedModules = completedModules; }
        
        public Integer getInProgressModules() { return inProgressModules; }
        public void setInProgressModules(Integer inProgressModules) { this.inProgressModules = inProgressModules; }
        
        public Integer getNotStartedModules() { return notStartedModules; }
        public void setNotStartedModules(Integer notStartedModules) { this.notStartedModules = notStartedModules; }
        
        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
        
        public Integer getTotalEstimatedHours() { return totalEstimatedHours; }
        public void setTotalEstimatedHours(Integer totalEstimatedHours) { this.totalEstimatedHours = totalEstimatedHours; }
        
        public Integer getCompletedHours() { return completedHours; }
        public void setCompletedHours(Integer completedHours) { this.completedHours = completedHours; }
    }
    
    // Constructors
    public LearningPathResponse() {}
    
    public LearningPathResponse(LearningPath learningPath) {
        this.id = learningPath.getId();
        this.careerGoal = learningPath.getCareerGoal();
        this.currentStage = learningPath.getCurrentStage();
        this.overallProgress = learningPath.getOverallProgress();
        this.estimatedCompletionWeeks = learningPath.getEstimatedCompletionWeeks();
        this.isActive = learningPath.getIsActive();
        this.createdAt = learningPath.getCreatedAt();
        this.updatedAt = learningPath.getUpdatedAt();
        
        // New AI-related fields
        this.aiGenerated = learningPath.getAiGenerated();
        this.lastAiUpdate = learningPath.getLastAiUpdate();
        this.marketDemandScore = learningPath.getMarketDemandScore();
        this.currentMarketTrends = learningPath.getCurrentMarketTrends();
        this.interviewPerformanceScore = learningPath.getInterviewPerformanceScore();
        
        if (learningPath.getModules() != null) {
            this.modules = learningPath.getModules().stream()
                .map(LearningModuleResponse::new)
                .collect(Collectors.toList());
            this.statistics = new PathStatistics(learningPath.getModules());
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCareerGoal() { return careerGoal; }
    public void setCareerGoal(String careerGoal) { this.careerGoal = careerGoal; }
    
    public LearningPath.LearningStage getCurrentStage() { return currentStage; }
    public void setCurrentStage(LearningPath.LearningStage currentStage) { this.currentStage = currentStage; }
    
    public Double getOverallProgress() { return overallProgress; }
    public void setOverallProgress(Double overallProgress) { this.overallProgress = overallProgress; }
    
    public Integer getEstimatedCompletionWeeks() { return estimatedCompletionWeeks; }
    public void setEstimatedCompletionWeeks(Integer estimatedCompletionWeeks) { this.estimatedCompletionWeeks = estimatedCompletionWeeks; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public List<LearningModuleResponse> getModules() { return modules; }
    public void setModules(List<LearningModuleResponse> modules) { this.modules = modules; }
    
    public PathStatistics getStatistics() { return statistics; }
    public void setStatistics(PathStatistics statistics) { this.statistics = statistics; }
    
    // New AI-related getters and setters
    public Boolean getAiGenerated() { return aiGenerated; }
    public void setAiGenerated(Boolean aiGenerated) { this.aiGenerated = aiGenerated; }
    
    public LocalDateTime getLastAiUpdate() { return lastAiUpdate; }
    public void setLastAiUpdate(LocalDateTime lastAiUpdate) { this.lastAiUpdate = lastAiUpdate; }
    
    public Double getMarketDemandScore() { return marketDemandScore; }
    public void setMarketDemandScore(Double marketDemandScore) { this.marketDemandScore = marketDemandScore; }
    
    public String getCurrentMarketTrends() { return currentMarketTrends; }
    public void setCurrentMarketTrends(String currentMarketTrends) { this.currentMarketTrends = currentMarketTrends; }
    
    public Double getInterviewPerformanceScore() { return interviewPerformanceScore; }
    public void setInterviewPerformanceScore(Double interviewPerformanceScore) { this.interviewPerformanceScore = interviewPerformanceScore; }
} 