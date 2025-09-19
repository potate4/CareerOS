package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "candidate_learning_progress")
public class CandidateLearningProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_submission_id", nullable = false)
    private CandidateSubmission candidateSubmission;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_learning_path_id", nullable = false)
    private JobLearningPath jobLearningPath;
    
    @Column(name = "current_module_index")
    private Integer currentModuleIndex = 0;
    
    @Column(name = "modules_completed")
    private Integer modulesCompleted = 0;
    
    @Column(name = "total_modules")
    private Integer totalModules = 0;
    
    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;
    
    @Column(name = "time_spent_hours")
    private Double timeSpentHours = 0.0;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    @OneToMany(mappedBy = "candidateLearningProgress", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateModuleProgress> moduleProgresses;
    
    // Constructors
    public CandidateLearningProgress() {
        this.startedAt = LocalDateTime.now();
        this.lastAccessedAt = LocalDateTime.now();
    }
    
    public CandidateLearningProgress(CandidateSubmission candidateSubmission, JobLearningPath jobLearningPath) {
        this();
        this.candidateSubmission = candidateSubmission;
        this.jobLearningPath = jobLearningPath;
        if (jobLearningPath.getModules() != null) {
            this.totalModules = jobLearningPath.getModules().size();
        }
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
    
    public JobLearningPath getJobLearningPath() {
        return jobLearningPath;
    }
    
    public void setJobLearningPath(JobLearningPath jobLearningPath) {
        this.jobLearningPath = jobLearningPath;
    }
    
    public Integer getCurrentModuleIndex() {
        return currentModuleIndex;
    }
    
    public void setCurrentModuleIndex(Integer currentModuleIndex) {
        this.currentModuleIndex = currentModuleIndex;
    }
    
    public Integer getModulesCompleted() {
        return modulesCompleted;
    }
    
    public void setModulesCompleted(Integer modulesCompleted) {
        this.modulesCompleted = modulesCompleted;
        if (this.totalModules != null && this.totalModules > 0) {
            this.progressPercentage = (modulesCompleted.doubleValue() / this.totalModules.doubleValue()) * 100.0;
        }
    }
    
    public Integer getTotalModules() {
        return totalModules;
    }
    
    public void setTotalModules(Integer totalModules) {
        this.totalModules = totalModules;
    }
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public Double getTimeSpentHours() {
        return timeSpentHours;
    }
    
    public void setTimeSpentHours(Double timeSpentHours) {
        this.timeSpentHours = timeSpentHours;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
        if (isCompleted && this.completedAt == null) {
            this.completedAt = LocalDateTime.now();
        }
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
    
    public List<CandidateModuleProgress> getModuleProgresses() {
        return moduleProgresses;
    }
    
    public void setModuleProgresses(List<CandidateModuleProgress> moduleProgresses) {
        this.moduleProgresses = moduleProgresses;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.lastAccessedAt = LocalDateTime.now();
    }
}