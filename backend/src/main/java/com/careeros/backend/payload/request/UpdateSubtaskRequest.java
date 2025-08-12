package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotNull;

public class UpdateSubtaskRequest {
    @NotNull
    private Boolean isCompleted;
    private String userNotes;

    public UpdateSubtaskRequest() {}

    public UpdateSubtaskRequest(Boolean isCompleted, String userNotes) {
        this.isCompleted = isCompleted;
        this.userNotes = userNotes;
    }

    public Boolean getIsCompleted() { return isCompleted; }
    public void setIsCompleted(Boolean isCompleted) { this.isCompleted = isCompleted; }
    public String getUserNotes() { return userNotes; }
    public void setUserNotes(String userNotes) { this.userNotes = userNotes; }
} 