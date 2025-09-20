package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "candidate_assessment_submissions")
public class CandidateAssessmentSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_submission_id", nullable = false)
    private CandidateSubmission candidateSubmission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_assessment_id", nullable = false)
    private JobAssessment jobAssessment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private User candidate;
    
    @Column(name = "score_achieved")
    private Double scoreAchieved;
    
    @Column(name = "max_score")
    private Double maxScore;
    
    @Column(name = "percentage_score")
    private Double percentageScore;
    
    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;
    
    @Column(name = "is_passed")
    private Boolean isPassed;
    
    @Column(name = "submission_status")
    @Enumerated(EnumType.STRING)
    private SubmissionStatus submissionStatus = SubmissionStatus.IN_PROGRESS;
    
    @Column(name = "ai_feedback", columnDefinition = "TEXT")
    private String aiFeedback;
    
    @Column(name = "recruiter_feedback", columnDefinition = "TEXT")
    private String recruiterFeedback;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt;
    
    @OneToMany(mappedBy = "candidateAssessmentSubmission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateAnswerSubmission> answerSubmissions;
    
    public enum SubmissionStatus {
        IN_PROGRESS,
        SUBMITTED,
        EVALUATED,
        EXPIRED
    }
    
    // Constructors
    public CandidateAssessmentSubmission() {
        this.startedAt = LocalDateTime.now();
    }
    
    public CandidateAssessmentSubmission(CandidateSubmission candidateSubmission, JobAssessment jobAssessment, User candidate) {
        this();
        this.candidateSubmission = candidateSubmission;
        this.jobAssessment = jobAssessment;
        this.candidate = candidate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CandidateSubmission getCandidateSubmission() {
        return candidateSubmission;
    }
    
    public void setCandidateSubmission(CandidateSubmission candidateSubmission) {
        this.candidateSubmission = candidateSubmission;
    }
    
    public JobAssessment getJobAssessment() {
        return jobAssessment;
    }
    
    public void setJobAssessment(JobAssessment jobAssessment) {
        this.jobAssessment = jobAssessment;
    }
    
    public User getCandidate() {
        return candidate;
    }
    
    public void setCandidate(User candidate) {
        this.candidate = candidate;
    }
    
    public Double getScoreAchieved() {
        return scoreAchieved;
    }
    
    public void setScoreAchieved(Double scoreAchieved) {
        this.scoreAchieved = scoreAchieved;
    }
    
    public Double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(Double maxScore) {
        this.maxScore = maxScore;
    }
    
    public Double getPercentageScore() {
        return percentageScore;
    }
    
    public void setPercentageScore(Double percentageScore) {
        this.percentageScore = percentageScore;
    }
    
    public Integer getTimeTakenMinutes() {
        return timeTakenMinutes;
    }
    
    public void setTimeTakenMinutes(Integer timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }
    
    public Boolean getIsPassed() {
        return isPassed;
    }
    
    public void setIsPassed(Boolean isPassed) {
        this.isPassed = isPassed;
    }
    
    public SubmissionStatus getSubmissionStatus() {
        return submissionStatus;
    }
    
    public void setSubmissionStatus(SubmissionStatus submissionStatus) {
        this.submissionStatus = submissionStatus;
    }
    
    public String getAiFeedback() {
        return aiFeedback;
    }
    
    public void setAiFeedback(String aiFeedback) {
        this.aiFeedback = aiFeedback;
    }
    
    public String getRecruiterFeedback() {
        return recruiterFeedback;
    }
    
    public void setRecruiterFeedback(String recruiterFeedback) {
        this.recruiterFeedback = recruiterFeedback;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }
    
    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
    
    public List<CandidateAnswerSubmission> getAnswerSubmissions() {
        return answerSubmissions;
    }
    
    public void setAnswerSubmissions(List<CandidateAnswerSubmission> answerSubmissions) {
        this.answerSubmissions = answerSubmissions;
    }
}