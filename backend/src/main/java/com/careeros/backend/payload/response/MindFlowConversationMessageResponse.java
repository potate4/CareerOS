package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class MindFlowConversationMessageResponse {
    private Long id;
    private String sessionId;
    private Long userId;
    private String speaker; // "ai" or "user"
    private String message;
    private String audioUrl;
    private LocalDateTime createdAt;

    public MindFlowConversationMessageResponse() {}

    public MindFlowConversationMessageResponse(Long id, String sessionId, Long userId, String speaker, 
                                               String message, String audioUrl, LocalDateTime createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.userId = userId;
        this.speaker = speaker;
        this.message = message;
        this.audioUrl = audioUrl;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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