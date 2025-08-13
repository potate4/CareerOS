package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_conversations", indexes = {
        @Index(name = "idx_conv_session", columnList = "session_id"),
        @Index(name = "idx_conv_user", columnList = "user_id")
})
public class InterviewConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "speaker", nullable = false)
    private String speaker; // "ai" or "user"

    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "audio_url")
    private String audioUrl; // Optional: TTS audio URL for AI messages

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public InterviewConversation() {
        this.createdAt = LocalDateTime.now();
    }

    public InterviewConversation(String sessionId, Long userId, String speaker, String message, String audioUrl) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.speaker = speaker;
        this.message = message;
        this.audioUrl = audioUrl;
        this.createdAt = LocalDateTime.now();
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