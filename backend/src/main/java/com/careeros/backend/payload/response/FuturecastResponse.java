package com.careeros.backend.payload.response;

import java.time.LocalDateTime;
import java.util.Map;

public class FuturecastResponse {
    
    private Map<String, Object> roadmap;
    private String explanation;
    private Double confidence;
    private LocalDateTime lastUpdated;
    private String roadmapId;
    
    // Constructors
    public FuturecastResponse() {}
    
    public FuturecastResponse(Map<String, Object> roadmap, String explanation) {
        this.roadmap = roadmap;
        this.explanation = explanation;
    }
    
    // Getters and Setters
    public Map<String, Object> getRoadmap() {
        return roadmap;
    }
    
    public void setRoadmap(Map<String, Object> roadmap) {
        this.roadmap = roadmap;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public String getRoadmapId() {
        return roadmapId;
    }
    
    public void setRoadmapId(String roadmapId) {
        this.roadmapId = roadmapId;
    }
} 