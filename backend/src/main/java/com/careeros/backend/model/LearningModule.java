package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "learning_modules")
public class LearningModule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_path_id", nullable = false)
    private LearningPath learningPath;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "skill_focus")
    private String skillFocus;
    
    @Column(name = "difficulty_level", columnDefinition = "VARCHAR(20) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "estimated_hours")
    private Integer estimatedHours;
    
    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;
    
    @Column(name = "status", columnDefinition = "VARCHAR(20) CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED'))")
    @Enumerated(EnumType.STRING)
    private ModuleStatus status = ModuleStatus.NOT_STARTED;
    
    @Column(name = "user_rating")
    private Integer userRating;
    
    @Column(name = "user_feedback", columnDefinition = "TEXT")
    private String userFeedback;
    
    @Column(name = "order_index")
    private Integer orderIndex;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // New fields for enhanced system
    @Column(name = "skill_mastery_level")
    private Double skillMasteryLevel = 0.0;
    
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;
    
    @Column(name = "market_relevance_score")
    private Double marketRelevanceScore;
    
    @Column(name = "time_spent_hours")
    private Double timeSpentHours = 0.0;
    
    @Column(name = "last_practice_date")
    private LocalDateTime lastPracticeDate;
    
    @Column(name = "practice_frequency_days")
    private Integer practiceFrequencyDays = 3;
    
    @Column(name = "next_practice_date")
    private LocalDateTime nextPracticeDate;
    
    @Column(name = "ai_recommended")
    private Boolean aiRecommended = false;
    
    @Column(name = "adaptation_priority")
    private Integer adaptationPriority = 1;
    
    @OneToMany(mappedBy = "learningModule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LearningResource> resources;
    
    // Enums
    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
    
    public enum ModuleStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, SKIPPED
    }
    
    // Constructors
    public LearningModule() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.nextPracticeDate = LocalDateTime.now().plusDays(this.practiceFrequencyDays);
    }
    
    public LearningModule(String title, String description, String skillFocus, 
                         DifficultyLevel difficultyLevel, Integer estimatedHours) {
        this();
        this.title = title;
        this.description = description;
        this.skillFocus = skillFocus;
        this.difficultyLevel = difficultyLevel;
        this.estimatedHours = estimatedHours;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LearningPath getLearningPath() {
        return learningPath;
    }
    
    public void setLearningPath(LearningPath learningPath) {
        this.learningPath = learningPath;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSkillFocus() {
        return skillFocus;
    }
    
    public void setSkillFocus(String skillFocus) {
        this.skillFocus = skillFocus;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Integer getEstimatedHours() {
        return estimatedHours;
    }
    
    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public ModuleStatus getStatus() {
        return status;
    }
    
    public void setStatus(ModuleStatus status) {
        this.status = status;
    }
    
    public Integer getUserRating() {
        return userRating;
    }
    
    public void setUserRating(Integer userRating) {
        this.userRating = userRating;
    }
    
    public String getUserFeedback() {
        return userFeedback;
    }
    
    public void setUserFeedback(String userFeedback) {
        this.userFeedback = userFeedback;
    }
    
    public Integer getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<LearningResource> getResources() {
        return resources;
    }
    
    public void setResources(List<LearningResource> resources) {
        this.resources = resources;
    }
    
    // New getters and setters
    public Double getSkillMasteryLevel() {
        return skillMasteryLevel;
    }
    
    public void setSkillMasteryLevel(Double skillMasteryLevel) {
        this.skillMasteryLevel = skillMasteryLevel;
    }
    
    public String getPrerequisites() {
        return prerequisites;
    }
    
    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }
    
    public Double getMarketRelevanceScore() {
        return marketRelevanceScore;
    }
    
    public void setMarketRelevanceScore(Double marketRelevanceScore) {
        this.marketRelevanceScore = marketRelevanceScore;
    }
    
    public Double getTimeSpentHours() {
        return timeSpentHours;
    }
    
    public void setTimeSpentHours(Double timeSpentHours) {
        this.timeSpentHours = timeSpentHours;
    }
    
    public LocalDateTime getLastPracticeDate() {
        return lastPracticeDate;
    }
    
    public void setLastPracticeDate(LocalDateTime lastPracticeDate) {
        this.lastPracticeDate = lastPracticeDate;
    }
    
    public Integer getPracticeFrequencyDays() {
        return practiceFrequencyDays;
    }
    
    public void setPracticeFrequencyDays(Integer practiceFrequencyDays) {
        this.practiceFrequencyDays = practiceFrequencyDays;
    }
    
    public LocalDateTime getNextPracticeDate() {
        return nextPracticeDate;
    }
    
    public void setNextPracticeDate(LocalDateTime nextPracticeDate) {
        this.nextPracticeDate = nextPracticeDate;
    }
    
    public Boolean getAiRecommended() {
        return aiRecommended;
    }
    
    public void setAiRecommended(Boolean aiRecommended) {
        this.aiRecommended = aiRecommended;
    }
    
    public Integer getAdaptationPriority() {
        return adaptationPriority;
    }
    
    public void setAdaptationPriority(Integer adaptationPriority) {
        this.adaptationPriority = adaptationPriority;
    }
    
    // JPA Lifecycle methods
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 