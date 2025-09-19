package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_learning_modules")
public class JobLearningModule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_learning_path_id", nullable = false)
    private JobLearningPath jobLearningPath;
    
    @Column(name = "module_name", nullable = false)
    private String moduleName;
    
    @Column(name = "module_description", columnDefinition = "TEXT")
    private String moduleDescription;
    
    @Column(name = "order_index")
    private Integer orderIndex;
    
    @Column(name = "estimated_hours")
    private Integer estimatedHours;
    
    @Column(name = "difficulty_level")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "skills_covered", columnDefinition = "TEXT")
    private String skillsCovered;
    
    @Column(name = "prerequisites", columnDefinition = "TEXT")
    private String prerequisites;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum DifficultyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
    
    // Constructors
    public JobLearningModule() {
        this.createdAt = LocalDateTime.now();
    }
    
    public JobLearningModule(String moduleName, String moduleDescription, Integer orderIndex) {
        this();
        this.moduleName = moduleName;
        this.moduleDescription = moduleDescription;
        this.orderIndex = orderIndex;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public JobLearningPath getJobLearningPath() {
        return jobLearningPath;
    }
    
    public void setJobLearningPath(JobLearningPath jobLearningPath) {
        this.jobLearningPath = jobLearningPath;
    }
    
    public String getModuleName() {
        return moduleName;
    }
    
    public void setModuleName(String moduleName) {
        this.moduleName = moduleName;
    }
    
    public String getModuleDescription() {
        return moduleDescription;
    }
    
    public void setModuleDescription(String moduleDescription) {
        this.moduleDescription = moduleDescription;
    }
    
    public Integer getOrderIndex() {
        return orderIndex;
    }
    
    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
    
    public Integer getEstimatedHours() {
        return estimatedHours;
    }
    
    public void setEstimatedHours(Integer estimatedHours) {
        this.estimatedHours = estimatedHours;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public String getSkillsCovered() {
        return skillsCovered;
    }
    
    public void setSkillsCovered(String skillsCovered) {
        this.skillsCovered = skillsCovered;
    }
    
    public String getPrerequisites() {
        return prerequisites;
    }
    
    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}