package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class LearningPathRequest {
    
    @NotBlank(message = "Career goal is required")
    private String careerGoal;
    
    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;
    
    @NotNull(message = "Learning pace is required")
    private LearningPace learningPace;
    
    @NotNull(message = "Current skills are required")
    @Size(min = 1, message = "At least one current skill is required")
    private List<String> currentSkills;
    
    private String additionalNotes;
    
    // Enums
    public enum ExperienceLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
    
    public enum LearningPace {
        SLOW, MODERATE, FAST
    }
    
    // Constructors
    public LearningPathRequest() {}
    
    public LearningPathRequest(String careerGoal, ExperienceLevel experienceLevel, 
                              LearningPace learningPace, List<String> currentSkills, String additionalNotes) {
        this.careerGoal = careerGoal;
        this.experienceLevel = experienceLevel;
        this.learningPace = learningPace;
        this.currentSkills = currentSkills;
        this.additionalNotes = additionalNotes;
    }
    
    // Getters and Setters
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public ExperienceLevel getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(ExperienceLevel experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public LearningPace getLearningPace() {
        return learningPace;
    }
    
    public void setLearningPace(LearningPace learningPace) {
        this.learningPace = learningPace;
    }
    
    public List<String> getCurrentSkills() {
        return currentSkills;
    }
    
    public void setCurrentSkills(List<String> currentSkills) {
        this.currentSkills = currentSkills;
    }
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
    
    /**
     * Convert the request to a string for AI processing
     * @return JSON string representation of the request
     */
    public String toAIRequestString() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode node = mapper.createObjectNode();
            
            node.put("career_goal", this.careerGoal);
            node.put("experience_level", this.experienceLevel.name());
            node.put("learning_pace", this.learningPace.name());
            node.put("additional_notes", this.additionalNotes != null ? this.additionalNotes : "");
            
            // Convert current skills list to JSON array
            node.set("current_skills", mapper.valueToTree(this.currentSkills));
            
            return mapper.writeValueAsString(node);
        } catch (Exception e) {
            // Fallback to simple string concatenation
            StringBuilder sb = new StringBuilder();
            sb.append("Career Goal: ").append(this.careerGoal).append(". ");
            sb.append("Experience Level: ").append(this.experienceLevel.name()).append(". ");
            sb.append("Learning Pace: ").append(this.learningPace.name()).append(". ");
            sb.append("Current Skills: ").append(String.join(", ", this.currentSkills)).append(". ");
            if (this.additionalNotes != null && !this.additionalNotes.trim().isEmpty()) {
                sb.append("Additional Notes: ").append(this.additionalNotes);
            }
            return sb.toString();
        }
    }
} 