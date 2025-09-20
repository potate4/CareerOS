package com.careeros.backend.payload.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class FuturecastRequest {
    
    @NotBlank(message = "Career goal is required")
    private String careerGoal;
    
    @NotNull(message = "Timeline in years is required")
    @Min(value = 1, message = "Timeline must be at least 1 year")
    @Max(value = 20, message = "Timeline cannot exceed 20 years")
    private Integer timelineYears;
    
    // Store as flexible JSON objects to avoid field-level validation
    private Map<String, Object> preferences;
    private Map<String, Object> userProfile;
    private Map<String, Object> marketData;
    
    private Integer userId;
    
    // Constructors
    public FuturecastRequest() {}
    
    public FuturecastRequest(String careerGoal, Integer timelineYears) {
        this.careerGoal = careerGoal;
        this.timelineYears = timelineYears;
    }
    
    // Getters and Setters
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public Integer getTimelineYears() {
        return timelineYears;
    }
    
    public void setTimelineYears(Integer timelineYears) {
        this.timelineYears = timelineYears;
    }
    
    public Map<String, Object> getPreferences() {
        return preferences;
    }
    
    public void setPreferences(Map<String, Object> preferences) {
        this.preferences = preferences;
    }
    
    public Map<String, Object> getUserProfile() {
        return userProfile;
    }
    
    public void setUserProfile(Map<String, Object> userProfile) {
        this.userProfile = userProfile;
    }
    
    public Map<String, Object> getMarketData() {
        return marketData;
    }
    
    public void setMarketData(Map<String, Object> marketData) {
        this.marketData = marketData;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
} 