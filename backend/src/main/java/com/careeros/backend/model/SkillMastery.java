package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill_mastery")
public class SkillMastery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "skill_name", nullable = false)
    private String skillName;
    
    @Column(name = "mastery_level")
    private Double masteryLevel = 0.0;
    
    @Column(name = "experience_hours")
    private Double experienceHours = 0.0;
    
    @Column(name = "last_assessment_date")
    private LocalDateTime lastAssessmentDate;
    
    @Column(name = "assessment_score")
    private Double assessmentScore;
    
    @Column(name = "market_demand_level")
    private Double marketDemandLevel;
    
    @Column(name = "trending_up")
    private Boolean trendingUp = false;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public SkillMastery() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public SkillMastery(User user, String skillName) {
        this();
        this.user = user;
        this.skillName = skillName;
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
    
    public String getSkillName() {
        return skillName;
    }
    
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
    
    public Double getMasteryLevel() {
        return masteryLevel;
    }
    
    public void setMasteryLevel(Double masteryLevel) {
        this.masteryLevel = masteryLevel;
    }
    
    public Double getExperienceHours() {
        return experienceHours;
    }
    
    public void setExperienceHours(Double experienceHours) {
        this.experienceHours = experienceHours;
    }
    
    public LocalDateTime getLastAssessmentDate() {
        return lastAssessmentDate;
    }
    
    public void setLastAssessmentDate(LocalDateTime lastAssessmentDate) {
        this.lastAssessmentDate = lastAssessmentDate;
    }
    
    public Double getAssessmentScore() {
        return assessmentScore;
    }
    
    public void setAssessmentScore(Double assessmentScore) {
        this.assessmentScore = assessmentScore;
    }
    
    public Double getMarketDemandLevel() {
        return marketDemandLevel;
    }
    
    public void setMarketDemandLevel(Double marketDemandLevel) {
        this.marketDemandLevel = marketDemandLevel;
    }
    
    public Boolean getTrendingUp() {
        return trendingUp;
    }
    
    public void setTrendingUp(Boolean trendingUp) {
        this.trendingUp = trendingUp;
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
    
    // JPA Lifecycle methods
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
