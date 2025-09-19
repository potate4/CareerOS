package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.CandidateApplicationRequest;
import com.careeros.backend.payload.response.CandidateSubmissionResponse;
import com.careeros.backend.payload.response.JobLearningPathResponse;
import com.careeros.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CandidateApplicationService {
    
    private final CandidateSubmissionRepository candidateSubmissionRepository;
    private final JobPostingRepository jobPostingRepository;
    private final JobLearningPathRepository jobLearningPathRepository;
    private final JobLearningModuleRepository jobLearningModuleRepository;
    private final CandidateLearningProgressRepository candidateLearningProgressRepository;
    private final CandidateModuleProgressRepository candidateModuleProgressRepository;
    private final JobAssessmentRepository jobAssessmentRepository;
    private final UserRepository userRepository;
    
    public CandidateApplicationService(
            CandidateSubmissionRepository candidateSubmissionRepository,
            JobPostingRepository jobPostingRepository,
            JobLearningPathRepository jobLearningPathRepository,
            JobLearningModuleRepository jobLearningModuleRepository,
            CandidateLearningProgressRepository candidateLearningProgressRepository,
            CandidateModuleProgressRepository candidateModuleProgressRepository,
            JobAssessmentRepository jobAssessmentRepository,
            UserRepository userRepository) {
        this.candidateSubmissionRepository = candidateSubmissionRepository;
        this.jobPostingRepository = jobPostingRepository;
        this.jobLearningPathRepository = jobLearningPathRepository;
        this.jobLearningModuleRepository = jobLearningModuleRepository;
        this.candidateLearningProgressRepository = candidateLearningProgressRepository;
        this.candidateModuleProgressRepository = candidateModuleProgressRepository;
        this.jobAssessmentRepository = jobAssessmentRepository;
        this.userRepository = userRepository;
    }
    
    /**
     * Apply for a job posting
     */
    public CandidateSubmissionResponse applyForJob(Long candidateId, CandidateApplicationRequest request) {
        try {
            User candidate = userRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
            
            JobPosting jobPosting = jobPostingRepository.findById(request.getJobPostingId())
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
            
            if (!jobPosting.getIsActive()) {
                throw new RuntimeException("Job posting is not active");
            }
            
            // Check if candidate has already applied
            Optional<CandidateSubmission> existingSubmission = candidateSubmissionRepository
                .findByJobPostingIdAndCandidateId(request.getJobPostingId(), candidateId);
            
            if (existingSubmission.isPresent()) {
                throw new RuntimeException("You have already applied for this job");
            }
            
            // Create candidate submission
            CandidateSubmission submission = new CandidateSubmission(jobPosting, candidate);
            submission.setNotes(request.getNotes());
            submission.setApplicationStatus(CandidateSubmission.ApplicationStatus.APPLIED);
            
            // Count available assessments
            Long totalAssessments = jobAssessmentRepository.countActiveAssessmentsByJobPostingId(jobPosting.getId());
            submission.setTotalAssessments(totalAssessments.intValue());
            
            submission = candidateSubmissionRepository.save(submission);
            
            // Initialize learning progress if job has learning path
            JobLearningPath jobLearningPath = jobLearningPathRepository.findByJobPostingId(jobPosting.getId()).orElse(null);
            if (jobLearningPath != null) {
                initializeCandidateLearningProgress(submission, jobLearningPath);
                submission.setApplicationStatus(CandidateSubmission.ApplicationStatus.LEARNING_PHASE);
                submission = candidateSubmissionRepository.save(submission);
            }
            
            System.out.println("✅ Candidate " + candidate.getEmail() + " applied for job: " + jobPosting.getJobTitle());
            
            return new CandidateSubmissionResponse(submission);
            
        } catch (Exception e) {
            System.err.println("❌ Error in job application: " + e.getMessage());
            throw new RuntimeException("Failed to apply for job: " + e.getMessage());
        }
    }
    
    /**
     * Initialize candidate learning progress for job learning path
     */
    private void initializeCandidateLearningProgress(CandidateSubmission submission, JobLearningPath jobLearningPath) {
        try {
            CandidateLearningProgress learningProgress = new CandidateLearningProgress(submission, jobLearningPath);
            learningProgress = candidateLearningProgressRepository.save(learningProgress);
            
            // Initialize module progress for each module
            List<JobLearningModule> modules = jobLearningModuleRepository.findByJobLearningPathIdOrderByOrderIndex(jobLearningPath.getId());
            List<CandidateModuleProgress> moduleProgresses = new ArrayList<>();
            
            for (JobLearningModule module : modules) {
                CandidateModuleProgress moduleProgress = new CandidateModuleProgress(learningProgress, module);
                moduleProgresses.add(moduleProgress);
            }
            
            candidateModuleProgressRepository.saveAll(moduleProgresses);
            learningProgress.setModuleProgresses(moduleProgresses);
            submission.setLearningProgress(learningProgress);
            
            System.out.println("✅ Learning progress initialized with " + modules.size() + " modules");
            
        } catch (Exception e) {
            System.err.println("❌ Error initializing learning progress: " + e.getMessage());
        }
    }
    
    /**
     * Get candidate's applications
     */
    public List<CandidateSubmissionResponse> getCandidateApplications(Long candidateId) {
        List<CandidateSubmission> submissions = candidateSubmissionRepository.findByCandidateIdOrderBySubmittedAtDesc(candidateId);
        return submissions.stream()
                .map(CandidateSubmissionResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get candidates for a specific job posting (for recruiters)
     */
    public List<CandidateSubmissionResponse> getCandidatesForJob(Long jobId, Long recruiterId) {
        List<CandidateSubmission> submissions = candidateSubmissionRepository.findByJobPostingIdAndRecruiterIdOrderBySubmittedAtDesc(jobId, recruiterId);
        return submissions.stream()
                .map(CandidateSubmissionResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get all candidates for a recruiter across all jobs
     */
    public List<CandidateSubmissionResponse> getAllCandidatesForRecruiter(Long recruiterId) {
        List<CandidateSubmission> submissions = candidateSubmissionRepository.findByRecruiterIdOrderBySubmittedAtDesc(recruiterId);
        return submissions.stream()
                .map(CandidateSubmissionResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get qualified candidates (completed learning path) for a job
     */
    public List<CandidateSubmissionResponse> getQualifiedCandidatesForJob(Long jobId) {
        List<CandidateSubmission> submissions = candidateSubmissionRepository.findQualifiedCandidatesByJobPostingIdOrderByScoreDesc(jobId);
        return submissions.stream()
                .map(CandidateSubmissionResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Update candidate application status
     */
    public CandidateSubmissionResponse updateApplicationStatus(Long submissionId, Long recruiterId, CandidateSubmission.ApplicationStatus status) {
        CandidateSubmission submission = candidateSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Candidate submission not found"));
        
        // Verify recruiter access
        if (!submission.getJobPosting().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Access denied");
        }
        
        submission.setApplicationStatus(status);
        submission = candidateSubmissionRepository.save(submission);
        
        return new CandidateSubmissionResponse(submission);
    }
    
    /**
     * Add recruiter feedback to candidate application
     */
    public CandidateSubmissionResponse addRecruiterFeedback(Long submissionId, Long recruiterId, String feedback) {
        CandidateSubmission submission = candidateSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Candidate submission not found"));
        
        // Verify recruiter access
        if (!submission.getJobPosting().getRecruiter().getId().equals(recruiterId)) {
            throw new RuntimeException("Access denied");
        }
        
        submission.setRecruiterFeedback(feedback);
        submission = candidateSubmissionRepository.save(submission);
        
        return new CandidateSubmissionResponse(submission);
    }
    
    /**
     * Get candidate learning path for a specific job application
     */
    public JobLearningPathResponse getCandidateLearningPath(Long submissionId, Long candidateId) {
        CandidateSubmission submission = candidateSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Candidate submission not found"));
        
        // Verify candidate access
        if (!submission.getCandidate().getId().equals(candidateId)) {
            throw new RuntimeException("Access denied");
        }
        
        JobLearningPath learningPath = jobLearningPathRepository.findByJobPostingId(submission.getJobPosting().getId())
                .orElseThrow(() -> new RuntimeException("Learning path not found"));
        
        return new JobLearningPathResponse(learningPath);
    }
}