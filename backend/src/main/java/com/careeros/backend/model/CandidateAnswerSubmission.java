package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_answer_submissions")
public class CandidateAnswerSubmission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_assessment_submission_id", nullable = false)
    private CandidateAssessmentSubmission candidateAssessmentSubmission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private JobAssessmentQuestion question;
    
    @Column(name = "provided_answer", columnDefinition = "TEXT")
    private String providedAnswer;
    
    @Column(name = "is_correct")
    private Boolean isCorrect;
    
    @Column(name = "points_earned")
    private Double pointsEarned;
    
    @Column(name = "max_points")
    private Double maxPoints;
    
    @Column(name = "time_taken_seconds")
    private Integer timeTakenSeconds;
    
    @Column(name = "ai_evaluation", columnDefinition = "TEXT")
    private String aiEvaluation;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    // Constructors
    public CandidateAnswerSubmission() {
        this.submittedAt = LocalDateTime.now();
    }
    
    public CandidateAnswerSubmission(CandidateAssessmentSubmission candidateAssessmentSubmission, 
                                   JobAssessmentQuestion question, String providedAnswer) {
        this();
        this.candidateAssessmentSubmission = candidateAssessmentSubmission;
        this.question = question;
        this.providedAnswer = providedAnswer;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CandidateAssessmentSubmission getCandidateAssessmentSubmission() {
        return candidateAssessmentSubmission;
    }
    
    public void setCandidateAssessmentSubmission(CandidateAssessmentSubmission candidateAssessmentSubmission) {
        this.candidateAssessmentSubmission = candidateAssessmentSubmission;
    }
    
    public JobAssessmentQuestion getQuestion() {
        return question;
    }
    
    public void setQuestion(JobAssessmentQuestion question) {
        this.question = question;
    }
    
    public String getProvidedAnswer() {
        return providedAnswer;
    }
    
    public void setProvidedAnswer(String providedAnswer) {
        this.providedAnswer = providedAnswer;
    }
    
    public Boolean getIsCorrect() {
        return isCorrect;
    }
    
    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
    
    public Double getPointsEarned() {
        return pointsEarned;
    }
    
    public void setPointsEarned(Double pointsEarned) {
        this.pointsEarned = pointsEarned;
    }
    
    public Double getMaxPoints() {
        return maxPoints;
    }
    
    public void setMaxPoints(Double maxPoints) {
        this.maxPoints = maxPoints;
    }
    
    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }
    
    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }
    
    public String getAiEvaluation() {
        return aiEvaluation;
    }
    
    public void setAiEvaluation(String aiEvaluation) {
        this.aiEvaluation = aiEvaluation;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}