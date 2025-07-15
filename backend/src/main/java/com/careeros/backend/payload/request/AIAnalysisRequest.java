package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;

public class AIAnalysisRequest {
    @NotNull
    private Integer userId;
    
    @NotBlank
    private String content;
    
    private String analysisType = "general";
    
    private Map<String, Object> parameters;
    
    public AIAnalysisRequest() {}
    
    public AIAnalysisRequest(Integer userId, String content, String analysisType) {
        this.userId = userId;
        this.content = content;
        this.analysisType = analysisType;
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public Map<String, Object> getParameters() {
        return parameters;
    }
    
    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }
} 