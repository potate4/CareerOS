package com.careeros.backend.payload.response;

import com.careeros.backend.model.JobAssessment;
import java.time.LocalDateTime;

public class JobAssessmentSummaryResponse {
    
    private Long id;
    private String assessmentName;
    private String assessmentDescription;
    private JobAssessment.AssessmentType assessmentType;
    private JobAssessment.DifficultyLevel difficultyLevel;
    private Integer timeLimitMinutes;
    private Double passingScore;
    private Double maxScore;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer totalQuestions;
    private Integer totalSubmissions;
    
    // Constructors
    public JobAssessmentSummaryResponse() {}
    
    public JobAssessmentSummaryResponse(JobAssessment assessment) {
        this.id = assessment.getId();
        this.assessmentName = assessment.getAssessmentName();
        this.assessmentDescription = assessment.getAssessmentDescription();
        this.assessmentType = assessment.getAssessmentType();
        this.difficultyLevel = assessment.getDifficultyLevel();
        this.timeLimitMinutes = assessment.getTimeLimitMinutes();
        this.passingScore = assessment.getPassingScore();
        this.maxScore = assessment.getMaxScore();
        this.isActive = assessment.getIsActive();
        this.createdAt = assessment.getCreatedAt();
        
        if (assessment.getQuestions() != null) {
            this.totalQuestions = assessment.getQuestions().size();
        } else {
            this.totalQuestions = 0;
        }
        
        if (assessment.getSubmissions() != null) {
            this.totalSubmissions = assessment.getSubmissions().size();
        } else {
            this.totalSubmissions = 0;
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public Double getPassingScore() {
        return passingScore;
    }
    
    public void setPassingScore(Double passingScore) {
        this.passingScore = passingScore;
    }
    
    public Double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(Double maxScore) {
        this.maxScore = maxScore;
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
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Integer getTotalSubmissions() {
        return totalSubmissions;
    }
    
    public void setTotalSubmissions(Integer totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }
}