package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class LearningPathRequest {
    
    @NotBlank(message = "Career goal is required")
    @Size(min = 3, max = 100, message = "Career goal must be between 3 and 100 characters")
    private String careerGoal;
    
    @NotNull(message = "Current skills are required")
    private List<String> currentSkills;
    
    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;
    
    @NotNull(message = "Learning pace is required")
    private LearningPace learningPace;
    
    @Size(max = 500, message = "Additional notes must not exceed 500 characters")
    private String additionalNotes;
    
    // Enums
    public enum ExperienceLevel {
        BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    }
    
    public enum LearningPace {
        SLOW(1), MODERATE(2), FAST(3), INTENSIVE(4);
        
        private final int pace;
        
        LearningPace(int pace) {
            this.pace = pace;
        }
        
        public int getPace() {
            return pace;
        }
    }
    
    // Constructors
    public LearningPathRequest() {}
    
    public LearningPathRequest(String careerGoal, List<String> currentSkills, 
                              ExperienceLevel experienceLevel, LearningPace learningPace) {
        this.careerGoal = careerGoal;
        this.currentSkills = currentSkills;
        this.experienceLevel = experienceLevel;
        this.learningPace = learningPace;
    }
    
    // Getters and Setters
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public List<String> getCurrentSkills() {
        return currentSkills;
    }
    
    public void setCurrentSkills(List<String> currentSkills) {
        this.currentSkills = currentSkills;
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
    
    public String getAdditionalNotes() {
        return additionalNotes;
    }
    
    public void setAdditionalNotes(String additionalNotes) {
        this.additionalNotes = additionalNotes;
    }
} 