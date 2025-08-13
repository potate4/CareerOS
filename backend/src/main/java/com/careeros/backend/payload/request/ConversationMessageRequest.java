package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ConversationMessageRequest {
    @NotBlank
    private String speaker; // "ai" or "user"

    @NotBlank
    private String message;

    private String audioUrl; // optional for ai TTS

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
} 