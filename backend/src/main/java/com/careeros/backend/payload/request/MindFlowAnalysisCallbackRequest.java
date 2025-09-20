package com.careeros.backend.payload.request;

public class MindFlowAnalysisCallbackRequest {
    private String jobId;
    private String analysisData; // The analysis text/JSON from AI
    private String status; // COMPLETED, FAILED
    private String errorMessage; // If status is FAILED

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getAnalysisData() {
        return analysisData;
    }

    public void setAnalysisData(String analysisData) {
        this.analysisData = analysisData;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}