package com.careeros.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_profiles")
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;
    
    // Basic Information
    @Column(name = "current_role", nullable = false)
    private String currentRole;
    
    @Column(name = "education")
    private String education;
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;
    
    @Column(name = "current_salary", precision = 10, scale = 2)
    private BigDecimal currentSalary;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "industry")
    private String industry;
    
    @Column(name = "company_name")
    private String companyName;
    
    @Column(name = "company_size")
    private String companySize;
    
    // Skills and Competencies (stored as JSON arrays)
    @Type(JsonType.class)
    @Column(name = "skills", columnDefinition = "jsonb")
    private List<String> skills;
    
    @Type(JsonType.class)
    @Column(name = "certifications", columnDefinition = "jsonb")
    private List<String> certifications;
    
    @Type(JsonType.class)
    @Column(name = "languages", columnDefinition = "jsonb")
    private List<String> languages;
    
    @Type(JsonType.class)
    @Column(name = "portfolio_projects", columnDefinition = "jsonb")
    private List<String> portfolioProjects;
    
    // Career Preferences
    @Column(name = "work_environment")
    @Enumerated(EnumType.STRING)
    private WorkEnvironment workEnvironment;
    
    @Column(name = "preferred_salary_min", precision = 10, scale = 2)
    private BigDecimal preferredSalaryMin;
    
    @Column(name = "preferred_salary_max", precision = 10, scale = 2)
    private BigDecimal preferredSalaryMax;
    
    @Type(JsonType.class)
    @Column(name = "preferred_locations", columnDefinition = "jsonb")
    private List<String> preferredLocations;
    
    @Type(JsonType.class)
    @Column(name = "preferred_industries", columnDefinition = "jsonb")
    private List<String> preferredIndustries;
    
    @Column(name = "learning_style")
    @Enumerated(EnumType.STRING)
    private LearningStyle learningStyle;
    
    @Column(name = "risk_tolerance")
    @Enumerated(EnumType.STRING)
    private RiskTolerance riskTolerance;
    
    // Career Goals
    @Column(name = "career_goals", length = 1000)
    private String careerGoals;
    
    @Type(JsonType.class)
    @Column(name = "strengths", columnDefinition = "jsonb")
    private List<String> strengths;
    
    @Type(JsonType.class)
    @Column(name = "weaknesses", columnDefinition = "jsonb")
    private List<String> weaknesses;
    
    @Column(name = "willing_to_relocate")
    private Boolean willingToRelocate;
    
    @Column(name = "availability_to_start")
    private String availabilityToStart;
    
    // Additional Information
    @Column(name = "bio", length = 2000)
    private String bio;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "portfolio_url")
    private String portfolioUrl;
    
    @Column(name = "resume_url")
    private String resumeUrl;
    
    // Metadata
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "is_public")
    private Boolean isPublic = false;
    
    @Column(name = "profile_completion_percentage")
    private Integer profileCompletionPercentage = 0;
    
    // Enums
    public enum WorkEnvironment {
        REMOTE, HYBRID, ONSITE, FLEXIBLE
    }
    
    public enum LearningStyle {
        HANDS_ON, THEORETICAL, MIXED, VISUAL, AUDITORY
    }
    
    public enum RiskTolerance {
        LOW, MEDIUM, HIGH
    }
    
    // Constructors
    public UserProfile() {}
    
    public UserProfile(User user, String currentRole) {
        this.user = user;
        this.currentRole = currentRole;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getCurrentRole() {
        return currentRole;
    }
    
    public void setCurrentRole(String currentRole) {
        this.currentRole = currentRole;
    }
    
    public String getEducation() {
        return education;
    }
    
    public void setEducation(String education) {
        this.education = education;
    }
    
    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }
    
    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
    
    public BigDecimal getCurrentSalary() {
        return currentSalary;
    }
    
    public void setCurrentSalary(BigDecimal currentSalary) {
        this.currentSalary = currentSalary;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getIndustry() {
        return industry;
    }
    
    public void setIndustry(String industry) {
        this.industry = industry;
    }
    
    public String getCompanyName() {
        return companyName;
    }
    
    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
    
    public String getCompanySize() {
        return companySize;
    }
    
    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }
    
    public List<String> getSkills() {
        return skills;
    }
    
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    
    public List<String> getCertifications() {
        return certifications;
    }
    
    public void setCertifications(List<String> certifications) {
        this.certifications = certifications;
    }
    
    public List<String> getLanguages() {
        return languages;
    }
    
    public void setLanguages(List<String> languages) {
        this.languages = languages;
    }
    
    public List<String> getPortfolioProjects() {
        return portfolioProjects;
    }
    
    public void setPortfolioProjects(List<String> portfolioProjects) {
        this.portfolioProjects = portfolioProjects;
    }
    
    public WorkEnvironment getWorkEnvironment() {
        return workEnvironment;
    }
    
    public void setWorkEnvironment(WorkEnvironment workEnvironment) {
        this.workEnvironment = workEnvironment;
    }
    
    public BigDecimal getPreferredSalaryMin() {
        return preferredSalaryMin;
    }
    
    public void setPreferredSalaryMin(BigDecimal preferredSalaryMin) {
        this.preferredSalaryMin = preferredSalaryMin;
    }
    
    public BigDecimal getPreferredSalaryMax() {
        return preferredSalaryMax;
    }
    
    public void setPreferredSalaryMax(BigDecimal preferredSalaryMax) {
        this.preferredSalaryMax = preferredSalaryMax;
    }
    
    public List<String> getPreferredLocations() {
        return preferredLocations;
    }
    
    public void setPreferredLocations(List<String> preferredLocations) {
        this.preferredLocations = preferredLocations;
    }
    
    public List<String> getPreferredIndustries() {
        return preferredIndustries;
    }
    
    public void setPreferredIndustries(List<String> preferredIndustries) {
        this.preferredIndustries = preferredIndustries;
    }
    
    public LearningStyle getLearningStyle() {
        return learningStyle;
    }
    
    public void setLearningStyle(LearningStyle learningStyle) {
        this.learningStyle = learningStyle;
    }
    
    public RiskTolerance getRiskTolerance() {
        return riskTolerance;
    }
    
    public void setRiskTolerance(RiskTolerance riskTolerance) {
        this.riskTolerance = riskTolerance;
    }
    
    public String getCareerGoals() {
        return careerGoals;
    }
    
    public void setCareerGoals(String careerGoals) {
        this.careerGoals = careerGoals;
    }
    
    public List<String> getStrengths() {
        return strengths;
    }
    
    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }
    
    public List<String> getWeaknesses() {
        return weaknesses;
    }
    
    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }
    
    public Boolean getWillingToRelocate() {
        return willingToRelocate;
    }
    
    public void setWillingToRelocate(Boolean willingToRelocate) {
        this.willingToRelocate = willingToRelocate;
    }
    
    public String getAvailabilityToStart() {
        return availabilityToStart;
    }
    
    public void setAvailabilityToStart(String availabilityToStart) {
        this.availabilityToStart = availabilityToStart;
    }
    
    public String getBio() {
        return bio;
    }
    
    public void setBio(String bio) {
        this.bio = bio;
    }
    
    public String getLinkedinUrl() {
        return linkedinUrl;
    }
    
    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
    
    public String getGithubUrl() {
        return githubUrl;
    }
    
    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }
    
    public String getPortfolioUrl() {
        return portfolioUrl;
    }
    
    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }
    
    public String getResumeUrl() {
        return resumeUrl;
    }
    
    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
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
    
    public Boolean getIsPublic() {
        return isPublic;
    }
    
    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
    public Integer getProfileCompletionPercentage() {
        return profileCompletionPercentage;
    }
    
    public void setProfileCompletionPercentage(Integer profileCompletionPercentage) {
        this.profileCompletionPercentage = profileCompletionPercentage;
    }
} 