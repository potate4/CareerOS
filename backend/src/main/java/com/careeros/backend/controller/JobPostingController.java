package com.careeros.backend.controller;

import com.careeros.backend.payload.request.JobPostingRequest;
import com.careeros.backend.payload.response.JobPostingResponse;
import com.careeros.backend.payload.response.JobLearningPathResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.JobPostingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JobPostingController {
    
    private final JobPostingService jobPostingService;
    
    public JobPostingController(JobPostingService jobPostingService) {
        this.jobPostingService = jobPostingService;
    }
    
    /**
     * Create a new job posting (Recruiters only)
     */
    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJobPosting(
            @Valid @RequestBody JobPostingRequest jobPostingRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("🔥 Creating job posting for user: " + userDetails.getUsername());
            System.out.println("🔥 Request data: " + jobPostingRequest.getJobTitle() + " at " + jobPostingRequest.getCompany());
            JobPostingResponse response = jobPostingService.createJobPosting(userDetails.getId(), jobPostingRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Controller error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Get all job postings for the authenticated recruiter
     */
    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<JobPostingResponse>> getRecruiterJobPostings(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<JobPostingResponse> jobPostings = jobPostingService.getJobPostingsForRecruiter(userDetails.getId());
        return ResponseEntity.ok(jobPostings);
    }
    
    /**
     * Get a specific job posting for the authenticated recruiter
     */
    @GetMapping("/recruiter/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getRecruiterJobPosting(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            JobPostingResponse response = jobPostingService.getJobPosting(jobId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Update a job posting
     */
    @PutMapping("/recruiter/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateJobPosting(
            @PathVariable Long jobId,
            @Valid @RequestBody JobPostingRequest jobPostingRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            JobPostingResponse response = jobPostingService.updateJobPosting(jobId, userDetails.getId(), jobPostingRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Toggle job posting active status
     */
    @PatchMapping("/recruiter/{jobId}/toggle-status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> toggleJobPostingStatus(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            JobPostingResponse response = jobPostingService.toggleJobPostingStatus(jobId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Get learning path for a job posting
     */
    @GetMapping("/recruiter/{jobId}/learning-path")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getJobLearningPath(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            JobLearningPathResponse response = jobPostingService.getJobLearningPath(jobId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Get all active job postings (Public - for candidates)
     */
    @GetMapping("/public")
    public ResponseEntity<List<JobPostingResponse>> getAllActiveJobPostings() {
        List<JobPostingResponse> jobPostings = jobPostingService.getAllActiveJobPostings();
        return ResponseEntity.ok(jobPostings);
    }
    
    /**
     * Search job postings by keyword (Public - for candidates)
     */
    @GetMapping("/public/search")
    public ResponseEntity<List<JobPostingResponse>> searchJobPostings(
            @RequestParam(required = false, defaultValue = "") String keyword) {
        List<JobPostingResponse> jobPostings = jobPostingService.searchJobPostings(keyword);
        return ResponseEntity.ok(jobPostings);
    }
    
    /**
     * Get a specific job posting (Public - for candidates)
     */
    @GetMapping("/public/{jobId}")
    public ResponseEntity<?> getPublicJobPosting(@PathVariable Long jobId) {
        try {
            // For public access, we'll create a simplified method in the service
            List<JobPostingResponse> allJobs = jobPostingService.getAllActiveJobPostings();
            JobPostingResponse job = allJobs.stream()
                    .filter(j -> j.getId().equals(jobId))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Job posting not found or not active"));
            
            return ResponseEntity.ok(job);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Analyze job description using AI (for recruiter job posting form)
     */
    @PostMapping("/ai-analyze")
    @PreAuthorize("hasRole('USER') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> analyzeJobWithAI(
            @RequestBody String jobDescription,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("🔥 [CONTROLLER] AI analysis requested by: " + userDetails.getUsername());
            System.out.println("🔥 [CONTROLLER] Request body length: " + (jobDescription != null ? jobDescription.length() : "null"));
            System.out.println("🔥 [CONTROLLER] Request content preview: " + (jobDescription != null ? jobDescription.substring(0, Math.min(100, jobDescription.length())) : "null"));

            if (jobDescription == null || jobDescription.trim().isEmpty()) {
                System.err.println("❌ [CONTROLLER] Empty job description received");
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Job description cannot be empty"));
            }

            System.out.println("🔥 [CONTROLLER] Calling service layer...");
            JsonNode aiResponse = jobPostingService.analyzeJobDescriptionWithAI(jobDescription);

            System.out.println("🔥 [CONTROLLER] Service response received: " + (aiResponse != null ? "SUCCESS" : "NULL"));
            if (aiResponse != null) {
                System.out.println("🔥 [CONTROLLER] Response size: " + aiResponse.toString().length());
                System.out.println("🔥 [CONTROLLER] Response preview: " + aiResponse.toString().substring(0, Math.min(200, aiResponse.toString().length())));
            }

            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            System.err.println("❌ [CONTROLLER] AI analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("AI analysis failed: " + e.getMessage()));
        }
    }
}