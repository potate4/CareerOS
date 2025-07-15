package com.careeros.backend.service;

import com.careeros.backend.payload.request.AIAnalysisRequest;
import com.careeros.backend.payload.request.CareerRecommendationRequest;
import com.careeros.backend.payload.response.AIAnalysisResponse;
import com.careeros.backend.payload.response.CareerRecommendationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@Service
public class AIService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIService.class);
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public AIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Analyze content using AI services
     */
    public AIAnalysisResponse analyzeContent(AIAnalysisRequest request) {
        try {
            String url = aiServiceUrl + "/api/v1/ai/analyze";
            logger.info("Calling AI service for content analysis: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<AIAnalysisRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<AIAnalysisResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                AIAnalysisResponse.class
            );
            
            logger.info("AI analysis completed successfully for user: {}", request.getUserId());
            return response.getBody();
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service error: {}", e.getMessage());
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable");
        }
    }
    
    /**
     * Get career recommendations using AI
     */
    public CareerRecommendationResponse getCareerRecommendations(CareerRecommendationRequest request) {
        try {
            String url = aiServiceUrl + "/api/v1/ai/career-recommendations";
            logger.info("Calling AI service for career recommendations: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<CareerRecommendationRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<CareerRecommendationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                CareerRecommendationResponse.class
            );
            
            logger.info("Career recommendations generated successfully for user: {}", request.getUserId());
            return response.getBody();
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service error: {}", e.getMessage());
            throw new RuntimeException("Career recommendations failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable");
        }
    }
    
    /**
     * Check AI service health
     */
    public Map<String, Object> checkAIHealth() {
        try {
            String url = aiServiceUrl + "/api/v1/ai/health";
            logger.info("Checking AI service health: {}", url);
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            logger.info("AI service health check successful");
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("AI service health check failed: {}", e.getMessage());
            return Map.of(
                "status", "unhealthy",
                "service", "AI Services",
                "error", e.getMessage()
            );
        }
    }
} 