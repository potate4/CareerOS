package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_learning_paths")
public class JobLearningPath {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id", nullable = false)
    private JobPosting jobPosting;
    
    @Column(name = "generated_by_ai")
    private Boolean generatedByAi = false;
    
    @Column(name = "career_goal", nullable = false)
    private String careerGoal;
    
    @Column(name = "experience_level")
    private String experienceLevel;
    
    @Column(name = "learning_pace")
    private String learningPace;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "jobLearningPath", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobLearningModule> modules;
    
    // Constructors
    public JobLearningPath() {
        this.createdAt = LocalDateTime.now();
    }
    
    public JobLearningPath(JobPosting jobPosting, String careerGoal, String experienceLevel, String learningPace) {
        this();
        this.jobPosting = jobPosting;
        this.careerGoal = careerGoal;
        this.experienceLevel = experienceLevel;
        this.learningPace = learningPace;
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
    
    public Boolean getGeneratedByAi() {
        return generatedByAi;
    }
    
    public void setGeneratedByAi(Boolean generatedByAi) {
        this.generatedByAi = generatedByAi;
    }
    
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public String getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getLearningPace() {
        return learningPace;
    }
    
    public void setLearningPace(String learningPace) {
        this.learningPace = learningPace;
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
    
    public List<JobLearningModule> getModules() {
        return modules;
    }
    
    public void setModules(List<JobLearningModule> modules) {
        this.modules = modules;
    }
}