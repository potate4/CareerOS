package com.careeros.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "milestones")
public class Milestone {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "career_path_id", referencedColumnName = "id")
    @JsonBackReference
    private CareerPath careerPath;
    
    @Column(name = "year", nullable = false)
    private Integer year;
    
    @Column(name = "title", nullable = false, length = 500)
    private String title;
    
    @Column(name = "expected_salary", precision = 10, scale = 2)
    private BigDecimal expectedSalary;
    
    @Type(JsonType.class)
    @Column(name = "skills_to_learn", columnDefinition = "jsonb")
    private List<String> skillsToLearn;
    
    @Column(name = "notes", length = 1000)
    private String notes;
    
    @Column(name = "estimated_time_to_complete")
    private String estimatedTimeToComplete;
    
    @Type(JsonType.class)
    @Column(name = "prerequisites", columnDefinition = "jsonb")
    private List<String> prerequisites;
    
    @Type(JsonType.class)
    @Column(name = "resources", columnDefinition = "jsonb")
    private List<String> resources;
    
    // Progress tracking
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "user_notes", length = 1000)
    private String userNotes;
    
    @Column(name = "actual_completion_time")
    private String actualCompletionTime;
    
    @Column(name = "difficulty_rating")
    private Integer difficultyRating; // 1-5 scale
    
    @Column(name = "satisfaction_rating")
    private Integer satisfactionRating; // 1-5 scale
    
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;
    
    // Additional tracking
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    
    @Column(name = "target_completion_date")
    private LocalDateTime targetCompletionDate;
    
    @Column(name = "reminder_date")
    private LocalDateTime reminderDate;
    
    @Column(name = "priority")
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enum for priority
    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }
    
    // Constructors
    public Milestone() {}
    
    public Milestone(CareerPath careerPath, Integer year, String title) {
        this.careerPath = careerPath;
        this.year = year;
        this.title = title;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CareerPath getCareerPath() {
        return careerPath;
    }
    
    public void setCareerPath(CareerPath careerPath) {
        this.careerPath = careerPath;
    }
    
    public Integer getYear() {
        return year;
    }
    
    public void setYear(Integer year) {
        this.year = year;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public BigDecimal getExpectedSalary() {
        return expectedSalary;
    }
    
    public void setExpectedSalary(BigDecimal expectedSalary) {
        this.expectedSalary = expectedSalary;
    }
    
    public List<String> getSkillsToLearn() {
        return skillsToLearn;
    }
    
    public void setSkillsToLearn(List<String> skillsToLearn) {
        this.skillsToLearn = skillsToLearn;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getEstimatedTimeToComplete() {
        return estimatedTimeToComplete;
    }
    
    public void setEstimatedTimeToComplete(String estimatedTimeToComplete) {
        this.estimatedTimeToComplete = estimatedTimeToComplete;
    }
    
    public List<String> getPrerequisites() {
        return prerequisites;
    }
    
    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }
    
    public List<String> getResources() {
        return resources;
    }
    
    public void setResources(List<String> resources) {
        this.resources = resources;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public String getUserNotes() {
        return userNotes;
    }
    
    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }
    
    public String getActualCompletionTime() {
        return actualCompletionTime;
    }
    
    public void setActualCompletionTime(String actualCompletionTime) {
        this.actualCompletionTime = actualCompletionTime;
    }
    
    public Integer getDifficultyRating() {
        return difficultyRating;
    }
    
    public void setDifficultyRating(Integer difficultyRating) {
        this.difficultyRating = difficultyRating;
    }
    
    public Integer getSatisfactionRating() {
        return satisfactionRating;
    }
    
    public void setSatisfactionRating(Integer satisfactionRating) {
        this.satisfactionRating = satisfactionRating;
    }
    
    public Integer getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getTargetCompletionDate() {
        return targetCompletionDate;
    }
    
    public void setTargetCompletionDate(LocalDateTime targetCompletionDate) {
        this.targetCompletionDate = targetCompletionDate;
    }
    
    public LocalDateTime getReminderDate() {
        return reminderDate;
    }
    
    public void setReminderDate(LocalDateTime reminderDate) {
        this.reminderDate = reminderDate;
    }
    
    public Priority getPriority() {
        return priority;
    }
    
    public void setPriority(Priority priority) {
        this.priority = priority;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 