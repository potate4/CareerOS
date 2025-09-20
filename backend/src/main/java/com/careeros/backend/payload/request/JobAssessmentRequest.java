package com.careeros.backend.payload.request;

import com.careeros.backend.model.JobAssessment;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class JobAssessmentRequest {
    
    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;
    
    @NotBlank(message = "Assessment name is required")
    private String assessmentName;
    
    private String assessmentDescription;
    
    @NotNull(message = "Assessment type is required")
    private JobAssessment.AssessmentType assessmentType;
    
    @NotNull(message = "Difficulty level is required")
    private JobAssessment.DifficultyLevel difficultyLevel;
    
    @Min(value = 1, message = "Time limit must be at least 1 minute")
    private Integer timeLimitMinutes;
    
    @Min(value = 1, message = "Number of questions must be at least 1")
    private Integer numberOfQuestions = 10;
    
    private Double passingScore;
    
    private Boolean generateWithAI = true;
    
    // Constructors
    public JobAssessmentRequest() {}
    
    public JobAssessmentRequest(Long jobPostingId, String assessmentName, 
                              JobAssessment.AssessmentType assessmentType, 
                              JobAssessment.DifficultyLevel difficultyLevel) {
        this.jobPostingId = jobPostingId;
        this.assessmentName = assessmentName;
        this.assessmentType = assessmentType;
        this.difficultyLevel = difficultyLevel;
    }
    
    // Getters and Setters
    public Long getJobPostingId() {
        return jobPostingId;
    }
    
    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public String getAssessmentName() {
        return assessmentName;
    }
    
    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }
    
    public String getAssessmentDescription() {
        return assessmentDescription;
    }
    
    public void setAssessmentDescription(String assessmentDescription) {
        this.assessmentDescription = assessmentDescription;
    }
    
    public JobAssessment.AssessmentType getAssessmentType() {
        return assessmentType;
    }
    
    public void setAssessmentType(JobAssessment.AssessmentType assessmentType) {
        this.assessmentType = assessmentType;
    }
    
    public JobAssessment.DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(JobAssessment.DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }
    
    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }
    
    public Integer getNumberOfQuestions() {
        return numberOfQuestions;
    }
    
    public void setNumberOfQuestions(Integer numberOfQuestions) {
        this.numberOfQuestions = numberOfQuestions;
    }
    
    public Double getPassingScore() {
        return passingScore;
    }
    
    public void setPassingScore(Double passingScore) {
        this.passingScore = passingScore;
    }
    
    public Boolean getGenerateWithAI() {
        return generateWithAI;
    }
    
    public void setGenerateWithAI(Boolean generateWithAI) {
        this.generateWithAI = generateWithAI;
    }
}