package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class InterviewAnalysisCallbackRequest {
    
    @NotBlank(message = "Job ID is required")
    private String jobId;
    
    @NotBlank(message = "Analysis data is required")
    private String analysisData; // JSON string containing the analysis results
    
    private String status = "COMPLETED"; // Default to completed
    
    private String errorMessage; // In case of failure
    
    // Default constructor
    public InterviewAnalysisCallbackRequest() {}
    
    // Constructor with required fields
    public InterviewAnalysisCallbackRequest(String jobId, String analysisData) {
        this.jobId = jobId;
        this.analysisData = analysisData;
        this.status = "COMPLETED";
    }
    
    // Constructor with all fields
    public InterviewAnalysisCallbackRequest(String jobId, String analysisData, String status, String errorMessage) {
        this.jobId = jobId;
        this.analysisData = analysisData;
        this.status = status;
        this.errorMessage = errorMessage;
    }
    
    // Getters and Setters
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
    
    @Override
    public String toString() {
        return "InterviewAnalysisCallbackRequest{" +
                "jobId='" + jobId + '\'' +
                ", analysisData='" + analysisData + '\'' +
                ", status='" + status + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                '}';
    }
} 