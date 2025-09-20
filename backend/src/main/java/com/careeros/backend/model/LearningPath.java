package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "learning_paths")
public class LearningPath {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "career_goal", nullable = false)
    private String careerGoal;
    
    @Column(name = "experience_level")
    private String experienceLevel;
    
    @Column(name = "learning_pace")
    private String learningPace;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "learningPath", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LearningModule> modules;
    
    // Constructors
    public LearningPath() {
        this.createdAt = LocalDateTime.now();
    }
    
    public LearningPath(User user, String careerGoal, String experienceLevel, String learningPace) {
        this();
        this.user = user;
        this.careerGoal = careerGoal;
        this.experienceLevel = experienceLevel;
        this.learningPace = learningPace;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getCareerGoal() {
        return careerGoal;
    }
    
    public void setCareerGoal(String careerGoal) {
        this.careerGoal = careerGoal;
    }
    
    public String getExperienceLevel() {
        return experienceLevel;
    }
    
    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }
    
    public String getLearningPace() {
        return learningPace;
    }
    
    public void setLearningPace(String learningPace) {
        this.learningPace = learningPace;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public List<LearningModule> getModules() {
        return modules;
    }
    
    public void setModules(List<LearningModule> modules) {
        this.modules = modules;
    }
} 