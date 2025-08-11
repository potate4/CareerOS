package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_jobs")
public class InterviewJob {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "job_id", nullable = false, unique = true)
    private String jobId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "video_url", nullable = false)
    private String videoUrl;
    
    @Column(name = "status", nullable = false)
    private String status; // PENDING, COMPLETED, FAILED
    
    @Column(name = "file_id")
    private Long fileId;
    
    @Column(name = "detailed_analysis", columnDefinition = "TEXT")
    private String detailedAnalysis; // JSON string
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @Column(name = "analysis_type")
    private String analysisType;
    
    @Column(name = "error_message")
    private String errorMessage;
    
    public InterviewJob() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public InterviewJob(String jobId, Long userId, String videoUrl, String status, Long fileId, String analysisType) {
        this.jobId = jobId;
        this.userId = userId;
        this.videoUrl = videoUrl;
        this.status = status;
        this.fileId = fileId;
        this.analysisType = analysisType;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getJobId() {
        return jobId;
    }
    
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public Long getFileId() {
        return fileId;
    }
    
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }
    
    public String getDetailedAnalysis() {
        return detailedAnalysis;
    }
    
    public void setDetailedAnalysis(String detailedAnalysis) {
        this.detailedAnalysis = detailedAnalysis;
        this.updatedAt = LocalDateTime.now();
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
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 