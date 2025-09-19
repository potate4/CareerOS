package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidate_module_progress")
public class CandidateModuleProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_learning_progress_id", nullable = false)
    private CandidateLearningProgress candidateLearningProgress;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_learning_module_id", nullable = false)
    private JobLearningModule jobLearningModule;
    
    @Column(name = "is_started")
    private Boolean isStarted = false;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;
    
    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes = 0;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    // Constructors
    public CandidateModuleProgress() {}
    
    public CandidateModuleProgress(CandidateLearningProgress candidateLearningProgress, 
                                 JobLearningModule jobLearningModule) {
        this.candidateLearningProgress = candidateLearningProgress;
        this.jobLearningModule = jobLearningModule;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CandidateLearningProgress getCandidateLearningProgress() {
        return candidateLearningProgress;
    }
    
    public void setCandidateLearningProgress(CandidateLearningProgress candidateLearningProgress) {
        this.candidateLearningProgress = candidateLearningProgress;
    }
    
    public JobLearningModule getJobLearningModule() {
        return jobLearningModule;
    }
    
    public void setJobLearningModule(JobLearningModule jobLearningModule) {
        this.jobLearningModule = jobLearningModule;
    }
    
    public Boolean getIsStarted() {
        return isStarted;
    }
    
    public void setIsStarted(Boolean isStarted) {
        this.isStarted = isStarted;
        if (isStarted && this.startedAt == null) {
            this.startedAt = LocalDateTime.now();
        }
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        if (isCompleted) {
            this.progressPercentage = 100.0;
            if (this.completedAt == null) {
                this.completedAt = LocalDateTime.now();
            }
        }
    }
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Integer getTimeSpentMinutes() {
        return timeSpentMinutes;
    }
    
    public void setTimeSpentMinutes(Integer timeSpentMinutes) {
        this.timeSpentMinutes = timeSpentMinutes;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public LocalDateTime getLastAccessedAt() {
        return lastAccessedAt;
    }
    
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) {
        this.lastAccessedAt = lastAccessedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastAccessedAt = LocalDateTime.now();
    }
}