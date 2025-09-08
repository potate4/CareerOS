package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class MindFlowJobResponse {
    private String jobId;
    private Long userId;
    private String videoUrl;
    private String status; // PENDING, COMPLETED, FAILED
    private Long fileId;
    private String analysisType;
    private String scenarioType;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime estimatedCompletionTime;

    public MindFlowJobResponse() {}

    public MindFlowJobResponse(String jobId, Long userId, String videoUrl, String status, Long fileId,
                               String analysisType, String scenarioType, String errorMessage,
                               LocalDateTime createdAt, LocalDateTime updatedAt, 
                               LocalDateTime estimatedCompletionTime) {
        this.jobId = jobId;
        this.userId = userId;
        this.videoUrl = videoUrl;
        this.status = status;
        this.fileId = fileId;
        this.analysisType = analysisType;
        this.scenarioType = scenarioType;
        this.errorMessage = errorMessage;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.estimatedCompletionTime = estimatedCompletionTime;
    }

    // Getters and Setters
    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getAnalysisType() {
        return analysisType;
    }

    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }

    public String getScenarioType() {
        return scenarioType;
    }

    public void setScenarioType(String scenarioType) {
        this.scenarioType = scenarioType;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
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

    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }

    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }
}