package com.careeros.backend.payload.response;

import com.careeros.backend.model.CandidateSubmission;
import java.time.LocalDateTime;

public class CandidateSubmissionResponse {
    
    private Long id;
    private Long jobPostingId;
    private String jobTitle;
    private String company;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private CandidateSubmission.ApplicationStatus applicationStatus;
    private Double overallScore;
    private Boolean learningPathCompleted;
    private Double learningPathProgress;
    private Integer assessmentsCompleted;
    private Integer totalAssessments;
    private Double averageAssessmentScore;
    private String notes;
    private String recruiterFeedback;
    private LocalDateTime submittedAt;
    private LocalDateTime lastActivityAt;
    
    // Constructors
    public CandidateSubmissionResponse() {}
    
    public CandidateSubmissionResponse(CandidateSubmission submission) {
        this.id = submission.getId();
        this.jobPostingId = submission.getJobPosting().getId();
        this.jobTitle = submission.getJobPosting().getJobTitle();
        this.company = submission.getJobPosting().getCompany();
        this.candidateId = submission.getCandidate().getId();
        this.candidateName = submission.getCandidate().getFirstName() + " " + submission.getCandidate().getLastName();
        this.candidateEmail = submission.getCandidate().getEmail();
        this.applicationStatus = submission.getApplicationStatus();
        this.overallScore = submission.getOverallScore();
        this.learningPathCompleted = submission.getLearningPathCompleted();
        this.learningPathProgress = submission.getLearningPathProgress();
        this.assessmentsCompleted = submission.getAssessmentsCompleted();
        this.totalAssessments = submission.getTotalAssessments();
        this.averageAssessmentScore = submission.getAverageAssessmentScore();
        this.notes = submission.getNotes();
        this.recruiterFeedback = submission.getRecruiterFeedback();
        this.submittedAt = submission.getSubmittedAt();
        this.lastActivityAt = submission.getLastActivityAt();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getJobPostingId() {
        return jobPostingId;
    }
    
    public void setJobPostingId(Long jobPostingId) {
        this.jobPostingId = jobPostingId;
    }
    
    public String getJobTitle() {
        return jobTitle;
    }
    
    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }
    
    public String getCompany() {
        return company;
    }
    
    public void setCompany(String company) {
        this.company = company;
    }
    
    public Long getCandidateId() {
        return candidateId;
    }
    
    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }
    
    public String getCandidateName() {
        return candidateName;
    }
    
    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }
    
    public String getCandidateEmail() {
        return candidateEmail;
    }
    
    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }
    
    public CandidateSubmission.ApplicationStatus getApplicationStatus() {
        return applicationStatus;
    }
    
    public void setApplicationStatus(CandidateSubmission.ApplicationStatus applicationStatus) {
        this.applicationStatus = applicationStatus;
    }
    
    public Double getOverallScore() {
        return overallScore;
    }
    
    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }
    
    public Boolean getLearningPathCompleted() {
        return learningPathCompleted;
    }
    
    public void setLearningPathCompleted(Boolean learningPathCompleted) {
        this.learningPathCompleted = learningPathCompleted;
    }
    
    public Double getLearningPathProgress() {
        return learningPathProgress;
    }
    
    public void setLearningPathProgress(Double learningPathProgress) {
        this.learningPathProgress = learningPathProgress;
    }
    
    public Integer getAssessmentsCompleted() {
        return assessmentsCompleted;
    }
    
    public void setAssessmentsCompleted(Integer assessmentsCompleted) {
        this.assessmentsCompleted = assessmentsCompleted;
    }
    
    public Integer getTotalAssessments() {
        return totalAssessments;
    }
    
    public void setTotalAssessments(Integer totalAssessments) {
        this.totalAssessments = totalAssessments;
    }
    
    public Double getAverageAssessmentScore() {
        return averageAssessmentScore;
    }
    
    public void setAverageAssessmentScore(Double averageAssessmentScore) {
        this.averageAssessmentScore = averageAssessmentScore;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getRecruiterFeedback() {
        return recruiterFeedback;
    }
    
    public void setRecruiterFeedback(String recruiterFeedback) {
        this.recruiterFeedback = recruiterFeedback;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }
    
    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }
}