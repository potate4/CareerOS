package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class ConversationMessageResponse {
    private String sessionId;
    private Long userId;
    private String speaker;
    private String message;
    private String audioUrl;
    private LocalDateTime createdAt;

    public ConversationMessageResponse() {}

    public ConversationMessageResponse(String sessionId, Long userId, String speaker, String message, String audioUrl, LocalDateTime createdAt) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.speaker = speaker;
        this.message = message;
        this.audioUrl = audioUrl;
        this.createdAt = createdAt;
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

    public String getSpeaker() {
        return speaker;
    }

    public void setSpeaker(String speaker) {
        this.speaker = speaker;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAudioUrl() {
        return audioUrl;
    }

    public void setAudioUrl(String audioUrl) {
        this.audioUrl = audioUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 