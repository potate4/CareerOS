package com.careeros.backend.service;

import com.careeros.backend.model.InterviewJob;
import com.careeros.backend.payload.request.InterviewAnalysisRequest;
import com.careeros.backend.payload.request.InterviewAnalysisAIRequest;
import com.careeros.backend.payload.request.InterviewAnalysisCallbackRequest;
import com.careeros.backend.payload.response.InterviewAnalysisResponse;
import com.careeros.backend.payload.response.InterviewJobResponse;
import com.careeros.backend.payload.response.InterviewJobDetailResponse;
import com.careeros.backend.repository.InterviewJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Autowired
    private InterviewJobRepository interviewJobRepository;
    
    public InterviewService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Create interview analysis job and forward to AI service
     */
    public InterviewJobResponse createInterviewJob(InterviewAnalysisRequest request) {
        try {
            // Generate unique job ID
            String jobId = UUID.randomUUID().toString();
            logger.info("Creating interview analysis job: {}", jobId);
            
            // Create and save interview job with PENDING status
            InterviewJob interviewJob = new InterviewJob(
                jobId,
                Long.parseLong(request.getUserId()),
                request.getVideoUrl(),
                "PENDING",
                request.getFileId(),
                request.getAnalysisType()
            );
            
            interviewJobRepository.save(interviewJob);
            logger.info("Interview job saved with ID: {}", jobId);
            
            // Forward request to Python AI backend
            String url = aiServiceUrl + "/api/v1/interview/analyze";
            logger.info("Forwarding request to AI service: {}", url);
            
            // Create AI request with jobId
            InterviewAnalysisAIRequest aiRequest = new InterviewAnalysisAIRequest(
                request.getVideoUrl(),
                request.getAnalysisType(),
                request.getUserId(),
                jobId,
                request.getFileId()
            );
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<InterviewAnalysisAIRequest> entity = new HttpEntity<>(aiRequest, headers);
            
            // Send request to AI service (this should be async in production)
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );
            
            logger.info("AI service acknowledged job: {}", jobId);
            
            // Return job response
            return new InterviewJobResponse(
                jobId,
                "PENDING",
                "Interview analysis job created successfully. Processing in background.",
                interviewJob.getCreatedAt(),
                LocalDateTime.now().plusMinutes(5)
            );
            
        } catch (Exception e) {
            logger.error("Failed to create interview job: {}", e.getMessage());
            throw new RuntimeException("Failed to create interview analysis job: " + e.getMessage());
        }
    }
    
    /**
     * Handle callback from Python AI backend with analysis results
     */
    public InterviewJobResponse handleAnalysisCallback(InterviewAnalysisCallbackRequest callbackRequest) {
        try {
            logger.info("Received analysis callback for job: {}", callbackRequest.getJobId());
            
            // Find the interview job
            InterviewJob interviewJob = interviewJobRepository.findByJobId(callbackRequest.getJobId())
                .orElseThrow(() -> new RuntimeException("Interview job not found: " + callbackRequest.getJobId()));
            
            // Update job with analysis results
            interviewJob.setStatus(callbackRequest.getStatus());
            interviewJob.setDetailedAnalysis(callbackRequest.getAnalysisData());
            
            if (callbackRequest.getErrorMessage() != null) {
                interviewJob.setErrorMessage(callbackRequest.getErrorMessage());
            }
            
            interviewJobRepository.save(interviewJob);
            
            logger.info("Interview job updated successfully: {}", callbackRequest.getJobId());
            
            return new InterviewJobResponse(
                interviewJob.getJobId(),
                interviewJob.getStatus(),
                "Analysis callback processed successfully",
                interviewJob.getCreatedAt(),
                interviewJob.getUpdatedAt()
            );
            
        } catch (Exception e) {
            logger.error("Failed to handle analysis callback: {}", e.getMessage());
            throw new RuntimeException("Failed to process analysis callback: " + e.getMessage());
        }
    }
    
    /**
     * Get interview job status by job ID
     */
    public InterviewJobResponse getJobStatus(String jobId) {
        try {
            InterviewJob interviewJob = interviewJobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Interview job not found: " + jobId));
            
            return new InterviewJobResponse(
                interviewJob.getJobId(),
                interviewJob.getStatus(),
                "Job status retrieved successfully",
                interviewJob.getCreatedAt(),
                interviewJob.getUpdatedAt()
            );
            
        } catch (Exception e) {
            logger.error("Failed to get job status: {}", e.getMessage());
            throw new RuntimeException("Failed to get job status: " + e.getMessage());
        }
    }
    
    /**
     * Get detailed interview job information by job ID
     */
    public InterviewJobDetailResponse getJobDetail(String jobId) {
        try {
            InterviewJob interviewJob = interviewJobRepository.findByJobId(jobId)
                .orElseThrow(() -> new RuntimeException("Interview job not found: " + jobId));
            
            return new InterviewJobDetailResponse(
                interviewJob.getJobId(),
                interviewJob.getStatus(),
                "Job details retrieved successfully",
                interviewJob.getCreatedAt(),
                interviewJob.getUpdatedAt(),
                interviewJob.getDetailedAnalysis(),
                interviewJob.getErrorMessage(),
                interviewJob.getAnalysisType(),
                interviewJob.getVideoUrl(),
                interviewJob.getFileId()
            );
            
        } catch (Exception e) {
            logger.error("Failed to get job details: {}", e.getMessage());
            throw new RuntimeException("Failed to get job details: " + e.getMessage());
        }
    }
    
    /**
     * Get all jobs for a user
     */
    public java.util.List<InterviewJobResponse> getUserJobs(Long userId) {
        try {
            java.util.List<InterviewJob> jobs = interviewJobRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            return jobs.stream()
                .map(job -> new InterviewJobResponse(
                    job.getJobId(),
                    job.getStatus(),
                    "Job retrieved successfully",
                    job.getCreatedAt(),
                    job.getUpdatedAt()
                ))
                .collect(java.util.stream.Collectors.toList());
            
        } catch (Exception e) {
            logger.error("Failed to get user jobs: {}", e.getMessage());
            throw new RuntimeException("Failed to get user jobs: " + e.getMessage());
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