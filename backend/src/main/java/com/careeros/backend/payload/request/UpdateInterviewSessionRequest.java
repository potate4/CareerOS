package com.careeros.backend.payload.request;

public class UpdateInterviewSessionRequest {
    private String sessionData; // JSON string to merge/replace
    private String status; // optional: ACTIVE or ENDED

    public String getSessionData() {
        return sessionData;
    }

    public void setSessionData(String sessionData) {
        this.sessionData = sessionData;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
} 