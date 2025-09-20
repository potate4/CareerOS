package com.careeros.backend.payload.response;

import com.careeros.backend.model.JobPosting;
import java.time.LocalDateTime;
import java.util.List;

public class JobPostingResponse {
    
    private Long id;
    private String jobTitle;
    private String company;
    private String jobDescription;
    private String requiredSkills;
    private JobPosting.ExperienceLevel experienceLevel;
    private String location;
    private JobPosting.JobType jobType;
    private String salaryRange;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String recruiterName;
    private String recruiterEmail;
    private Long totalApplications;
    private Boolean hasLearningPath;
    private Boolean hasAssessments;
    private List<JobLearningPathResponse> learningPath;
    // private List<JobAssessmentSummaryResponse> assessments;
    
    // Constructors
    public JobPostingResponse() {}
    
    public JobPostingResponse(JobPosting jobPosting) {
        this.id = jobPosting.getId();
        this.jobTitle = jobPosting.getJobTitle();
        this.company = jobPosting.getCompany();
        this.jobDescription = jobPosting.getJobDescription();
        this.requiredSkills = jobPosting.getRequiredSkills();
        this.experienceLevel = jobPosting.getExperienceLevel();
        this.location = jobPosting.getLocation();
        this.jobType = jobPosting.getJobType();
        this.salaryRange = jobPosting.getSalaryRange();
        this.isActive = jobPosting.getIsActive();
        this.createdAt = jobPosting.getCreatedAt();
        this.updatedAt = jobPosting.getUpdatedAt();

        if (jobPosting.getRecruiter() != null) {
            this.recruiterName = jobPosting.getRecruiter().getFirstName() + " " + jobPosting.getRecruiter().getLastName();
            this.recruiterEmail = jobPosting.getRecruiter().getEmail();
        }

        this.hasLearningPath = jobPosting.getJobLearningPath() != null;

        // Debug assessment detection
        System.out.println("🔥 [RESPONSE DEBUG] JobAssessments: " + jobPosting.getJobAssessments());
        if (jobPosting.getJobAssessments() != null) {
            System.out.println("🔥 [RESPONSE DEBUG] Assessment count: " + jobPosting.getJobAssessments().size());
        }

        this.hasAssessments = jobPosting.getJobAssessments() != null && !jobPosting.getJobAssessments().isEmpty();

        if (jobPosting.getCandidateSubmissions() != null) {
            this.totalApplications = (long) jobPosting.getCandidateSubmissions().size();
        } else {
            this.totalApplications = 0L;
        }

        System.out.println("🔥 [RESPONSE] JobPostingResponse created:");
        System.out.println("🔥 [RESPONSE] ID: " + this.id);
        System.out.println("🔥 [RESPONSE] Title: " + this.jobTitle);
        System.out.println("🔥 [RESPONSE] Has Learning Path: " + this.hasLearningPath);
        System.out.println("🔥 [RESPONSE] Has Assessments: " + this.hasAssessments);
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public JobPosting.ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(JobPosting.ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public JobPosting.JobType getJobType() {
        return jobType;
    }
    
    public void setJobType(JobPosting.JobType jobType) {
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
    
    public String getRecruiterName() {
        return recruiterName;
    }
    
    public void setRecruiterName(String recruiterName) {
        this.recruiterName = recruiterName;
    }
    
    public String getRecruiterEmail() {
        return recruiterEmail;
    }
    
    public void setRecruiterEmail(String recruiterEmail) {
        this.recruiterEmail = recruiterEmail;
    }
    
    public Long getTotalApplications() {
        return totalApplications;
    }
    
    public void setTotalApplications(Long totalApplications) {
        this.totalApplications = totalApplications;
    }
    
    public Boolean getHasLearningPath() {
        return hasLearningPath;
    }
    
    public void setHasLearningPath(Boolean hasLearningPath) {
        this.hasLearningPath = hasLearningPath;
    }
    
    public Boolean getHasAssessments() {
        return hasAssessments;
    }
    
    public void setHasAssessments(Boolean hasAssessments) {
        this.hasAssessments = hasAssessments;
    }
    
    public List<JobLearningPathResponse> getLearningPath() {
        return learningPath;
    }
    
    public void setLearningPath(List<JobLearningPathResponse> learningPath) {
        this.learningPath = learningPath;
    }
    
    // public List<JobAssessmentSummaryResponse> getAssessments() {
    //     return assessments;
    // }
    //
    // public void setAssessments(List<JobAssessmentSummaryResponse> assessments) {
    //     this.assessments = assessments;
    // }
}