package com.careeros.backend.controller;

import com.careeros.backend.model.JobAssessment;
import com.careeros.backend.model.JobAssessmentQuestion;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.repository.JobAssessmentRepository;
import com.careeros.backend.repository.JobPostingRepository;
import com.careeros.backend.security.UserDetailsImpl;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/job-assessments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JobAssessmentController {

    private final WebClient webClient;
    
    @Autowired
    private JobAssessmentRepository jobAssessmentRepository;
    
    @Autowired
    private JobPostingRepository jobPostingRepository;

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public JobAssessmentController() {
        this.webClient = WebClient.builder().build();
    }

    /**
     * Create assessment session for a candidate using stored job assessment questions
     */
    @PostMapping("/create/{jobId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJobAssessment(
            @PathVariable Long jobId,
            @RequestBody(required = false) Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("🔥 Creating job assessment for candidate " + userDetails.getId() + " for job " + jobId);

            // Get the actual job assessment from database
            List<JobAssessment> assessments = jobAssessmentRepository.findByJobPostingIdWithQuestions(jobId);
            
            if (assessments.isEmpty()) {
                System.err.println("❌ No assessment found for job " + jobId);
                System.err.println("🔥 DEBUG: Checking if job exists and has assessments...");
                
                // Debug: Check if job exists at all
                boolean jobExists = jobPostingRepository.existsById(jobId);
                System.err.println("🔥 DEBUG: Job " + jobId + " exists: " + jobExists);
                
                // Debug: Check all assessments for this job (including inactive)
                List<JobAssessment> allAssessments = jobAssessmentRepository.findByJobPostingIdOrderByCreatedAtDesc(jobId);
                System.err.println("🔥 DEBUG: Total assessments for job " + jobId + ": " + allAssessments.size());
                for (JobAssessment assessment : allAssessments) {
                    System.err.println("🔥 DEBUG: Assessment " + assessment.getId() + " - " + assessment.getAssessmentName() + " (Active: " + assessment.getIsActive() + ")");
                }
                
                return ResponseEntity.status(404).body(new MessageResponse("No active assessment found for this job. Total assessments: " + allAssessments.size()));
            }

            JobAssessment jobAssessment = assessments.get(0); // Get the first assessment
            List<JobAssessmentQuestion> questions = jobAssessment.getQuestions();
            
            System.out.println("🔥 DEBUG: Found assessment " + jobAssessment.getId() + " with " + (questions != null ? questions.size() : 0) + " questions");
            
            if (questions == null || questions.isEmpty()) {
                System.err.println("❌ No questions found for job assessment " + jobAssessment.getId());
                System.err.println("🔥 DEBUG: Assessment details - Name: " + jobAssessment.getAssessmentName() + ", Type: " + jobAssessment.getAssessmentType());
                return ResponseEntity.status(404).body(new MessageResponse("No questions found for this assessment"));
            }

            // Convert database questions to the format expected by frontend
            List<Map<String, Object>> formattedQuestions = questions.stream()
                .sorted(Comparator.comparing(JobAssessmentQuestion::getOrderIndex))
                .map(this::convertQuestionToMap)
                .collect(Collectors.toList());

            System.out.println("🔥 DEBUG: Formatted " + formattedQuestions.size() + " questions for frontend");
            for (int i = 0; i < Math.min(3, formattedQuestions.size()); i++) {
                Map<String, Object> q = formattedQuestions.get(i);
                System.out.println("🔥 DEBUG: Question " + (i+1) + ": " + q.get("question"));
            }

            // Create assessment session response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Job assessment created successfully with " + formattedQuestions.size() + " questions");
            response.put("assessment_id", "job_assessment_" + jobId + "_" + userDetails.getId() + "_" + System.currentTimeMillis());
            response.put("questions", formattedQuestions);
            response.put("job_id", jobId);
            response.put("candidate_id", userDetails.getId());
            response.put("assessment_type", "job_assessment");
            response.put("difficulty", jobAssessment.getDifficultyLevel().toString().toLowerCase());
            response.put("time_limit_minutes", jobAssessment.getTimeLimitMinutes());
            response.put("passing_score", jobAssessment.getPassingScore());
            response.put("created_at", new Date().toInstant().toString());

            System.out.println("✅ Job assessment created successfully with " + formattedQuestions.size() + " questions");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Exception creating job assessment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Error creating job assessment: " + e.getMessage()));
        }
    }

    /**
     * Convert JobAssessmentQuestion to Map format expected by frontend
     */
    private Map<String, Object> convertQuestionToMap(JobAssessmentQuestion question) {
        Map<String, Object> questionMap = new HashMap<>();
        questionMap.put("question", question.getQuestionText());
        questionMap.put("question_type", question.getQuestionType().toString());
        questionMap.put("correct_answer", question.getCorrectAnswer());
        questionMap.put("explanation", question.getExplanation());
        questionMap.put("points", question.getPoints());
        questionMap.put("order_index", question.getOrderIndex());
        
        // Handle options for multiple choice questions
        if (question.getOptions() != null && !question.getOptions().isEmpty()) {
            questionMap.put("options", question.getOptions());
        }
        
        return questionMap;
    }

    /**
     * Submit and score assessment for a candidate
     */
    @PostMapping("/submit/{jobId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> submitJobAssessment(
            @PathVariable Long jobId,
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("🔥 Submitting job assessment for candidate " + userDetails.getId() + " for job " + jobId);

            // Prepare request for learning path assessment scoring endpoint
            Map<String, Object> learningPathRequest = new HashMap<>();
            learningPathRequest.put("user_id", userDetails.getId());
            learningPathRequest.put("module_id", jobId); // Use jobId as module_id
            learningPathRequest.put("assessment_id", requestBody.get("assessment_id"));
            learningPathRequest.put("assessment_answers", requestBody.get("assessment_answers"));

            // Call learning path assessment scoring endpoint
            JsonNode aiResponse = webClient.post()
                    .uri(aiServiceUrl + "/api/v1/learning-path/score-assessment")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(learningPathRequest)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            if (aiResponse != null && aiResponse.has("success") && aiResponse.get("success").asBoolean()) {
                System.out.println("✅ Job assessment scored successfully");
                
                // Store the assessment result in the database (update candidate submission)
                updateCandidateSubmissionWithAssessmentScore(jobId, userDetails.getId(), aiResponse);
                
                return ResponseEntity.ok(aiResponse);
            } else {
                System.out.println("❌ AI service returned error: " + (aiResponse != null ? aiResponse.toString() : "null"));
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Failed to score assessment: " + 
                            (aiResponse != null && aiResponse.has("error") ? aiResponse.get("error").asText() : "Unknown error")));
            }

        } catch (Exception e) {
            System.err.println("❌ Error submitting job assessment: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error submitting assessment: " + e.getMessage()));
        }
    }

    /**
     * Get assessment scores for a job (recruiters only)
     */
    @GetMapping("/scores/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> getJobAssessmentScores(
            @PathVariable Long jobId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            System.out.println("🔥 Getting assessment scores for job " + jobId);

            // For now, return a simple message indicating the feature is available
            // In a full implementation, you'd query the database for all candidate submissions
            // and their assessment scores for this job
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Assessment scores endpoint available",
                "jobId", jobId,
                "note", "This would return all candidate assessment scores for the job"
            ));

        } catch (Exception e) {
            System.err.println("❌ Error getting job assessment scores: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error getting assessment scores: " + e.getMessage()));
        }
    }

    /**
     * Helper method to update candidate submission with assessment score
     */
    private void updateCandidateSubmissionWithAssessmentScore(Long jobId, Long candidateId, JsonNode assessmentResult) {
        try {
            // Extract score information from AI response
            double percentage = assessmentResult.has("percentage") ? assessmentResult.get("percentage").asDouble() : 0.0;
            double totalScore = assessmentResult.has("total_score") ? assessmentResult.get("total_score").asDouble() : 0.0;
            double maxScore = assessmentResult.has("max_score") ? assessmentResult.get("max_score").asDouble() : 0.0;
            
            System.out.println(String.format("📊 Assessment completed - Job: %d, Candidate: %d, Score: %.1f%% (%.1f/%.1f)", 
                jobId, candidateId, percentage, totalScore, maxScore));
            
            // TODO: Update CandidateSubmission entity with assessment results
            // This would involve:
            // 1. Finding the CandidateSubmission record
            // 2. Updating assessment-related fields
            // 3. Changing application status to IN_REVIEW or similar
            
        } catch (Exception e) {
            System.err.println("❌ Error updating candidate submission with assessment score: " + e.getMessage());
        }
    }
}
