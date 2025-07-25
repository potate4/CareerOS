package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class InterviewJobDetailResponse {
    
    private String jobId;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String detailedAnalysis; // JSON string containing analysis results
    private String errorMessage;
    private String analysisType;
    private String videoUrl;
    private Long fileId;
    
    // Default constructor
    public InterviewJobDetailResponse() {}
    
    // Constructor with basic fields
    public InterviewJobDetailResponse(String jobId, String status, String message, 
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.jobId = jobId;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    // Constructor with all fields
    public InterviewJobDetailResponse(String jobId, String status, String message, 
                                   LocalDateTime createdAt, LocalDateTime updatedAt,
                                   String detailedAnalysis, String errorMessage, 
                                   String analysisType, String videoUrl, Long fileId) {
        this.jobId = jobId;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.detailedAnalysis = detailedAnalysis;
        this.errorMessage = errorMessage;
        this.analysisType = analysisType;
        this.videoUrl = videoUrl;
        this.fileId = fileId;
    }
    
    // Getters and Setters
    public String getJobId() {
        return jobId;
    }
    
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
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
    
    public String getDetailedAnalysis() {
        return detailedAnalysis;
    }
    
    public void setDetailedAnalysis(String detailedAnalysis) {
        this.detailedAnalysis = detailedAnalysis;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public Long getFileId() {
        return fileId;
    }
    
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }
    
    @Override
    public String toString() {
        return "InterviewJobDetailResponse{" +
                "jobId='" + jobId + '\'' +
                ", status='" + status + '\'' +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", detailedAnalysis='" + detailedAnalysis + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                ", analysisType='" + analysisType + '\'' +
                ", videoUrl='" + videoUrl + '\'' +
                ", fileId=" + fileId +
                '}';
    }
} 