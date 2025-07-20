package com.careeros.backend.payload.response;

import java.time.LocalDateTime;
import java.util.Map;

public class InterviewAnalysisResponse {
    
    private String analysisId;
    private String userId;
    private String videoUrl;
    private String analysisType;
    private String analysisText;
    private Map<String, Object> detailedAnalysis;
    private String confidenceScore;
    private String processingTimeMs;
    private LocalDateTime createdAt;
    private String status;
    
    // Default constructor
    public InterviewAnalysisResponse() {}
    
    // Constructor with basic fields
    public InterviewAnalysisResponse(String analysisId, String userId, String videoUrl, String analysisText) {
        this.analysisId = analysisId;
        this.userId = userId;
        this.videoUrl = videoUrl;
        this.analysisText = analysisText;
        this.createdAt = LocalDateTime.now();
        this.status = "completed";
    }
    
    // Constructor with all fields
    public InterviewAnalysisResponse(String analysisId, String userId, String videoUrl, String analysisType, 
                                   String analysisText, Map<String, Object> detailedAnalysis, String confidenceScore, 
                                   String processingTimeMs, LocalDateTime createdAt, String status) {
        this.analysisId = analysisId;
        this.userId = userId;
        this.videoUrl = videoUrl;
        this.analysisType = analysisType;
        this.analysisText = analysisText;
        this.detailedAnalysis = detailedAnalysis;
        this.confidenceScore = confidenceScore;
        this.processingTimeMs = processingTimeMs;
        this.createdAt = createdAt;
        this.status = status;
    }
    
    // Getters and Setters
    public String getAnalysisId() {
        return analysisId;
    }
    
    public void setAnalysisId(String analysisId) {
        this.analysisId = analysisId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
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
    
    public String getAnalysisText() {
        return analysisText;
    }
    
    public void setAnalysisText(String analysisText) {
        this.analysisText = analysisText;
    }
    
    public Map<String, Object> getDetailedAnalysis() {
        return detailedAnalysis;
    }
    
    public void setDetailedAnalysis(Map<String, Object> detailedAnalysis) {
        this.detailedAnalysis = detailedAnalysis;
    }
    
    public String getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(String confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getProcessingTimeMs() {
        return processingTimeMs;
    }
    
    public void setProcessingTimeMs(String processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    @Override
    public String toString() {
        return "InterviewAnalysisResponse{" +
                "analysisId='" + analysisId + '\'' +
                ", userId='" + userId + '\'' +
                ", videoUrl='" + videoUrl + '\'' +
                ", analysisType='" + analysisType + '\'' +
                ", analysisText='" + analysisText + '\'' +
                ", detailedAnalysis=" + detailedAnalysis +
                ", confidenceScore='" + confidenceScore + '\'' +
                ", processingTimeMs='" + processingTimeMs + '\'' +
                ", createdAt=" + createdAt +
                ", status='" + status + '\'' +
                '}';
    }
} 