package com.careeros.backend.payload.response;

import com.careeros.backend.model.FileUpload;

public class FileUploadResponse {
    
    private boolean success;
    private String message;
    private Integer fileId;
    private String fileName;
    private String fileUrl;
    private String uploadDate;
    private String category;
    private String description;
    
    public FileUploadResponse() {}
    
    public FileUploadResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
    
    public static FileUploadResponse success(String fileUrl) {
        FileUploadResponse response = new FileUploadResponse(true, "File uploaded successfully");
        response.setFileUrl(fileUrl);
        return response;
    }
    
    public static FileUploadResponse success(FileUpload fileUpload) {
        FileUploadResponse response = new FileUploadResponse(true, "File uploaded successfully");
        response.setFileId(fileUpload.getId().intValue());
        response.setFileName(fileUpload.getFileName());
        response.setFileUrl(fileUpload.getFileUrl());
        response.setUploadDate(fileUpload.getUploadedAt().toString());
        response.setCategory(fileUpload.getCategory());
        response.setDescription(fileUpload.getDescription());
        return response;
    }
    
    public static FileUploadResponse error(String message) {
        return new FileUploadResponse(false, message);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getFileId() {
        return fileId;
    }
    
    public void setFileId(Integer fileId) {
        this.fileId = fileId;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getUploadDate() {
        return uploadDate;
    }
    
    public void setUploadDate(String uploadDate) {
        this.uploadDate = uploadDate;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
} 