package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "learning_resources")
public class LearningResource {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_module_id", nullable = false)
    private LearningModule learningModule;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "url", nullable = false)
    private String url;
    
    @Column(name = "resource_type", columnDefinition = "VARCHAR(20) CHECK (resource_type IN ('VIDEO', 'COURSE', 'ARTICLE', 'BOOK', 'EXERCISE', 'PROJECT', 'QUIZ', 'PODCAST'))")
    @Enumerated(EnumType.STRING)
    private ResourceType resourceType;
    
    @Column(name = "platform")
    private String platform;
    
    @Column(name = "duration_minutes")
    private Integer durationMinutes;
    
    @Column(name = "difficulty_level", columnDefinition = "VARCHAR(20) CHECK (difficulty_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'))")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "rating")
    private Double rating;
    
    @Column(name = "is_free")
    private Boolean isFree = true;
    
    @Column(name = "language")
    private String language = "English";
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum ResourceType {
        VIDEO, COURSE, ARTICLE, BOOK, EXERCISE, PROJECT, QUIZ, PODCAST
    }
    
    public enum DifficultyLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
    
    // Constructors
    public LearningResource() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public LearningResource(String title, String description, String url, 
                           ResourceType resourceType, String platform) {
        this();
        this.title = title;
        this.description = description;
        this.url = url;
        this.resourceType = resourceType;
        this.platform = platform;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LearningModule getLearningModule() {
        return learningModule;
    }
    
    public void setLearningModule(LearningModule learningModule) {
        this.learningModule = learningModule;
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
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public ResourceType getResourceType() {
        return resourceType;
    }
    
    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }
    
    public String getPlatform() {
        return platform;
    }
    
    public void setPlatform(String platform) {
        this.platform = platform;
    }
    
    public Integer getDurationMinutes() {
        return durationMinutes;
    }
    
    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Double getRating() {
        return rating;
    }
    
    public void setRating(Double rating) {
        this.rating = rating;
    }
    
    public Boolean getIsFree() {
        return isFree;
    }
    
    public void setIsFree(Boolean isFree) {
        this.isFree = isFree;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
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