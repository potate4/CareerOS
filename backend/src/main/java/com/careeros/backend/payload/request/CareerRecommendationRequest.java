package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public class CareerRecommendationRequest {
    @NotNull
    private Integer userId;
    
    @NotEmpty
    private List<String> skills;
    
    @NotNull
    @Min(0)
    private Integer experienceYears;
    
    @NotEmpty
    private List<String> interests;
    
    private String location;
    
    public CareerRecommendationRequest() {}
    
    public CareerRecommendationRequest(Integer userId, List<String> skills, Integer experienceYears, List<String> interests) {
        this.userId = userId;
        this.skills = skills;
        this.experienceYears = experienceYears;
        this.interests = interests;
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public List<String> getSkills() {
        return skills;
    }
    
    public void setSkills(List<String> skills) {
        this.skills = skills;
    }
    
    public Integer getExperienceYears() {
        return experienceYears;
    }
    
    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }
    
    public List<String> getInterests() {
        return interests;
    }
    
    public void setInterests(List<String> interests) {
        this.interests = interests;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
} 