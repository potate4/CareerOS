package com.careeros.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "ai")
public class AIConfig {
    
    private String serviceUrl;
    private OpenAI openai = new OpenAI();
    private String primary;
    private Fallback fallback = new Fallback();
    
    // Getters and Setters
    public String getServiceUrl() {
        return serviceUrl;
    }
    
    public void setServiceUrl(String serviceUrl) {
        this.serviceUrl = serviceUrl;
    }
    
    public OpenAI getOpenai() {
        return openai;
    }
    
    public void setOpenai(OpenAI openai) {
        this.openai = openai;
    }
    
    public String getPrimary() {
        return primary;
    }
    
    public void setPrimary(String primary) {
        this.primary = primary;
    }
    
    public Fallback getFallback() {
        return fallback;
    }
    
    public void setFallback(Fallback fallback) {
        this.fallback = fallback;
    }
    
    public static class OpenAI {
        private String apiKey;
        private String model;
        private int maxTokens;
        private double temperature;
        
        // Getters and Setters
        public String getApiKey() {
            return apiKey;
        }
        
        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
        
        public String getModel() {
            return model;
        }
        
        public void setModel(String model) {
            this.model = model;
        }
        
        public int getMaxTokens() {
            return maxTokens;
        }
        
        public void setMaxTokens(int maxTokens) {
            this.maxTokens = maxTokens;
        }
        
        public double getTemperature() {
            return temperature;
        }
        
        public void setTemperature(double temperature) {
            this.temperature = temperature;
        }
    }
    
    public static class Fallback {
        private boolean enabled;
        private String type;
        
        // Getters and Setters
        public boolean isEnabled() {
            return enabled;
        }
        
        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
    }
}
