package com.careeros.backend.service;

import com.careeros.backend.model.MindFlowJob;
import com.careeros.backend.payload.request.MindFlowAnalysisRequest;
import com.careeros.backend.payload.request.MindFlowAnalysisCallbackRequest;
import com.careeros.backend.payload.response.MindFlowJobResponse;
import com.careeros.backend.repository.MindFlowJobRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MindFlowService {

    private static final Logger logger = LoggerFactory.getLogger(MindFlowService.class);

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Autowired
    private MindFlowJobRepository mindFlowJobRepository;

    private final RestTemplate restTemplate;

    public MindFlowService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MindFlowJobResponse createMindFlowJob(MindFlowAnalysisRequest request) {
        // Generate unique job ID
        String jobId = "mindflow_" + UUID.randomUUID().toString();
        
        // Create MindFlow job
        MindFlowJob job = new MindFlowJob(
            jobId,
            Long.parseLong(request.getUserId()),
            request.getVideoUrl(),
            "PENDING",
            null, // fileId will be set if needed
            request.getAnalysisType() != null ? request.getAnalysisType() : "comprehensive",
            request.getScenarioType() != null ? request.getScenarioType() : "GENERAL_COMMUNICATION"
        );
        
        MindFlowJob savedJob = mindFlowJobRepository.save(job);
        
        // Send to AI service
        try {
            sendToAIService(request, jobId);
            logger.info("MindFlow analysis request sent to AI service for job: {}", jobId);
        } catch (Exception e) {
            logger.error("Failed to send MindFlow analysis request to AI service: {}", e.getMessage());
            job.setStatus("FAILED");
            job.setErrorMessage("Failed to send to AI service: " + e.getMessage());
            mindFlowJobRepository.save(job);
        }
        
        return toJobResponse(savedJob);
    }

    public MindFlowJobResponse handleAnalysisCallback(MindFlowAnalysisCallbackRequest callbackRequest) {
        MindFlowJob job = mindFlowJobRepository.findByJobId(callbackRequest.getJobId())
                .orElseThrow(() -> new RuntimeException("MindFlow job not found: " + callbackRequest.getJobId()));
                
        job.setStatus(callbackRequest.getStatus());
        
        if ("COMPLETED".equals(callbackRequest.getStatus())) {
            job.setDetailedAnalysis(callbackRequest.getAnalysisData());
        } else if ("FAILED".equals(callbackRequest.getStatus())) {
            job.setErrorMessage(callbackRequest.getErrorMessage());
        }
        
        MindFlowJob updatedJob = mindFlowJobRepository.save(job);
        logger.info("MindFlow job {} updated with status: {}", callbackRequest.getJobId(), callbackRequest.getStatus());
        
        return toJobResponse(updatedJob);
    }

    public MindFlowJobResponse getJobStatus(String jobId) {
        MindFlowJob job = mindFlowJobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("MindFlow job not found: " + jobId));
        return toJobResponse(job);
    }

    public List<MindFlowJobResponse> getUserJobs(Long userId) {
        List<MindFlowJob> jobs = mindFlowJobRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return jobs.stream().map(this::toJobResponse).collect(Collectors.toList());
    }

    public Map<String, Object> checkMindFlowServiceHealth() {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            Map<String, Object> healthStatus = new HashMap<>();
            healthStatus.put("status", "healthy");
            healthStatus.put("service", "MindFlow Soft Skills Training Services");
            healthStatus.put("aiServiceUrl", aiServiceUrl);
            healthStatus.put("aiServiceResponse", response.getBody());
            
            return healthStatus;
        } catch (Exception e) {
            logger.error("MindFlow service health check failed: {}", e.getMessage());
            throw new RuntimeException("MindFlow service health check failed: " + e.getMessage());
        }
    }

    private void sendToAIService(MindFlowAnalysisRequest request, String jobId) {
        String url = aiServiceUrl + "/api/v1/mindflow/analyze";
        
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("jobId", jobId);
        aiRequest.put("videoUrl", request.getVideoUrl());
        aiRequest.put("analysisType", request.getAnalysisType());
        aiRequest.put("userId", Integer.parseInt(request.getUserId()));
        aiRequest.put("scenarioType", request.getScenarioType());
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
        
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            logger.info("MindFlow analysis request sent successfully for job: {}", jobId);
        } catch (Exception e) {
            logger.error("Failed to send MindFlow analysis request: {}", e.getMessage());
            throw e;
        }
    }

    private MindFlowJobResponse toJobResponse(MindFlowJob job) {
        LocalDateTime estimatedCompletion = job.getCreatedAt().plusMinutes(5); // Estimated 5 minutes
        
        return new MindFlowJobResponse(
                job.getJobId(),
                job.getUserId(),
                job.getVideoUrl(),
                job.getStatus(),
                job.getFileId(),
                job.getAnalysisType(),
                job.getScenarioType(),
                job.getErrorMessage(),
                job.getCreatedAt(),
                job.getUpdatedAt(),
                estimatedCompletion
        );
    }
}