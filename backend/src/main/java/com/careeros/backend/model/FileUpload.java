package com.careeros.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_uploads")
public class FileUpload {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "file_name", nullable = false)
    private String fileName;
    
    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;
    
    @Column(name = "file_url", nullable = false)
    private String fileUrl;
    
    @Column(name = "file_size")
    private Long fileSize;
    
    @Column(name = "content_type")
    private String contentType;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "category")
    private String category;
    
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;
    
    @Column(name = "bucket_name")
    private String bucketName;
    
    @Column(name = "module_id")
    private Long moduleId;
    
    @Column(name = "indexing_status")
    private String indexingStatus = "not_indexed"; // not_indexed, processing, completed, failed
    
    @Column(name = "indexed_at")
    private LocalDateTime indexedAt;
    
    public FileUpload() {}
    
    public FileUpload(Long userId, String fileName, String originalFileName, String fileUrl, 
                     Long fileSize, String contentType, String description, String category, String bucketName) {
        this.userId = userId;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.fileUrl = fileUrl;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.description = description;
        this.category = category;
        this.bucketName = bucketName;
        this.uploadedAt = LocalDateTime.now();
        this.indexingStatus = "not_indexed";
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
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
    
    public String getBucketName() {
        return bucketName;
    }
    
    public void setBucketName(String bucketName) {
        this.bucketName = bucketName;
    }
    
    public Long getModuleId() {
        return moduleId;
    }
    
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }
    
    public String getIndexingStatus() {
        return indexingStatus;
    }
    
    public void setIndexingStatus(String indexingStatus) {
        this.indexingStatus = indexingStatus;
    }
    
    public LocalDateTime getIndexedAt() {
        return indexedAt;
    }
    
    public void setIndexedAt(LocalDateTime indexedAt) {
        this.indexedAt = indexedAt;
    }
} 