package com.careeros.backend.payload.request;

public class CreateInterviewSessionRequest {
    private String initialSessionData; // JSON string, optional

    public String getInitialSessionData() {
        return initialSessionData;
    }

    public void setInitialSessionData(String initialSessionData) {
        this.initialSessionData = initialSessionData;
    }
} 