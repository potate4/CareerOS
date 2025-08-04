package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skills")
public class Skill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "category")
    private String category;
    
    @Column(name = "proficiency_level")
    @Enumerated(EnumType.STRING)
    private ProficiencyLevel proficiencyLevel = ProficiencyLevel.BEGINNER;
    
    @Column(name = "years_of_experience")
    private Double yearsOfExperience = 0.0;
    
    @Column(name = "is_certified")
    private Boolean isCertified = false;
    
    @Column(name = "certification_name")
    private String certificationName;
    
    @Column(name = "last_used_date")
    private LocalDateTime lastUsedDate;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Enums
    public enum ProficiencyLevel {
        BEGINNER(1), INTERMEDIATE(2), ADVANCED(3), EXPERT(4);
        
        private final int level;
        
        ProficiencyLevel(int level) {
            this.level = level;
        }
        
        public int getLevel() {
            return level;
        }
    }
    
    // Constructors
    public Skill() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Skill(User user, String name, String category) {
        this();
        this.user = user;
        this.name = name;
        this.category = category;
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
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public ProficiencyLevel getProficiencyLevel() {
        return proficiencyLevel;
    }
    
    public void setProficiencyLevel(ProficiencyLevel proficiencyLevel) {
        this.proficiencyLevel = proficiencyLevel;
    }
    
    public Double getYearsOfExperience() {
        return yearsOfExperience;
    }
    
    public void setYearsOfExperience(Double yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }
    
    public Boolean getIsCertified() {
        return isCertified;
    }
    
    public void setIsCertified(Boolean isCertified) {
        this.isCertified = isCertified;
    }
    
    public String getCertificationName() {
        return certificationName;
    }
    
    public void setCertificationName(String certificationName) {
        this.certificationName = certificationName;
    }
    
    public LocalDateTime getLastUsedDate() {
        return lastUsedDate;
    }
    
    public void setLastUsedDate(LocalDateTime lastUsedDate) {
        this.lastUsedDate = lastUsedDate;
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
    
    // JPA Lifecycle methods
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 