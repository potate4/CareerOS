package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_assessments")
public class JobAssessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;
    
    @Column(name = "assessment_name", nullable = false)
    private String assessmentName;
    
    @Column(name = "assessment_description", columnDefinition = "TEXT")
    private String assessmentDescription;
    
    @Column(name = "assessment_type")
    @Enumerated(EnumType.STRING)
    private AssessmentType assessmentType;
    
    @Column(name = "difficulty_level")
    @Enumerated(EnumType.STRING)
    private DifficultyLevel difficultyLevel;
    
    @Column(name = "time_limit_minutes")
    private Integer timeLimitMinutes;
    
    @Column(name = "passing_score")
    private Double passingScore;
    
    @Column(name = "max_score")
    private Double maxScore;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "jobAssessment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobAssessmentQuestion> questions;
    
    @OneToMany(mappedBy = "jobAssessment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateAssessmentSubmission> submissions;
    
    public enum AssessmentType {
        TECHNICAL_QUIZ,
        CODING_CHALLENGE,
        BEHAVIORAL_TEST,
        SKILL_ASSESSMENT,
        MIXED
    }
    
    public enum DifficultyLevel {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED,
        EXPERT
    }
    
    // Constructors
    public JobAssessment() {
        this.createdAt = LocalDateTime.now();
    }
    
    public JobAssessment(JobPosting jobPosting, String assessmentName, AssessmentType assessmentType) {
        this();
        this.jobPosting = jobPosting;
        this.assessmentName = assessmentName;
        this.assessmentType = assessmentType;
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
    
    public String getAssessmentName() {
        return assessmentName;
    }
    
    public void setAssessmentName(String assessmentName) {
        this.assessmentName = assessmentName;
    }
    
    public String getAssessmentDescription() {
        return assessmentDescription;
    }
    
    public void setAssessmentDescription(String assessmentDescription) {
        this.assessmentDescription = assessmentDescription;
    }
    
    public AssessmentType getAssessmentType() {
        return assessmentType;
    }
    
    public void setAssessmentType(AssessmentType assessmentType) {
        this.assessmentType = assessmentType;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Integer getTimeLimitMinutes() {
        return timeLimitMinutes;
    }
    
    public void setTimeLimitMinutes(Integer timeLimitMinutes) {
        this.timeLimitMinutes = timeLimitMinutes;
    }
    
    public Double getPassingScore() {
        return passingScore;
    }
    
    public void setPassingScore(Double passingScore) {
        this.passingScore = passingScore;
    }
    
    public Double getMaxScore() {
        return maxScore;
    }
    
    public void setMaxScore(Double maxScore) {
        this.maxScore = maxScore;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<JobAssessmentQuestion> getQuestions() {
        return questions;
    }
    
    public void setQuestions(List<JobAssessmentQuestion> questions) {
        this.questions = questions;
    }
    
    public List<CandidateAssessmentSubmission> getSubmissions() {
        return submissions;
    }
    
    public void setSubmissions(List<CandidateAssessmentSubmission> submissions) {
        this.submissions = submissions;
    }
}