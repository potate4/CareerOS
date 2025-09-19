package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotNull;

public class CandidateApplicationRequest {
    
    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;
    
    private String coverLetter;
    
    private String notes;
    
    // Constructors
    public CandidateApplicationRequest() {}
    
    public CandidateApplicationRequest(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public CandidateApplicationRequest(Long jobPostingId, String coverLetter, String notes) {
        this.jobPostingId = jobPostingId;
        this.coverLetter = coverLetter;
        this.notes = notes;
    }
    
    // Getters and Setters
    public Long getJobPostingId() {
        return jobPostingId;
    }
    
    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public String getCoverLetter() {
        return coverLetter;
    }
    
    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}