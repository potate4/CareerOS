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
import java.util.HashMap;
import java.util.stream.Collectors;

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
     * Generate AI learning path
     */
    public Map<String, Object> generateAILearningPath(Map<String, Object> request) {
        try {
            String url = aiServiceUrl + "/generate-learning-path";
            logger.info("Calling AI service for learning path generation: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("AI learning path generated successfully");
            return response.getBody();
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service error: {}", e.getMessage());
            throw new RuntimeException("AI learning path generation failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable");
        }
    }
    
    /**
     * Analyze content using AI services
     */
    public AIAnalysisResponse analyzeContent(AIAnalysisRequest request) {
        try {
            String url = aiServiceUrl + "/generate-learning-path";
            logger.info("Calling AI service for content analysis: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            // Convert to AI learning path request format
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("userId", request.getUserId());
            aiRequest.put("username", "user" + request.getUserId());
            aiRequest.put("careerGoal", request.getContent());
            aiRequest.put("currentSkills", new HashMap<String, Double>());
            aiRequest.put("experienceLevel", "BEGINNER");
            aiRequest.put("learningPace", "MODERATE");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("AI analysis completed successfully for user: {}", request.getUserId());
            
            // Convert response to AIAnalysisResponse
            AIAnalysisResponse aiResponse = new AIAnalysisResponse();
            aiResponse.setAnalysisId("ai-" + System.currentTimeMillis());
            aiResponse.setUserId(request.getUserId());
            aiResponse.setContent(request.getContent());
            aiResponse.setAnalysisType("learning_path_generation");
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Learning path generated successfully");
            result.put("aiResponse", response.getBody());
            aiResponse.setResult(result);
            aiResponse.setConfidenceScore(0.95);
            aiResponse.setCreatedAt(java.time.LocalDateTime.now());
            aiResponse.setStatus("completed");
            
            return aiResponse;
            
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
            String url = aiServiceUrl + "/generate-learning-path";
            logger.info("Calling AI service for career recommendations: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            // Convert to AI learning path request format
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("userId", request.getUserId());
            aiRequest.put("username", "user" + request.getUserId());
            aiRequest.put("careerGoal", String.join(", ", request.getInterests()));
            
            // Convert skills list to map with default mastery level
            Map<String, Double> skillsMap = request.getSkills().stream()
                .collect(Collectors.toMap(skill -> skill, skill -> 0.5));
            aiRequest.put("currentSkills", skillsMap);
            
            String experienceLevel = request.getExperienceYears() > 5 ? "EXPERT" : 
                                   request.getExperienceYears() > 2 ? "INTERMEDIATE" : "BEGINNER";
            aiRequest.put("experienceLevel", experienceLevel);
            aiRequest.put("learningPace", "MODERATE");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("Career recommendations generated successfully for user: {}", request.getUserId());
            
            // Convert response to CareerRecommendationResponse
            CareerRecommendationResponse careerResponse = new CareerRecommendationResponse();
            careerResponse.setRecommendationId("career-" + System.currentTimeMillis());
            careerResponse.setUserId(request.getUserId());
            
            Map<String, Object> recommendation = new HashMap<>();
            recommendation.put("title", "AI-generated learning path");
            recommendation.put("description", "Learning path created based on your skills and interests");
            careerResponse.setRecommendations(List.of(recommendation));
            careerResponse.setConfidenceScore(0.90);
            careerResponse.setCreatedAt(java.time.LocalDateTime.now());
            
            return careerResponse;
            
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
            String url = aiServiceUrl + "/health";
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