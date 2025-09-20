package com.careeros.backend.payload.request;

public class CreateMindFlowSessionRequest {
    private String initialSessionData; // JSON string, optional
    private String scenarioType; // SALARY_NEGOTIATION, DIFFICULT_CONVERSATION, etc.

    public String getInitialSessionData() {
        return initialSessionData;
    }

    public void setInitialSessionData(String initialSessionData) {
        this.initialSessionData = initialSessionData;
    }

    public String getScenarioType() {
        return scenarioType;
    }

    public void setScenarioType(String scenarioType) {
        this.scenarioType = scenarioType;
    }
}