package com.careeros.backend.payload.request;

import com.careeros.backend.model.JobPosting;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class JobPostingRequest {
    
    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Job title must not exceed 200 characters")
    private String jobTitle;
    
    @NotBlank(message = "Company name is required")
    @Size(max = 200, message = "Company name must not exceed 200 characters")
    private String company;
    
    @NotBlank(message = "Job description is required")
    private String jobDescription;
    
    private String requiredSkills;
    
    @NotNull(message = "Experience level is required")
    private JobPosting.ExperienceLevel experienceLevel;
    
    private String location;
    
    @NotNull(message = "Job type is required")
    private JobPosting.JobType jobType;
    
    private String salaryRange;
    
    private Boolean generateLearningPath = true;
    
    private Boolean generateAssessment = true;
    
    // Constructors
    public JobPostingRequest() {}
    
    public JobPostingRequest(String jobTitle, String company, String jobDescription, 
                           JobPosting.ExperienceLevel experienceLevel, JobPosting.JobType jobType) {
        this.jobTitle = jobTitle;
        this.company = company;
        this.jobDescription = jobDescription;
        this.experienceLevel = experienceLevel;
        this.jobType = jobType;
    }
    
    // Getters and Setters
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
    
    public Boolean getGenerateLearningPath() {
        return generateLearningPath;
    }
    
    public void setGenerateLearningPath(Boolean generateLearningPath) {
        this.generateLearningPath = generateLearningPath;
    }
    
    public Boolean getGenerateAssessment() {
        return generateAssessment;
    }
    
    public void setGenerateAssessment(Boolean generateAssessment) {
        this.generateAssessment = generateAssessment;
    }
    
    public String toAIRequestString() {
        StringBuilder sb = new StringBuilder();
        sb.append("Job Title: ").append(jobTitle).append("\n");
        sb.append("Company: ").append(company).append("\n");
        sb.append("Experience Level: ").append(experienceLevel).append("\n");
        sb.append("Job Type: ").append(jobType).append("\n");
        if (location != null) {
            sb.append("Location: ").append(location).append("\n");
        }
        if (salaryRange != null) {
            sb.append("Salary Range: ").append(salaryRange).append("\n");
        }
        if (requiredSkills != null) {
            sb.append("Required Skills: ").append(requiredSkills).append("\n");
        }
        sb.append("Job Description: ").append(jobDescription);
        return sb.toString();
    }
}