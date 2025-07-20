package com.careeros.backend.service;

import com.careeros.backend.payload.request.InterviewAnalysisRequest;
import com.careeros.backend.payload.response.InterviewAnalysisResponse;
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

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class InterviewService {
    
    private static final Logger logger = LoggerFactory.getLogger(InterviewService.class);
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public InterviewService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Analyze interview video using AI services
     */
    public InterviewAnalysisResponse analyzeInterview(InterviewAnalysisRequest request) {
        try {
            String url = aiServiceUrl + "/api/v1/interview/analyze";
            logger.info("Calling AI service for interview analysis: {}", url);
            logger.info("Request payload: videoUrl={}, userId={}, analysisType={}", 
                       request.getVideoUrl(), request.getUserId(), request.getAnalysisType());
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<InterviewAnalysisRequest> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<InterviewAnalysisResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                InterviewAnalysisResponse.class
            );
            
            InterviewAnalysisResponse result = response.getBody();
            if (result != null) {
                // Set additional metadata if not provided by AI service
                if (result.getAnalysisId() == null) {
                    result.setAnalysisId(UUID.randomUUID().toString());
                }
                if (result.getCreatedAt() == null) {
                    result.setCreatedAt(LocalDateTime.now());
                }
                if (result.getStatus() == null) {
                    result.setStatus("completed");
                }
            }
            
            logger.info("Interview analysis completed successfully for user: {}", request.getUserId());
            return result;
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service error for interview analysis: {}", e.getMessage());
            throw new RuntimeException("Interview analysis failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling AI service for interview analysis: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable for interview analysis");
        }
    }
    
    /**
     * Check interview analysis service health
     */
    public Map<String, Object> checkInterviewServiceHealth() {
        try {
            String url = aiServiceUrl + "/api/v1/interview/health";
            logger.info("Checking interview analysis service health: {}", url);
            
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            logger.info("Interview analysis service health check successful");
            return response.getBody();
            
        } catch (Exception e) {
            logger.error("Interview analysis service health check failed: {}", e.getMessage());
            return Map.of(
                "status", "unhealthy",
                "service", "Interview Analysis Services",
                "error", e.getMessage()
            );
        }
    }
} 