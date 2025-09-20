package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class MindFlowSessionResponse {
    private String sessionId;
    private Long userId;
    private String status;
    private String sessionData;
    private String scenarioType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime endedAt;

    public MindFlowSessionResponse() {}

    public MindFlowSessionResponse(String sessionId, Long userId, String status, String sessionData,
                                   String scenarioType, LocalDateTime createdAt, LocalDateTime updatedAt, 
                                   LocalDateTime endedAt) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.status = status;
        this.sessionData = sessionData;
        this.scenarioType = scenarioType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.endedAt = endedAt;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSessionData() {
        return sessionData;
    }

    public void setSessionData(String sessionData) {
        this.sessionData = sessionData;
    }

    public String getScenarioType() {
        return scenarioType;
    }

    public void setScenarioType(String scenarioType) {
        this.scenarioType = scenarioType;
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

    public LocalDateTime getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(LocalDateTime endedAt) {
        this.endedAt = endedAt;
    }
}