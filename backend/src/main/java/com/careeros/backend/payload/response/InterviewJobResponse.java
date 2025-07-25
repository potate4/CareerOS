package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class InterviewJobResponse {
    
    private String jobId;
    private String status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime estimatedCompletionTime;
    
    // Default constructor
    public InterviewJobResponse() {}
    
    // Constructor with required fields
    public InterviewJobResponse(String jobId, String status, String message) {
        this.jobId = jobId;
        this.status = status;
        this.message = message;
        this.createdAt = LocalDateTime.now();
        this.estimatedCompletionTime = LocalDateTime.now().plusMinutes(5); // Default 5 minutes
    }
    
    // Constructor with all fields
    public InterviewJobResponse(String jobId, String status, String message, 
                              LocalDateTime createdAt, LocalDateTime estimatedCompletionTime) {
        this.jobId = jobId;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
        this.estimatedCompletionTime = estimatedCompletionTime;
    }
    
    // Getters and Setters
    public String getJobId() {
        return jobId;
    }
    
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }
    
    public void setEstimatedCompletionTime(LocalDateTime estimatedCompletionTime) {
        this.estimatedCompletionTime = estimatedCompletionTime;
    }
    
    @Override
    public String toString() {
        return "InterviewJobResponse{" +
                "jobId='" + jobId + '\'' +
                ", status='" + status + '\'' +
                ", message='" + message + '\'' +
                ", createdAt=" + createdAt +
                ", estimatedCompletionTime=" + estimatedCompletionTime +
                '}';
    }
} 