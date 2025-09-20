package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "job_postings")
public class JobPosting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", nullable = false)
    private User recruiter;
    
    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;
    
    @Column(name = "company", nullable = false, length = 200)
    private String company;
    
    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;
    
    @Column(name = "required_skills", columnDefinition = "TEXT")
    private String requiredSkills;
    
    @Column(name = "experience_level")
    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "job_type")
    @Enumerated(EnumType.STRING)
    private JobType jobType;
    
    @Column(name = "salary_range")
    private String salaryRange;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToOne(mappedBy = "jobPosting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private JobLearningPath jobLearningPath;
    
    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<JobAssessment> jobAssessments;
    
    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateSubmission> candidateSubmissions;
    
    public enum ExperienceLevel {
        ENTRY_LEVEL,
        JUNIOR,
        MID_LEVEL,
        SENIOR,
        EXPERT
    }
    
    public enum JobType {
        FULL_TIME,
        PART_TIME,
        CONTRACT,
        INTERNSHIP,
        FREELANCE
    }
    
    // Constructors
    public JobPosting() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public JobPosting(User recruiter, String jobTitle, String company, String jobDescription) {
        this();
        this.recruiter = recruiter;
        this.jobTitle = jobTitle;
        this.company = company;
        this.jobDescription = jobDescription;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getRecruiter() {
        return recruiter;
    }
    
    public void setRecruiter(User recruiter) {
        this.recruiter = recruiter;
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
    
    public String getJobDescription() {
        return jobDescription;
    }
    
    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }
    
    public String getRequiredSkills() {
        return requiredSkills;
    }
    
    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }
    
    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public JobType getJobType() {
        return jobType;
    }
    
    public void setJobType(JobType jobType) {
        this.jobType = jobType;
    }
    
    public String getSalaryRange() {
        return salaryRange;
    }
    
    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
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
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public JobLearningPath getJobLearningPath() {
        return jobLearningPath;
    }
    
    public void setJobLearningPath(JobLearningPath jobLearningPath) {
        this.jobLearningPath = jobLearningPath;
    }
    
    public List<JobAssessment> getJobAssessments() {
        return jobAssessments;
    }
    
    public void setJobAssessments(List<JobAssessment> jobAssessments) {
        this.jobAssessments = jobAssessments;
    }
    
    public List<CandidateSubmission> getCandidateSubmissions() {
        return candidateSubmissions;
    }
    
    public void setCandidateSubmissions(List<CandidateSubmission> candidateSubmissions) {
        this.candidateSubmissions = candidateSubmissions;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}