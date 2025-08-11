package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InterviewAnalysisAIRequest {
    
    @NotBlank(message = "Video URL is required")
    private String videoUrl;
    
    private String analysisType = "comprehensive"; // Default to comprehensive analysis
    
    private String userId;
    
    private String jobId; // Job ID for tracking
    
    private Long fileId; // Reference to file upload
    
    // Default constructor
    public InterviewAnalysisAIRequest() {}
    
    // Constructor with all fields
    public InterviewAnalysisAIRequest(String videoUrl, String analysisType, String userId, String jobId, Long fileId) {
        this.videoUrl = videoUrl;
        this.analysisType = analysisType;
        this.userId = userId;
        this.jobId = jobId;
        this.fileId = fileId;
    }
    
    // Getters and Setters
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getJobId() {
        return jobId;
    }
    
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    
    public Long getFileId() {
        return fileId;
    }
    
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }
    
    @Override
    public String toString() {
        return "InterviewAnalysisAIRequest{" +
                "videoUrl='" + videoUrl + '\'' +
                ", analysisType='" + analysisType + '\'' +
                ", userId='" + userId + '\'' +
                ", jobId='" + jobId + '\'' +
                ", fileId=" + fileId +
                '}';
    }
} 