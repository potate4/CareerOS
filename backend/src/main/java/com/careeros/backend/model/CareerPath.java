package com.careeros.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "career_paths")
public class CareerPath {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roadmap_id", referencedColumnName = "id")
    @JsonBackReference
    private FuturecastRoadmap roadmap;
    
    @Column(name = "path_id", nullable = false)
    private String pathId; // e.g., "path1", "path2", "path3"
    
    @Column(name = "description", length = 1000, nullable = false)
    private String description;
    
    @Column(name = "difficulty")
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    
    @Column(name = "probability")
    private Double probability; // Success probability 0.0-1.0
    
    @Column(name = "risk_level")
    @Enumerated(EnumType.STRING)
    private RiskLevel riskLevel;
    
    @Column(name = "total_investment", precision = 10, scale = 2)
    private BigDecimal totalInvestment; // Time/money investment
    
    @Type(JsonType.class)
    @Column(name = "alternative_options", columnDefinition = "jsonb")
    private List<String> alternativeOptions;
    
    // Relationships
    @OneToMany(mappedBy = "careerPath", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonManagedReference
    @OrderBy("year ASC")
    private List<Milestone> milestones;
    
    // Selection and tracking
    @Column(name = "is_selected")
    private Boolean isSelected = false;
    
    @Column(name = "selection_reason", length = 500)
    private String selectionReason;
    
    @Column(name = "user_notes", length = 1000)
    private String userNotes;
    
    @Column(name = "completion_percentage")
    private Integer completionPercentage = 0;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Enums
    public enum Difficulty {
        EASY, MEDIUM, HARD
    }
    
    public enum RiskLevel {
        LOW, MEDIUM, HIGH
    }
    
    // Constructors
    public CareerPath() {}
    
    public CareerPath(FuturecastRoadmap roadmap, String pathId, String description) {
        this.roadmap = roadmap;
        this.pathId = pathId;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public FuturecastRoadmap getRoadmap() {
        return roadmap;
    }
    
    public void setRoadmap(FuturecastRoadmap roadmap) {
        this.roadmap = roadmap;
    }
    
    public String getPathId() {
        return pathId;
    }
    
    public void setPathId(String pathId) {
        this.pathId = pathId;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Difficulty getDifficulty() {
        return difficulty;
    }
    
    public void setDifficulty(Difficulty difficulty) {
        this.difficulty = difficulty;
    }
    
    public Double getProbability() {
        return probability;
    }
    
    public void setProbability(Double probability) {
        this.probability = probability;
    }
    
    public RiskLevel getRiskLevel() {
        return riskLevel;
    }
    
    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }
    
    public BigDecimal getTotalInvestment() {
        return totalInvestment;
    }
    
    public void setTotalInvestment(BigDecimal totalInvestment) {
        this.totalInvestment = totalInvestment;
    }
    
    public List<String> getAlternativeOptions() {
        return alternativeOptions;
    }
    
    public void setAlternativeOptions(List<String> alternativeOptions) {
        this.alternativeOptions = alternativeOptions;
    }
    
    public List<Milestone> getMilestones() {
        return milestones;
    }
    
    public void setMilestones(List<Milestone> milestones) {
        this.milestones = milestones;
    }
    
    public Boolean getIsSelected() {
        return isSelected;
    }
    
    public void setIsSelected(Boolean isSelected) {
        this.isSelected = isSelected;
    }
    
    public String getSelectionReason() {
        return selectionReason;
    }
    
    public void setSelectionReason(String selectionReason) {
        this.selectionReason = selectionReason;
    }
    
    public String getUserNotes() {
        return userNotes;
    }
    
    public void setUserNotes(String userNotes) {
        this.userNotes = userNotes;
    }
    
    public Integer getCompletionPercentage() {
        return completionPercentage;
    }
    
    public void setCompletionPercentage(Integer completionPercentage) {
        this.completionPercentage = completionPercentage;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
} 