package com.careeros.backend.payload.response;

import java.time.LocalDateTime;
import java.util.Map;

public class AIAnalysisResponse {
    private String analysisId;
    private Integer userId;
    private String content;
    private String analysisType;
    private Map<String, Object> result;
    private Double confidenceScore;
    private Integer processingTimeMs;
    private LocalDateTime createdAt;
    private String status;
    
    public AIAnalysisResponse() {}
    
    public AIAnalysisResponse(String analysisId, Integer userId, String content, String analysisType, 
                            Map<String, Object> result, Double confidenceScore, Integer processingTimeMs, 
                            LocalDateTime createdAt, String status) {
        this.analysisId = analysisId;
        this.userId = userId;
        this.content = content;
        this.analysisType = analysisType;
        this.result = result;
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
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public Map<String, Object> getResult() {
        return result;
    }
    
    public void setResult(Map<String, Object> result) {
        this.result = result;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public Integer getProcessingTimeMs() {
        return processingTimeMs;
    }
    
    public void setProcessingTimeMs(Integer processingTimeMs) {
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
} 