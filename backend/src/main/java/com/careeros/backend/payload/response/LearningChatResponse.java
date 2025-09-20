package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class LearningChatResponse {
    
    private boolean success;
    private String message;
    private String reply;
    private Long userId;
    private Long moduleId;
    private double processingTimeSeconds;
    private LocalDateTime timestamp;

    public LearningChatResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public LearningChatResponse(boolean success, String message, String reply, Long userId, Long moduleId, double processingTimeSeconds) {
        this();
        this.success = success;
        this.message = message;
        this.reply = reply;
        this.userId = userId;
        this.moduleId = moduleId;
        this.processingTimeSeconds = processingTimeSeconds;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getModuleId() {
        return moduleId;
    }

    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    public double getProcessingTimeSeconds() {
        return processingTimeSeconds;
    }

    public void setProcessingTimeSeconds(double processingTimeSeconds) {
        this.processingTimeSeconds = processingTimeSeconds;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
} 