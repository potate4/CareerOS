package com.careeros.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "futurecast_roadmaps")
public class FuturecastRoadmap {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;
    
    @Column(name = "career_goal", nullable = false)
    private String careerGoal;
    
    @Column(name = "timeline_years", nullable = false)
    private Integer timelineYears;
    
    @Column(name = "explanation", length = 2000)
    private String explanation;
    
    @Column(name = "confidence")
    private Double confidence;
    
    @Column(name = "recommended_path_id")
    private String recommendedPathId;
    
    // Store preferences as JSON
    @Type(JsonType.class)
    @Column(name = "preferences", columnDefinition = "jsonb")
    private Map<String, Object> preferences;
    
    // Store user profile snapshot as JSON
    @Type(JsonType.class)
    @Column(name = "user_profile_snapshot", columnDefinition = "jsonb")
    private Map<String, Object> userProfileSnapshot;
    
    // Store market data as JSON (from AI analysis)
    @Type(JsonType.class)
    @Column(name = "market_data", columnDefinition = "jsonb")
    private Map<String, Object> marketData;
    
    // Store market insights as JSON
    @Type(JsonType.class)
    @Column(name = "market_insights", columnDefinition = "jsonb")
    private Map<String, Object> marketInsights;
    
    // Relationships
    @OneToMany(mappedBy = "roadmap", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    private List<CareerPath> paths;
    
    // Status and metadata
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private RoadmapStatus status = RoadmapStatus.ACTIVE;
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    @Column(name = "version")
    private Integer version = 1;
    
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for roadmap status
    public enum RoadmapStatus {
        ACTIVE, ARCHIVED, DRAFT, SHARED
    }
    
    // Constructors
    public FuturecastRoadmap() {}
    
    public FuturecastRoadmap(User user, String careerGoal, Integer timelineYears) {
        this.user = user;
        this.careerGoal = careerGoal;
        this.timelineYears = timelineYears;
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
    
    public Integer getTimelineYears() {
        return timelineYears;
    }
    
    public void setTimelineYears(Integer timelineYears) {
        this.timelineYears = timelineYears;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public String getRecommendedPathId() {
        return recommendedPathId;
    }
    
    public void setRecommendedPathId(String recommendedPathId) {
        this.recommendedPathId = recommendedPathId;
    }
    
    public Map<String, Object> getPreferences() {
        return preferences;
    }
    
    public void setPreferences(Map<String, Object> preferences) {
        this.preferences = preferences;
    }
    
    public Map<String, Object> getUserProfileSnapshot() {
        return userProfileSnapshot;
    }
    
    public void setUserProfileSnapshot(Map<String, Object> userProfileSnapshot) {
        this.userProfileSnapshot = userProfileSnapshot;
    }
    
    public Map<String, Object> getMarketData() {
        return marketData;
    }
    
    public void setMarketData(Map<String, Object> marketData) {
        this.marketData = marketData;
    }
    
    public Map<String, Object> getMarketInsights() {
        return marketInsights;
    }
    
    public void setMarketInsights(Map<String, Object> marketInsights) {
        this.marketInsights = marketInsights;
    }
    
    public List<CareerPath> getPaths() {
        return paths;
    }
    
    public void setPaths(List<CareerPath> paths) {
        this.paths = paths;
    }
    
    public RoadmapStatus getStatus() {
        return status;
    }
    
    public void setStatus(RoadmapStatus status) {
        this.status = status;
    }
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }
    
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
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
} 