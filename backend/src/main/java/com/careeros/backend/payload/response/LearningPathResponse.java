package com.careeros.backend.payload.response;

import com.careeros.backend.model.LearningPath;
import com.careeros.backend.model.LearningModule;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class LearningPathResponse {
    
    private Long id;
    private String careerGoal;
    private String experienceLevel;
    private String learningPace;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<LearningModuleResponse> modules;
    
    // Constructors
    public LearningPathResponse() {}
    
    public LearningPathResponse(LearningPath learningPath) {
        this.id = learningPath.getId();
        this.careerGoal = learningPath.getCareerGoal();
        this.experienceLevel = learningPath.getExperienceLevel();
        this.learningPace = learningPath.getLearningPace();
        this.isActive = learningPath.getIsActive();
        this.createdAt = learningPath.getCreatedAt();
        
        // Convert modules if they exist
        if (learningPath.getModules() != null) {
            this.modules = learningPath.getModules().stream()
                .map(LearningModuleResponse::new)
                .collect(Collectors.toList());
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public String getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getLearningPace() {
        return learningPace;
    }
    
    public void setLearningPace(String learningPace) {
        this.learningPace = learningPace;
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
    
    public List<LearningModuleResponse> getModules() {
        return modules;
    }
    
    public void setModules(List<LearningModuleResponse> modules) {
        this.modules = modules;
    }
    
    // Inner class for Learning Module Response
    public static class LearningModuleResponse {
        private Long id;
        private String title;
        private String description;
        private Integer orderIndex;
        private LocalDateTime createdAt;
        
        // Constructors
        public LearningModuleResponse() {}
        
        public LearningModuleResponse(LearningModule module) {
            this.id = module.getId();
            this.title = module.getTitle();
            this.description = module.getDescription();
            this.orderIndex = module.getOrderIndex();
            this.createdAt = module.getCreatedAt();
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
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
    }
} 