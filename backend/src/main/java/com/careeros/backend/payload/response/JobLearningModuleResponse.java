package com.careeros.backend.payload.response;

import com.careeros.backend.model.JobLearningModule;
import java.time.LocalDateTime;

public class JobLearningModuleResponse {
    
    private Long id;
    private String moduleName;
    private String moduleDescription;
    private Integer orderIndex;
    private Integer estimatedHours;
    private JobLearningModule.DifficultyLevel difficultyLevel;
    private String skillsCovered;
    private String prerequisites;
    private LocalDateTime createdAt;
    
    // Constructors
    public JobLearningModuleResponse() {}
    
    public JobLearningModuleResponse(JobLearningModule module) {
        this.id = module.getId();
        this.moduleName = module.getModuleName();
        this.moduleDescription = module.getModuleDescription();
        this.orderIndex = module.getOrderIndex();
        this.estimatedHours = module.getEstimatedHours();
        this.difficultyLevel = module.getDifficultyLevel();
        this.skillsCovered = module.getSkillsCovered();
        this.prerequisites = module.getPrerequisites();
        this.createdAt = module.getCreatedAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public JobLearningModule.DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(JobLearningModule.DifficultyLevel difficultyLevel) {
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