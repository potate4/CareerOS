package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_trends")
public class MarketTrend {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "skill_name", nullable = false)
    private String skillName;
    
    @Column(name = "demand_score")
    private Double demandScore;
    
    @Column(name = "salary_trend")
    private String salaryTrend; // INCREASING, DECREASING, STABLE
    
    @Column(name = "job_postings_count")
    private Integer jobPostingsCount;
    
    @Column(name = "growth_rate_percentage")
    private Double growthRatePercentage;
    
    @Column(name = "trending_direction")
    private String trendingDirection; // UP, DOWN, STABLE
    
    @Column(name = "market_region")
    private String marketRegion;
    
    @Column(name = "industry_focus")
    private String industryFocus;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "data_source")
    private String dataSource;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public MarketTrend() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }
    
    public MarketTrend(String skillName) {
        this();
        this.skillName = skillName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSkillName() {
        return skillName;
    }
    
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
    
    public Double getDemandScore() {
        return demandScore;
    }
    
    public void setDemandScore(Double demandScore) {
        this.demandScore = demandScore;
    }
    
    public String getSalaryTrend() {
        return salaryTrend;
    }
    
    public void setSalaryTrend(String salaryTrend) {
        this.salaryTrend = salaryTrend;
    }
    
    public Integer getJobPostingsCount() {
        return jobPostingsCount;
    }
    
    public void setJobPostingsCount(Integer jobPostingsCount) {
        this.jobPostingsCount = jobPostingsCount;
    }
    
    public Double getGrowthRatePercentage() {
        return growthRatePercentage;
    }
    
    public void setGrowthRatePercentage(Double growthRatePercentage) {
        this.growthRatePercentage = growthRatePercentage;
    }
    
    public String getTrendingDirection() {
        return trendingDirection;
    }
    
    public void setTrendingDirection(String trendingDirection) {
        this.trendingDirection = trendingDirection;
    }
    
    public String getMarketRegion() {
        return marketRegion;
    }
    
    public void setMarketRegion(String marketRegion) {
        this.marketRegion = marketRegion;
    }
    
    public String getIndustryFocus() {
        return industryFocus;
    }
    
    public void setIndustryFocus(String industryFocus) {
        this.industryFocus = industryFocus;
    }
    
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }
    
    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
    
    public String getDataSource() {
        return dataSource;
    }
    
    public void setDataSource(String dataSource) {
        this.dataSource = dataSource;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
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
