package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "learning_paths")
public class LearningPath {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "career_goal", nullable = false)
    private String careerGoal;
    
    @Column(name = "current_stage", columnDefinition = "VARCHAR(20) CHECK (current_stage IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))")
    @Enumerated(EnumType.STRING)
    private LearningStage currentStage;
    
    @Column(name = "overall_progress")
    private Double overallProgress = 0.0;
    
    @Column(name = "estimated_completion_weeks")
    private Integer estimatedCompletionWeeks;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // New fields for enhanced system
    @Column(name = "ai_generated", columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean aiGenerated = false;
    
    @Column(name = "last_ai_update")
    private LocalDateTime lastAiUpdate;
    
    @Column(name = "market_demand_score")
    private Double marketDemandScore;
    
    @Column(name = "skill_mastery_threshold")
    private Double skillMasteryThreshold = 0.8;
    
    @Column(name = "adaptation_frequency_days")
    private Integer adaptationFrequencyDays = 7;
    
    @Column(name = "next_adaptation_date")
    private LocalDateTime nextAdaptationDate;
    
    @Column(name = "interview_performance_score")
    private Double interviewPerformanceScore;
    
    @Column(name = "current_market_trends", columnDefinition = "TEXT")
    private String currentMarketTrends;
    
    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LearningModule> modules;
    
    // Enums
    public enum LearningStage {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
    
    // Constructors
    public LearningPath() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.nextAdaptationDate = LocalDateTime.now().plusDays(this.adaptationFrequencyDays);
    }
    
    public LearningPath(User user, String careerGoal) {
        this();
        this.user = user;
        this.careerGoal = careerGoal;
        this.currentStage = LearningStage.BEGINNER;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public LearningStage getCurrentStage() {
        return currentStage;
    }
    
    public void setCurrentStage(LearningStage currentStage) {
        this.currentStage = currentStage;
    }
    
    public Double getOverallProgress() {
        return overallProgress;
    }
    
    public void setOverallProgress(Double overallProgress) {
        this.overallProgress = overallProgress;
    }
    
    public Integer getEstimatedCompletionWeeks() {
        return estimatedCompletionWeeks;
    }
    
    public void setEstimatedCompletionWeeks(Integer estimatedCompletionWeeks) {
        this.estimatedCompletionWeeks = estimatedCompletionWeeks;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
    
    public List<LearningModule> getModules() {
        return modules;
    }
    
    public void setModules(List<LearningModule> modules) {
        this.modules = modules;
    }
    
    // New getters and setters
    public Boolean getAiGenerated() {
        return aiGenerated;
    }
    
    public void setAiGenerated(Boolean aiGenerated) {
        this.aiGenerated = aiGenerated;
    }
    
    public LocalDateTime getLastAiUpdate() {
        return lastAiUpdate;
    }
    
    public void setLastAiUpdate(LocalDateTime lastAiUpdate) {
        this.lastAiUpdate = lastAiUpdate;
    }
    
    public Double getMarketDemandScore() {
        return marketDemandScore;
    }
    
    public void setMarketDemandScore(Double marketDemandScore) {
        this.marketDemandScore = marketDemandScore;
    }
    
    public Double getSkillMasteryThreshold() {
        return skillMasteryThreshold;
    }
    
    public void setSkillMasteryThreshold(Double skillMasteryThreshold) {
        this.skillMasteryThreshold = skillMasteryThreshold;
    }
    
    public Integer getAdaptationFrequencyDays() {
        return adaptationFrequencyDays;
    }
    
    public void setAdaptationFrequencyDays(Integer adaptationFrequencyDays) {
        this.adaptationFrequencyDays = adaptationFrequencyDays;
    }
    
    public LocalDateTime getNextAdaptationDate() {
        return nextAdaptationDate;
    }
    
    public void setNextAdaptationDate(LocalDateTime nextAdaptationDate) {
        this.nextAdaptationDate = nextAdaptationDate;
    }
    
    public Double getInterviewPerformanceScore() {
        return interviewPerformanceScore;
    }
    
    public void setInterviewPerformanceScore(Double interviewPerformanceScore) {
        this.interviewPerformanceScore = interviewPerformanceScore;
    }
    
    public String getCurrentMarketTrends() {
        return currentMarketTrends;
    }
    
    public void setCurrentMarketTrends(String currentMarketTrends) {
        this.currentMarketTrends = currentMarketTrends;
    }
    
    // JPA Lifecycle methods
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 