package com.careeros.backend.controller;

import com.careeros.backend.model.CandidateSubmission;
import com.careeros.backend.payload.request.CandidateApplicationRequest;
import com.careeros.backend.payload.response.CandidateSubmissionResponse;
import com.careeros.backend.payload.response.JobLearningPathResponse;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.CandidateApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CandidateApplicationController {
    
    private final CandidateApplicationService candidateApplicationService;
    
    public CandidateApplicationController(CandidateApplicationService candidateApplicationService) {
        this.candidateApplicationService = candidateApplicationService;
    }
    
    /**
     * Apply for a job (Candidates)
     */
    @PostMapping
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('USER')")
    public ResponseEntity<?> applyForJob(
            @Valid @RequestBody CandidateApplicationRequest applicationRequest,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CandidateSubmissionResponse response = candidateApplicationService.applyForJob(
                userDetails.getId(), 
                applicationRequest
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Get candidate's applications
     */
    @GetMapping("/candidate")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('USER')")
    public ResponseEntity<List<CandidateSubmissionResponse>> getCandidateApplications(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<CandidateSubmissionResponse> applications = candidateApplicationService
            .getCandidateApplications(userDetails.getId());
        return ResponseEntity.ok(applications);
    }
    
    /**
     * Get candidate's learning path for a specific application
     */
    @GetMapping("/candidate/{submissionId}/learning-path")
    @PreAuthorize("hasRole('CANDIDATE') or hasRole('USER')")
    public ResponseEntity<?> getCandidateLearningPath(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            JobLearningPathResponse response = candidateApplicationService
                .getCandidateLearningPath(submissionId, userDetails.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Get candidates for a specific job (Recruiters)
     */
    @GetMapping("/recruiter/job/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<CandidateSubmissionResponse>> getCandidatesForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<CandidateSubmissionResponse> candidates = candidateApplicationService
            .getCandidatesForJob(jobId, userDetails.getId());
        return ResponseEntity.ok(candidates);
    }
    
    /**
     * Get all candidates for recruiter (across all jobs)
     */
    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<CandidateSubmissionResponse>> getAllCandidatesForRecruiter(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<CandidateSubmissionResponse> candidates = candidateApplicationService
            .getAllCandidatesForRecruiter(userDetails.getId());
        return ResponseEntity.ok(candidates);
    }
    
    /**
     * Get qualified candidates for a job (completed learning path)
     */
    @GetMapping("/recruiter/job/{jobId}/qualified")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<List<CandidateSubmissionResponse>> getQualifiedCandidatesForJob(
            @PathVariable Long jobId) {
        List<CandidateSubmissionResponse> candidates = candidateApplicationService
            .getQualifiedCandidatesForJob(jobId);
        return ResponseEntity.ok(candidates);
    }
    
    /**
     * Update application status (Recruiters)
     */
    @PatchMapping("/recruiter/{submissionId}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long submissionId,
            @RequestParam CandidateSubmission.ApplicationStatus status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CandidateSubmissionResponse response = candidateApplicationService
                .updateApplicationStatus(submissionId, userDetails.getId(), status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    /**
     * Add recruiter feedback (Recruiters)
     */
    @PatchMapping("/recruiter/{submissionId}/feedback")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> addRecruiterFeedback(
            @PathVariable Long submissionId,
            @RequestParam String feedback,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            CandidateSubmissionResponse response = candidateApplicationService
                .addRecruiterFeedback(submissionId, userDetails.getId(), feedback);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}