package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "candidate_submissions")
public class CandidateSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;
    
    @Column(name = "application_status")
    @Enumerated(EnumType.STRING)
    private ApplicationStatus applicationStatus = ApplicationStatus.APPLIED;
    
    @Column(name = "overall_score")
    private Double overallScore;
    
    @Column(name = "learning_path_completed")
    private Boolean learningPathCompleted = false;
    
    @Column(name = "learning_path_progress")
    private Double learningPathProgress = 0.0;
    
    @Column(name = "assessments_completed")
    private Integer assessmentsCompleted = 0;
    
    @Column(name = "total_assessments")
    private Integer totalAssessments = 0;
    
    @Column(name = "average_assessment_score")
    private Double averageAssessmentScore;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "recruiter_feedback", columnDefinition = "TEXT")
    private String recruiterFeedback;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "last_activity_at")
    private LocalDateTime lastActivityAt;
    
    @OneToMany(mappedBy = "candidateSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateAssessmentSubmission> assessmentSubmissions;
    
    @OneToOne(mappedBy = "candidateSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private CandidateLearningProgress learningProgress;
    
    public enum ApplicationStatus {
        APPLIED,
        IN_REVIEW,
        LEARNING_PHASE,
        ASSESSMENT_PHASE,
        INTERVIEW_SCHEDULED,
        INTERVIEW_COMPLETED,
        ACCEPTED,
        REJECTED,
        WITHDRAWN
    }
    
    // Constructors
    public CandidateSubmission() {
        this.submittedAt = LocalDateTime.now();
        this.lastActivityAt = LocalDateTime.now();
    }
    
    public CandidateSubmission(JobPosting jobPosting, User candidate) {
        this();
        this.jobPosting = jobPosting;
        this.candidate = candidate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public JobPosting getJobPosting() {
        return jobPosting;
    }
    
    public void setJobPosting(JobPosting jobPosting) {
        this.jobPosting = jobPosting;
    }
    
    public User getCandidate() {
        return candidate;
    }
    
    public void setCandidate(User candidate) {
        this.candidate = candidate;
    }
    
    public ApplicationStatus getApplicationStatus() {
        return applicationStatus;
    }
    
    public void setApplicationStatus(ApplicationStatus applicationStatus) {
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
    
    public List<CandidateAssessmentSubmission> getAssessmentSubmissions() {
        return assessmentSubmissions;
    }
    
    public void setAssessmentSubmissions(List<CandidateAssessmentSubmission> assessmentSubmissions) {
        this.assessmentSubmissions = assessmentSubmissions;
    }
    
    public CandidateLearningProgress getLearningProgress() {
        return learningProgress;
    }
    
    public void setLearningProgress(CandidateLearningProgress learningProgress) {
        this.learningProgress = learningProgress;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastActivityAt = LocalDateTime.now();
    }
}