package com.careeros.backend.payload.response;

import com.careeros.backend.model.JobLearningPath;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class JobLearningPathResponse {
    
    private Long id;
    private Long jobPostingId;
    private Boolean generatedByAi;
    private String careerGoal;
    private String experienceLevel;
    private String learningPace;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<JobLearningModuleResponse> modules;
    
    // Constructors
    public JobLearningPathResponse() {}
    
    public JobLearningPathResponse(JobLearningPath jobLearningPath) {
        this.id = jobLearningPath.getId();
        this.jobPostingId = jobLearningPath.getJobPosting().getId();
        this.generatedByAi = jobLearningPath.getGeneratedByAi();
        this.careerGoal = jobLearningPath.getCareerGoal();
        this.experienceLevel = jobLearningPath.getExperienceLevel();
        this.learningPace = jobLearningPath.getLearningPace();
        this.isActive = jobLearningPath.getIsActive();
        this.createdAt = jobLearningPath.getCreatedAt();
        
        if (jobLearningPath.getModules() != null) {
            this.modules = jobLearningPath.getModules().stream()
                    .map(JobLearningModuleResponse::new)
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
    
    public Long getJobPostingId() {
        return jobPostingId;
    }
    
    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public Boolean getGeneratedByAi() {
        return generatedByAi;
    }
    
    public void setGeneratedByAi(Boolean generatedByAi) {
        this.generatedByAi = generatedByAi;
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
    
    public List<JobLearningModuleResponse> getModules() {
        return modules;
    }
    
    public void setModules(List<JobLearningModuleResponse> modules) {
        this.modules = modules;
    }
}