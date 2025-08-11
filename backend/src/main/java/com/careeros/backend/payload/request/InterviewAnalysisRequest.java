package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InterviewAnalysisRequest {
    
    @NotBlank(message = "Video URL is required")
    private String videoUrl;
    
    private String analysisType = "comprehensive"; // Default to comprehensive analysis
    
    private String userId;
    
    private Long fileId; // Reference to file upload
    
    // Default constructor
    public InterviewAnalysisRequest() {}
    
    // Constructor with video URL
    public InterviewAnalysisRequest(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    // Constructor with all fields
    public InterviewAnalysisRequest(String videoUrl, String analysisType, String userId) {
        this.videoUrl = videoUrl;
        this.analysisType = analysisType;
        this.userId = userId;
    }
    
    // Constructor with all fields including fileId
    public InterviewAnalysisRequest(String videoUrl, String analysisType, String userId, Long fileId) {
        this.videoUrl = videoUrl;
        this.analysisType = analysisType;
        this.userId = userId;
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
    
    public Long getFileId() {
        return fileId;
    }
    
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }
    
    @Override
    public String toString() {
        return "InterviewAnalysisRequest{" +
                "videoUrl='" + videoUrl + '\'' +
                ", analysisType='" + analysisType + '\'' +
                ", userId='" + userId + '\'' +
                ", fileId=" + fileId +
                '}';
    }
} 