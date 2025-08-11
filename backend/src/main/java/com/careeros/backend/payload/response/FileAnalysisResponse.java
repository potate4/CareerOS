package com.careeros.backend.payload.response;

import java.time.LocalDateTime;

public class FileAnalysisResponse {
    
    private Long fileId;
    private String fileName;
    private String originalFileName;
    private String fileUrl;
    private String category;
    private LocalDateTime uploadedAt;
    
    // Analysis job details
    private String jobId;
    private String analysisStatus; // PENDING, COMPLETED, FAILED
    private String analysisType;
    private String detailedAnalysis; // JSON string
    private String errorMessage;
    private LocalDateTime analysisCreatedAt;
    private LocalDateTime analysisUpdatedAt;
    
    // Default constructor
    public FileAnalysisResponse() {}
    
    // Constructor with file and analysis details
    public FileAnalysisResponse(Long fileId, String fileName, String originalFileName, String fileUrl, 
                              String category, LocalDateTime uploadedAt, String jobId, String analysisStatus,
                              String analysisType, String detailedAnalysis, String errorMessage,
                              LocalDateTime analysisCreatedAt, LocalDateTime analysisUpdatedAt) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.fileUrl = fileUrl;
        this.category = category;
        this.uploadedAt = uploadedAt;
        this.jobId = jobId;
        this.analysisStatus = analysisStatus;
        this.analysisType = analysisType;
        this.detailedAnalysis = detailedAnalysis;
        this.errorMessage = errorMessage;
        this.analysisCreatedAt = analysisCreatedAt;
        this.analysisUpdatedAt = analysisUpdatedAt;
    }
    
    // Getters and Setters
    public Long getFileId() {
        return fileId;
    }
    
    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getOriginalFileName() {
        return originalFileName;
    }
    
    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
    
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
    
    public String getJobId() {
        return jobId;
    }
    
    public void setJobId(String jobId) {
        this.jobId = jobId;
    }
    
    public String getAnalysisStatus() {
        return analysisStatus;
    }
    
    public void setAnalysisStatus(String analysisStatus) {
        this.analysisStatus = analysisStatus;
    }
    
    public String getAnalysisType() {
        return analysisType;
    }
    
    public void setAnalysisType(String analysisType) {
        this.analysisType = analysisType;
    }
    
    public String getDetailedAnalysis() {
        return detailedAnalysis;
    }
    
    public void setDetailedAnalysis(String detailedAnalysis) {
        this.detailedAnalysis = detailedAnalysis;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public LocalDateTime getAnalysisCreatedAt() {
        return analysisCreatedAt;
    }
    
    public void setAnalysisCreatedAt(LocalDateTime analysisCreatedAt) {
        this.analysisCreatedAt = analysisCreatedAt;
    }
    
    public LocalDateTime getAnalysisUpdatedAt() {
        return analysisUpdatedAt;
    }
    
    public void setAnalysisUpdatedAt(LocalDateTime analysisUpdatedAt) {
        this.analysisUpdatedAt = analysisUpdatedAt;
    }
    
    @Override
    public String toString() {
        return "FileAnalysisResponse{" +
                "fileId=" + fileId +
                ", fileName='" + fileName + '\'' +
                ", originalFileName='" + originalFileName + '\'' +
                ", fileUrl='" + fileUrl + '\'' +
                ", category='" + category + '\'' +
                ", uploadedAt=" + uploadedAt +
                ", jobId='" + jobId + '\'' +
                ", analysisStatus='" + analysisStatus + '\'' +
                ", analysisType='" + analysisType + '\'' +
                ", detailedAnalysis='" + detailedAnalysis + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                ", analysisCreatedAt=" + analysisCreatedAt +
                ", analysisUpdatedAt=" + analysisUpdatedAt +
                '}';
    }
} 