package com.careeros.backend.payload.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class CareerRecommendationResponse {
    private String recommendationId;
    private Integer userId;
    private List<Map<String, Object>> recommendations;
    private List<String> skillGaps;
    private List<Map<String, Object>> suggestedCourses;
    private Map<String, Object> marketTrends;
    private Double confidenceScore;
    private LocalDateTime createdAt;
    
    public CareerRecommendationResponse() {}
    
    public CareerRecommendationResponse(String recommendationId, Integer userId, List<Map<String, Object>> recommendations,
                                     List<String> skillGaps, List<Map<String, Object>> suggestedCourses,
                                     Map<String, Object> marketTrends, Double confidenceScore, LocalDateTime createdAt) {
        this.recommendationId = recommendationId;
        this.userId = userId;
        this.recommendations = recommendations;
        this.skillGaps = skillGaps;
        this.suggestedCourses = suggestedCourses;
        this.marketTrends = marketTrends;
        this.confidenceScore = confidenceScore;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public String getRecommendationId() {
        return recommendationId;
    }
    
    public void setRecommendationId(String recommendationId) {
        this.recommendationId = recommendationId;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public List<Map<String, Object>> getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(List<Map<String, Object>> recommendations) {
        this.recommendations = recommendations;
    }
    
    public List<String> getSkillGaps() {
        return skillGaps;
    }
    
    public void setSkillGaps(List<String> skillGaps) {
        this.skillGaps = skillGaps;
    }
    
    public List<Map<String, Object>> getSuggestedCourses() {
        return suggestedCourses;
    }
    
    public void setSuggestedCourses(List<Map<String, Object>> suggestedCourses) {
        this.suggestedCourses = suggestedCourses;
    }
    
    public Map<String, Object> getMarketTrends() {
        return marketTrends;
    }
    
    public void setMarketTrends(Map<String, Object> marketTrends) {
        this.marketTrends = marketTrends;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 