package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.JobPostingRequest;
import com.careeros.backend.payload.response.JobPostingResponse;
import com.careeros.backend.payload.response.JobLearningPathResponse;
import com.careeros.backend.payload.response.AILearningPathResponse;
import com.careeros.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.*;
import java.util.stream.Collectors;
import java.time.Duration;

@Service
@Transactional
public class JobPostingService {
    
    private final JobPostingRepository jobPostingRepository;
    private final JobLearningPathRepository jobLearningPathRepository;
    private final JobLearningModuleRepository jobLearningModuleRepository;
    private final JobAssessmentRepository jobAssessmentRepository;
    private final CandidateSubmissionRepository candidateSubmissionRepository;
    private final UserRepository userRepository;
    private final String aiServiceUrl;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public JobPostingService(
            JobPostingRepository jobPostingRepository,
            JobLearningPathRepository jobLearningPathRepository,
            JobLearningModuleRepository jobLearningModuleRepository,
            JobAssessmentRepository jobAssessmentRepository,
            CandidateSubmissionRepository candidateSubmissionRepository,
            UserRepository userRepository,
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobLearningPathRepository = jobLearningPathRepository;
        this.jobLearningModuleRepository = jobLearningModuleRepository;
        this.jobAssessmentRepository = jobAssessmentRepository;
        this.candidateSubmissionRepository = candidateSubmissionRepository;
        this.userRepository = userRepository;
        this.aiServiceUrl = aiServiceUrl;
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Create a new job posting with optional AI-generated learning path and assessment
     */
    public JobPostingResponse createJobPosting(Long recruiterId, JobPostingRequest request) {
        try {
            User recruiter = userRepository.findById(recruiterId)
                .orElseThrow(() -> new RuntimeException("Recruiter not found"));
            
            // Verify recruiter role
            if (!recruiter.getRoles().contains(Role.ROLE_RECRUITER)) {
                throw new RuntimeException("User does not have recruiter role");
            }
            
            // Create job posting
            JobPosting jobPosting = new JobPosting(
                recruiter,
                request.getJobTitle(),
                request.getCompany(),
                request.getJobDescription()
            );
            
            jobPosting.setRequiredSkills(request.getRequiredSkills());
            jobPosting.setExperienceLevel(request.getExperienceLevel());
            jobPosting.setLocation(request.getLocation());
            jobPosting.setJobType(request.getJobType());
            jobPosting.setSalaryRange(request.getSalaryRange());
            
            jobPosting = jobPostingRepository.save(jobPosting);
            
            // Generate learning path if requested
            if (request.getGenerateLearningPath()) {
                try {
                    generateJobLearningPath(jobPosting, request);
                } catch (Exception e) {
                    System.err.println("❌ Error generating learning path: " + e.getMessage());
                }
            }
            
            // TODO: Generate assessment if requested (will be implemented next)
            
            return new JobPostingResponse(jobPosting);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating job posting: " + e.getMessage());
            throw new RuntimeException("Failed to create job posting: " + e.getMessage());
        }
    }
    
    /**
     * Generate learning path for a job posting using AI
     */
    private void generateJobLearningPath(JobPosting jobPosting, JobPostingRequest request) {
        try {
            System.out.println("🤖 Generating learning path for job posting: " + jobPosting.getJobTitle());
            
            // Call AI service to generate learning path modules
            AILearningPathResponse aiResponse = callAIJobLearningPathGeneration(jobPosting, request);
            
            if (aiResponse != null && aiResponse.getModules() != null && !aiResponse.getModules().isEmpty()) {
                createJobLearningPathFromAIResponse(jobPosting, aiResponse);
            } else {
                System.out.println("⚠️ AI service unavailable, creating fallback learning path");
                createFallbackJobLearningPath(jobPosting);
            }
        } catch (Exception e) {
            System.err.println("❌ Error generating learning path: " + e.getMessage());
            createFallbackJobLearningPath(jobPosting);
        }
    }
    
    /**
     * Call AI service to generate job-specific learning path
     */
    private AILearningPathResponse callAIJobLearningPathGeneration(JobPosting jobPosting, JobPostingRequest request) {
        try {
            String jobInfo = request.toAIRequestString();
            System.out.println("🤖 Calling Python AI service for job learning path generation...");
            System.out.println("📝 Job info: " + jobInfo);
            
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("user_id", jobPosting.getRecruiter().getId().intValue());
            aiRequest.put("learning_path_info", "Create a comprehensive learning path for candidates applying to this job:\n" + jobInfo);
            
            JsonNode aiResponse = webClient.post()
                .uri(aiServiceUrl + "/api/v1/learning-path/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .block();
            
            if (aiResponse != null && aiResponse.has("modules")) {
                return parseAILearningPathResponse(aiResponse);
            } else {
                System.out.println("⚠️ AI service response format unexpected");
                return null;
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling AI service: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Parse AI response and create learning path response
     */
    private AILearningPathResponse parseAILearningPathResponse(JsonNode aiResponse) {
        try {
            List<AILearningPathResponse.AILearningModule> modules = new ArrayList<>();
            
            if (aiResponse.has("modules") && aiResponse.get("modules").isArray()) {
                for (JsonNode moduleNode : aiResponse.get("modules")) {
                    String moduleName = moduleNode.has("module_name") ? 
                        moduleNode.get("module_name").asText() : "Untitled Module";
                    String moduleDescription = moduleNode.has("module_description") ? 
                        moduleNode.get("module_description").asText() : "No description available";
                    
                    modules.add(new AILearningPathResponse.AILearningModule(moduleName, moduleDescription));
                }
            }
            
            return new AILearningPathResponse(modules);
        } catch (Exception e) {
            System.err.println("❌ Error parsing AI response: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Create job learning path from AI response
     */
    private void createJobLearningPathFromAIResponse(JobPosting jobPosting, AILearningPathResponse aiResponse) {
        // Create the job learning path
        JobLearningPath jobLearningPath = new JobLearningPath(
            jobPosting, 
            jobPosting.getJobTitle(),
            jobPosting.getExperienceLevel().name(),
            "MODERATE"
        );
        jobLearningPath.setGeneratedByAi(true);
        
        jobLearningPath = jobLearningPathRepository.save(jobLearningPath);
        
        // Create modules from AI response
        List<JobLearningModule> modules = new ArrayList<>();
        for (int i = 0; i < aiResponse.getModules().size(); i++) {
            AILearningPathResponse.AILearningModule aiModule = aiResponse.getModules().get(i);
            
            JobLearningModule module = new JobLearningModule(
                aiModule.getModule_name(),
                aiModule.getModule_description(),
                i + 1
            );
            module.setJobLearningPath(jobLearningPath);
            module.setDifficultyLevel(mapExperienceToModuleDifficulty(jobPosting.getExperienceLevel()));
            modules.add(module);
        }
        
        // Save all modules
        jobLearningModuleRepository.saveAll(modules);
        jobLearningPath.setModules(modules);
        jobPosting.setJobLearningPath(jobLearningPath);
        
        System.out.println("✅ Job learning path created with " + modules.size() + " modules");
    }
    
    /**
     * Create fallback learning path when AI is unavailable
     */
    private void createFallbackJobLearningPath(JobPosting jobPosting) {
        // Create the job learning path
        JobLearningPath jobLearningPath = new JobLearningPath(
            jobPosting, 
            jobPosting.getJobTitle(),
            jobPosting.getExperienceLevel().name(),
            "MODERATE"
        );
        jobLearningPath.setGeneratedByAi(false);
        
        jobLearningPath = jobLearningPathRepository.save(jobLearningPath);
        
        // Create fallback modules
        List<JobLearningModule> modules = new ArrayList<>();
        String[] fallbackModuleNames = {
            "Introduction to " + jobPosting.getJobTitle(),
            "Core Skills and Fundamentals",
            "Technical Requirements",
            "Industry Best Practices",
            "Practical Applications",
            "Project Work and Portfolio Building"
        };
        
        for (int i = 0; i < fallbackModuleNames.length; i++) {
            JobLearningModule module = new JobLearningModule(
                fallbackModuleNames[i],
                "This module covers essential aspects of " + fallbackModuleNames[i].toLowerCase() + " for the " + jobPosting.getJobTitle() + " role.",
                i + 1
            );
            module.setJobLearningPath(jobLearningPath);
            module.setDifficultyLevel(mapExperienceToModuleDifficulty(jobPosting.getExperienceLevel()));
            modules.add(module);
        }
        
        // Save all modules
        jobLearningModuleRepository.saveAll(modules);
        jobLearningPath.setModules(modules);
        jobPosting.setJobLearningPath(jobLearningPath);
        
        System.out.println("✅ Fallback job learning path created with " + modules.size() + " modules");
    }
    
    /**
     * Map job experience level to module difficulty
     */
    private JobLearningModule.DifficultyLevel mapExperienceToModuleDifficulty(JobPosting.ExperienceLevel experienceLevel) {
        switch (experienceLevel) {
            case ENTRY_LEVEL:
                return JobLearningModule.DifficultyLevel.BEGINNER;
            case JUNIOR:
                return JobLearningModule.DifficultyLevel.BEGINNER;
            case MID_LEVEL:
                return JobLearningModule.DifficultyLevel.INTERMEDIATE;
            case SENIOR:
                return JobLearningModule.DifficultyLevel.ADVANCED;
            case EXPERT:
                return JobLearningModule.DifficultyLevel.EXPERT;
            default:
                return JobLearningModule.DifficultyLevel.INTERMEDIATE;
        }
    }
    
    /**
     * Get all job postings for a recruiter
     */
    public List<JobPostingResponse> getJobPostingsForRecruiter(Long recruiterId) {
        List<JobPosting> jobPostings = jobPostingRepository.findByRecruiterIdOrderByCreatedAtDesc(recruiterId);
        return jobPostings.stream()
                .map(JobPostingResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Get a specific job posting for a recruiter
     */
    public JobPostingResponse getJobPosting(Long jobId, Long recruiterId) {
        JobPosting jobPosting = jobPostingRepository.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new RuntimeException("Job posting not found or access denied"));
        
        return new JobPostingResponse(jobPosting);
    }
    
    /**
     * Update job posting
     */
    public JobPostingResponse updateJobPosting(Long jobId, Long recruiterId, JobPostingRequest request) {
        JobPosting jobPosting = jobPostingRepository.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new RuntimeException("Job posting not found or access denied"));
        
        // Update fields
        jobPosting.setJobTitle(request.getJobTitle());
        jobPosting.setCompany(request.getCompany());
        jobPosting.setJobDescription(request.getJobDescription());
        jobPosting.setRequiredSkills(request.getRequiredSkills());
        jobPosting.setExperienceLevel(request.getExperienceLevel());
        jobPosting.setLocation(request.getLocation());
        jobPosting.setJobType(request.getJobType());
        jobPosting.setSalaryRange(request.getSalaryRange());
        
        jobPosting = jobPostingRepository.save(jobPosting);
        
        return new JobPostingResponse(jobPosting);
    }
    
    /**
     * Toggle job posting active status
     */
    public JobPostingResponse toggleJobPostingStatus(Long jobId, Long recruiterId) {
        JobPosting jobPosting = jobPostingRepository.findByIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new RuntimeException("Job posting not found or access denied"));
        
        jobPosting.setIsActive(!jobPosting.getIsActive());
        jobPosting = jobPostingRepository.save(jobPosting);
        
        return new JobPostingResponse(jobPosting);
    }
    
    /**
     * Get learning path for a job posting
     */
    public JobLearningPathResponse getJobLearningPath(Long jobId, Long recruiterId) {
        JobLearningPath learningPath = jobLearningPathRepository.findByJobPostingIdAndRecruiterId(jobId, recruiterId)
                .orElseThrow(() -> new RuntimeException("Learning path not found or access denied"));
        
        return new JobLearningPathResponse(learningPath);
    }
    
    /**
     * Get all active job postings (for candidates to see)
     */
    public List<JobPostingResponse> getAllActiveJobPostings() {
        List<JobPosting> jobPostings = jobPostingRepository.findByIsActiveOrderByCreatedAtDesc(true);
        return jobPostings.stream()
                .map(JobPostingResponse::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Search job postings by keyword
     */
    public List<JobPostingResponse> searchJobPostings(String keyword) {
        List<JobPosting> jobPostings = jobPostingRepository.findByKeywordAndIsActive(keyword, true);
        return jobPostings.stream()
                .map(JobPostingResponse::new)
                .collect(Collectors.toList());
    }
}