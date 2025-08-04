package com.careeros.backend.payload.request;

import jakarta.validation.constraints.*;
import com.careeros.backend.model.LearningModule;

public class ModuleProgressRequest {
    
    @NotNull(message = "Module ID is required")
    private Long moduleId;
    
    @NotNull(message = "Progress percentage is required")
    @Min(value = 0, message = "Progress percentage must be at least 0")
    @Max(value = 100, message = "Progress percentage must be at most 100")
    private Double progressPercentage;
    
    @NotNull(message = "Module status is required")
    private LearningModule.ModuleStatus status;
    
    @Min(value = 1, message = "User rating must be at least 1")
    @Max(value = 5, message = "User rating must be at most 5")
    private Integer userRating;
    
    @Size(max = 1000, message = "User feedback must not exceed 1000 characters")
    private String userFeedback;
    
    // Constructors
    public ModuleProgressRequest() {}
    
    public ModuleProgressRequest(Long moduleId, Double progressPercentage, LearningModule.ModuleStatus status) {
        this.moduleId = moduleId;
        this.progressPercentage = progressPercentage;
        this.status = status;
    }
    
    // Getters and Setters
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public LearningModule.ModuleStatus getStatus() {
        return status;
    }
    
    public void setStatus(LearningModule.ModuleStatus status) {
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
} 