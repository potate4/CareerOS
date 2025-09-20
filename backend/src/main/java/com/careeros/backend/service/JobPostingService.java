package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.JobPostingRequest;
import com.careeros.backend.payload.response.JobPostingResponse;
import com.careeros.backend.payload.response.JobLearningPathResponse;
import com.careeros.backend.payload.response.AILearningPathResponse;
import com.careeros.backend.repository.*;
import com.careeros.backend.model.JobAssessmentQuestion;
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
    // private final JobAssessmentQuestionRepository jobAssessmentQuestionRepository;
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
            // JobAssessmentQuestionRepository jobAssessmentQuestionRepository,
            CandidateSubmissionRepository candidateSubmissionRepository,
            UserRepository userRepository,
            @Value("${ai.service.url:http://localhost:8000}") String aiServiceUrl) {
        this.jobPostingRepository = jobPostingRepository;
        this.jobLearningPathRepository = jobLearningPathRepository;
        this.jobLearningModuleRepository = jobLearningModuleRepository;
        this.jobAssessmentRepository = jobAssessmentRepository;
        // this.jobAssessmentQuestionRepository = jobAssessmentQuestionRepository;
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
            
            // Verify recruiter role - temporarily allow all authenticated users for debugging
            if (!recruiter.getRoles().contains(Role.ROLE_RECRUITER) &&
                !recruiter.getRoles().contains(Role.ROLE_ADMIN)) {
                System.err.println("⚠️ Warning: User " + recruiter.getUsername() + " does not have recruiter role. Current roles: " + recruiter.getRoles());
                // For now, let's allow it but warn - in production, uncomment the line below
                // throw new RuntimeException("User does not have recruiter role");
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

            // Generate assessment if requested
            if (request.getGenerateAssessment()) {
                try {
                    generateJobAssessment(jobPosting, request);
                } catch (Exception e) {
                    System.err.println("❌ Error generating assessment: " + e.getMessage());
                }
            }

            // Refresh the job posting to include the newly created learning path and assessments
            jobPosting = jobPostingRepository.findByIdWithAssociations(jobPosting.getId()).orElse(jobPosting);

            // Debug the refreshed job posting
            System.out.println("🔥 [SERVICE_DEBUG] After refresh - Job ID: " + jobPosting.getId());
            System.out.println("🔥 [SERVICE_DEBUG] Learning path: " + (jobPosting.getJobLearningPath() != null ? "EXISTS" : "NULL"));
            System.out.println("🔥 [SERVICE_DEBUG] Job assessments: " + jobPosting.getJobAssessments());
            if (jobPosting.getJobAssessments() != null) {
                System.out.println("🔥 [SERVICE_DEBUG] Assessment count: " + jobPosting.getJobAssessments().size());
                for (JobAssessment assessment : jobPosting.getJobAssessments()) {
                    System.out.println("🔥 [SERVICE_DEBUG] Assessment: " + assessment.getAssessmentName() + " (ID: " + assessment.getId() + ")");
                }
            }

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
     * Call AI service to generate job-specific learning path using job posting endpoint
     */
    private AILearningPathResponse callAIJobLearningPathGeneration(JobPosting jobPosting, JobPostingRequest request) {
        try {
            System.out.println("🤖 Calling Python AI service for job posting analysis and learning path generation...");
            System.out.println("📝 Job title: " + jobPosting.getJobTitle());
            System.out.println("📝 Company: " + jobPosting.getCompany());

            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("job_description", jobPosting.getJobDescription());

            JsonNode aiResponse = webClient.post()
                .uri(aiServiceUrl + "/api/v1/job-posting/extract-skills-and-generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .block();
            
            if (aiResponse != null && aiResponse.has("success") && aiResponse.get("success").asBoolean()) {
                return parseJobPostingAIResponse(aiResponse);
            } else {
                System.out.println("⚠️ AI service response format unexpected or failed");
                System.out.println("Response: " + (aiResponse != null ? aiResponse.toString() : "null"));
                return null;
            }
        } catch (Exception e) {
            System.err.println("❌ Error calling AI service: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Parse job posting AI response and create learning path response
     */
    private AILearningPathResponse parseJobPostingAIResponse(JsonNode aiResponse) {
        try {
            List<AILearningPathResponse.AILearningModule> modules = new ArrayList<>();

            // The job posting AI endpoint returns learning_path array
            if (aiResponse.has("learning_path") && aiResponse.get("learning_path").isArray()) {
                for (JsonNode moduleNode : aiResponse.get("learning_path")) {
                    String moduleName = moduleNode.has("module_name") ?
                        moduleNode.get("module_name").asText() : "Untitled Module";
                    String moduleDescription = moduleNode.has("module_description") ?
                        moduleNode.get("module_description").asText() : "No description available";

                    modules.add(new AILearningPathResponse.AILearningModule(moduleName, moduleDescription));
                }
            }

            return new AILearningPathResponse(modules);
        } catch (Exception e) {
            System.err.println("❌ Error parsing job posting AI response: " + e.getMessage());
            return null;
        }
    }

    /**
     * Parse original AI response format (fallback)
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
     * Generate assessment for a job posting using AI
     */
    private void generateJobAssessment(JobPosting jobPosting, JobPostingRequest request) {
        try {
            System.out.println("🤖 Generating assessment for job posting: " + jobPosting.getJobTitle());

            // Call AI service to generate assessment
            JsonNode aiResponse = webClient.post()
                .uri(aiServiceUrl + "/api/v1/job-posting/extract-skills-and-generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("job_description", jobPosting.getJobDescription()))
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .block();

            if (aiResponse != null && aiResponse.has("success") && aiResponse.get("success").asBoolean()) {
                createJobAssessmentFromAIResponse(jobPosting, aiResponse);
            } else {
                System.out.println("⚠️ AI service unavailable for assessment, creating fallback");
                createFallbackJobAssessment(jobPosting);
            }
        } catch (Exception e) {
            System.err.println("❌ Error generating assessment: " + e.getMessage());
            createFallbackJobAssessment(jobPosting);
        }
    }

    /**
     * Create job assessment from AI response
     */
    private void createJobAssessmentFromAIResponse(JobPosting jobPosting, JsonNode aiResponse) {
        try {
            if (aiResponse.has("assessment") && aiResponse.get("assessment").isArray()) {
                // Create the assessment
                JobAssessment assessment = new JobAssessment(
                    jobPosting,
                    jobPosting.getJobTitle() + " Technical Assessment",
                    JobAssessment.AssessmentType.MIXED
                );
                assessment.setAssessmentDescription("AI-generated technical assessment for " + jobPosting.getJobTitle() + " position");
                assessment.setAssessmentType(JobAssessment.AssessmentType.MIXED);
                assessment.setDifficultyLevel(mapExperienceToAssessmentDifficulty(jobPosting.getExperienceLevel()));
                assessment.setTimeLimitMinutes(60);
                assessment.setPassingScore(70.0);
                // assessment.setGeneratedByAi(true); // Comment out if property doesn't exist
                assessment = jobAssessmentRepository.save(assessment);

                // Create questions from AI response
                JsonNode questionsNode = aiResponse.get("assessment");
                List<JobAssessmentQuestion> questions = new ArrayList<>();
                int orderIndex = 1;

                for (JsonNode questionNode : questionsNode) {
                    if (questions.size() >= 10) break; // Limit to 10 questions

                    String questionText = questionNode.has("question") ? questionNode.get("question").asText() : "Sample question";
                    String questionType = questionNode.has("question_type") ? questionNode.get("question_type").asText() : "MULTIPLE_CHOICE";
                    String options = questionNode.has("options") ? questionNode.get("options").asText() : null;
                    String correctAnswer = questionNode.has("correct_answer") ? questionNode.get("correct_answer").asText() : "A";
                    String explanation = questionNode.has("explanation") ? questionNode.get("explanation").asText() : "";
                    double points = questionNode.has("points") ? questionNode.get("points").asDouble() : 10.0;

                    // Convert string to enum
                    JobAssessmentQuestion.QuestionType qType;
                    try {
                        qType = JobAssessmentQuestion.QuestionType.valueOf(questionType);
                    } catch (IllegalArgumentException e) {
                        qType = JobAssessmentQuestion.QuestionType.MULTIPLE_CHOICE; // default
                    }

                    JobAssessmentQuestion question = new JobAssessmentQuestion(
                        assessment,
                        questionText,
                        qType
                    );
                    question.setOrderIndex(orderIndex++);
                    question.setOptions(options);
                    question.setCorrectAnswer(correctAnswer);
                    question.setExplanation(explanation);
                    question.setPoints(points);

                    questions.add(question);
                }

                // Save questions via assessment (cascade should handle this)
                assessment.setQuestions(questions);
                jobAssessmentRepository.save(assessment);

                // Update the bidirectional relationship
                if (jobPosting.getJobAssessments() == null) {
                    jobPosting.setJobAssessments(new ArrayList<>());
                }
                jobPosting.getJobAssessments().add(assessment);

                System.out.println("✅ Job assessment created with " + questions.size() + " AI-generated questions");
            } else {
                System.out.println("⚠️ No assessment data in AI response, creating fallback");
                createFallbackJobAssessment(jobPosting);
            }
        } catch (Exception e) {
            System.err.println("❌ Error creating assessment from AI response: " + e.getMessage());
            createFallbackJobAssessment(jobPosting);
        }
    }

    /**
     * Create fallback assessment when AI fails
     */
    private void createFallbackJobAssessment(JobPosting jobPosting) {
        try {
            // Create basic assessment
            JobAssessment assessment = new JobAssessment(
                jobPosting,
                jobPosting.getJobTitle() + " Assessment",
                JobAssessment.AssessmentType.MIXED
            );
            assessment.setAssessmentDescription("Technical assessment for " + jobPosting.getJobTitle() + " position");
            assessment.setAssessmentType(JobAssessment.AssessmentType.MIXED);
            assessment.setDifficultyLevel(mapExperienceToAssessmentDifficulty(jobPosting.getExperienceLevel()));
            assessment.setTimeLimitMinutes(45);
            assessment.setPassingScore(70.0);
            // assessment.setGeneratedByAi(false); // Comment out if property doesn't exist
            assessment = jobAssessmentRepository.save(assessment);

            // Create basic questions
            List<JobAssessmentQuestion> questions = new ArrayList<>();

            JobAssessmentQuestion q1 = new JobAssessmentQuestion(
                assessment,
                "What are the key responsibilities of a " + jobPosting.getJobTitle() + "?",
                JobAssessmentQuestion.QuestionType.SHORT_ANSWER
            );
            q1.setOrderIndex(1);
            q1.setCorrectAnswer("Various responsibilities including development, analysis, and problem-solving");
            q1.setPoints(10.0);
            questions.add(q1);

            JobAssessmentQuestion q2 = new JobAssessmentQuestion(
                assessment,
                "Which skill is most important for this role?",
                JobAssessmentQuestion.QuestionType.MULTIPLE_CHOICE
            );
            q2.setOrderIndex(2);
            q2.setOptions("[\"A) Technical expertise\", \"B) Communication\", \"C) Problem solving\", \"D) All of the above\"]");
            q2.setCorrectAnswer("D) All of the above");
            q2.setPoints(10.0);
            questions.add(q2);

            // Save questions via assessment (cascade should handle this)
            assessment.setQuestions(questions);
            jobAssessmentRepository.save(assessment);

            // Update the bidirectional relationship
            if (jobPosting.getJobAssessments() == null) {
                jobPosting.setJobAssessments(new ArrayList<>());
            }
            jobPosting.getJobAssessments().add(assessment);

            System.out.println("✅ Fallback job assessment created with " + questions.size() + " questions");
        } catch (Exception e) {
            System.err.println("❌ Error creating fallback assessment: " + e.getMessage());
        }
    }

    /**
     * Map job experience level to assessment difficulty
     */
    private JobAssessment.DifficultyLevel mapExperienceToAssessmentDifficulty(JobPosting.ExperienceLevel experienceLevel) {
        switch (experienceLevel) {
            case ENTRY_LEVEL:
                return JobAssessment.DifficultyLevel.BEGINNER;
            case JUNIOR:
                return JobAssessment.DifficultyLevel.BEGINNER;
            case MID_LEVEL:
                return JobAssessment.DifficultyLevel.INTERMEDIATE;
            case SENIOR:
                return JobAssessment.DifficultyLevel.ADVANCED;
            case EXPERT:
                return JobAssessment.DifficultyLevel.EXPERT;
            default:
                return JobAssessment.DifficultyLevel.INTERMEDIATE;
        }
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

    /**
     * Analyze job description using AI service (for frontend AI analysis)
     */
    public JsonNode analyzeJobDescriptionWithAI(String jobDescription) {
        try {
            System.out.println("🔥 [SERVICE] Starting AI service call for job description analysis...");
            System.out.println("🔥 [SERVICE] Job description length: " + jobDescription.length());
            System.out.println("🔥 [SERVICE] AI service URL: " + aiServiceUrl);

            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("job_description", jobDescription);

            System.out.println("🔥 [SERVICE] Request payload: " + aiRequest);
            System.out.println("🔥 [SERVICE] Making HTTP POST to: " + aiServiceUrl + "/api/v1/job-posting/extract-skills-and-generate");

            JsonNode aiResponse = webClient.post()
                .uri(aiServiceUrl + "/api/v1/job-posting/extract-skills-and-generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(aiRequest)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(60))
                .block();

            System.out.println("🔥 [SERVICE] AI service response received");
            if (aiResponse != null) {
                System.out.println("🔥 [SERVICE] Response not null - size: " + aiResponse.toString().length());
                System.out.println("🔥 [SERVICE] Response has 'success' field: " + aiResponse.has("success"));
                if (aiResponse.has("success")) {
                    System.out.println("🔥 [SERVICE] Success value: " + aiResponse.get("success").asBoolean());
                }
                System.out.println("🔥 [SERVICE] Full response: " + aiResponse.toPrettyString());
                System.out.println("✅ [SERVICE] AI analysis completed successfully");
                return aiResponse;
            } else {
                System.err.println("❌ [SERVICE] AI service returned null response");
                throw new RuntimeException("AI service returned empty response");
            }
        } catch (Exception e) {
            System.err.println("❌ [SERVICE] Error calling AI service for analysis: " + e.getMessage());
            System.err.println("❌ [SERVICE] Error class: " + e.getClass().getSimpleName());
            e.printStackTrace();
            throw new RuntimeException("AI analysis failed: " + e.getMessage());
        }
    }
}