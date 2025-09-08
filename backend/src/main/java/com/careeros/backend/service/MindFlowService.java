package com.careeros.backend.service;

import com.careeros.backend.model.MindFlowJob;
import com.careeros.backend.model.FileUpload;
import com.careeros.backend.payload.request.MindFlowAnalysisRequest;
import com.careeros.backend.payload.request.MindFlowAnalysisCallbackRequest;
import com.careeros.backend.payload.response.MindFlowJobResponse;
import com.careeros.backend.payload.response.FileAnalysisResponse;
import com.careeros.backend.repository.MindFlowJobRepository;
import com.careeros.backend.service.FileUploadService;
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

    @Autowired
    private FileUploadService fileUploadService;

    private final RestTemplate restTemplate;

    public MindFlowService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MindFlowJobResponse createMindFlowJob(MindFlowAnalysisRequest request) {
        // Generate unique job ID
        String jobId = "mindflow_" + UUID.randomUUID().toString();
        
        logger.info("Creating MindFlow job: {} for user: {} with fileId: {}", 
            jobId, request.getUserId(), request.getFileId());
        
        // Create MindFlow job
        MindFlowJob job = new MindFlowJob(
            jobId,
            Long.parseLong(request.getUserId()),
            request.getVideoUrl(),
            "PENDING",
            request.getFileId(), // Use fileId from request
            request.getAnalysisType() != null ? request.getAnalysisType() : "comprehensive",
            request.getScenarioType() != null ? request.getScenarioType() : "GENERAL_COMMUNICATION"
        );
        
        MindFlowJob savedJob = mindFlowJobRepository.save(job);
        logger.info("MindFlow job saved with ID: {} and fileId: {}", jobId, savedJob.getFileId());
        
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
        try {
            logger.info("Received MindFlow analysis callback for job: {} with status: {}", 
                callbackRequest.getJobId(), callbackRequest.getStatus());
            
            MindFlowJob job = mindFlowJobRepository.findByJobId(callbackRequest.getJobId())
                    .orElseThrow(() -> new RuntimeException("MindFlow job not found: " + callbackRequest.getJobId()));
            
            logger.info("Found MindFlow job for fileId: {} with current status: {}", 
                job.getFileId(), job.getStatus());
                    
            job.setStatus(callbackRequest.getStatus());
            job.setUpdatedAt(java.time.LocalDateTime.now());
            
            if ("COMPLETED".equals(callbackRequest.getStatus())) {
                job.setDetailedAnalysis(callbackRequest.getAnalysisData());
                logger.info("MindFlow analysis completed successfully with {} characters of data", 
                    callbackRequest.getAnalysisData() != null ? callbackRequest.getAnalysisData().length() : 0);
            } else if ("FAILED".equals(callbackRequest.getStatus())) {
                job.setErrorMessage(callbackRequest.getErrorMessage());
                logger.error("MindFlow analysis failed with error: {}", callbackRequest.getErrorMessage());
            }
            
            MindFlowJob updatedJob = mindFlowJobRepository.save(job);
            logger.info("MindFlow job {} updated successfully -> status: {}", 
                callbackRequest.getJobId(), callbackRequest.getStatus());
            
            return toJobResponse(updatedJob);
            
        } catch (Exception e) {
            logger.error("Failed to handle MindFlow analysis callback: {}", e.getMessage());
            throw new RuntimeException("Failed to process MindFlow analysis callback: " + e.getMessage());
        }
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

    public java.util.List<FileAnalysisResponse> getFileAnalysisData(Long userId) {
        try {
            logger.info("Getting MindFlow file analysis data for user: {}", userId);
            
            // Get all files for the user with category 'mindflow-recording'
            java.util.List<FileUpload> files = fileUploadService.getUserFileUploads(userId);
            // Filter for MindFlow files
            files = files.stream()
                .filter(file -> file.getCategory() != null && file.getCategory().contains("mindflow"))
                .collect(Collectors.toList());
            logger.info("Found {} MindFlow files for user {}", files.size(), userId);
            
            // Get most recent jobs for each file
            java.util.List<MindFlowJob> mostRecentJobs = mindFlowJobRepository.findMostRecentJobsByUserId(userId);
            logger.info("Found {} most recent MindFlow jobs for user {}", mostRecentJobs.size(), userId);
            
            // Create a map of fileId to most recent job for quick lookup
            java.util.Map<Long, MindFlowJob> fileJobMap = mostRecentJobs.stream()
                .filter(job -> job.getFileId() != null)
                .collect(java.util.stream.Collectors.toMap(
                    MindFlowJob::getFileId,
                    job -> job,
                    (existing, replacement) -> existing // Keep first occurrence in case of duplicates
                ));
            
            // Build response list
            java.util.List<FileAnalysisResponse> responses = new java.util.ArrayList<>();
            
            for (FileUpload file : files) {
                MindFlowJob job = fileJobMap.get(file.getId());
                
                if (job != null) {
                    // File has analysis job
                    FileAnalysisResponse response = new FileAnalysisResponse(
                        file.getId(),
                        file.getFileName(),
                        file.getOriginalFileName(),
                        file.getFileUrl(),
                        file.getCategory(),
                        file.getUploadedAt(),
                        job.getJobId(),
                        job.getStatus(),
                        job.getAnalysisType(),
                        job.getDetailedAnalysis(),
                        job.getErrorMessage(),
                        job.getCreatedAt(),
                        job.getUpdatedAt()
                    );
                    responses.add(response);
                } else {
                    // File has no analysis job
                    FileAnalysisResponse response = new FileAnalysisResponse(
                        file.getId(),
                        file.getFileName(),
                        file.getOriginalFileName(),
                        file.getFileUrl(),
                        file.getCategory(),
                        file.getUploadedAt(),
                        null, // No job ID
                        "NO_ANALYSIS", // Status
                        null, // No analysis type
                        null, // No analysis data
                        null, // No error message
                        null, // No analysis created at
                        null  // No analysis updated at
                    );
                    responses.add(response);
                }
            }
            
            logger.info("Built {} MindFlow file analysis responses", responses.size());
            return responses;
            
        } catch (Exception e) {
            logger.error("Failed to get MindFlow file analysis data: {}", e.getMessage());
            throw new RuntimeException("Failed to get MindFlow file analysis data: " + e.getMessage());
        }
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
            restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
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