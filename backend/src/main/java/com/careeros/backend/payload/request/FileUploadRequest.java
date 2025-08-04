package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public class FileUploadRequest {
    
    @NotNull(message = "File is required")
    private MultipartFile file;
    
    private String description;
    private String category;
    
    public FileUploadRequest() {}
    
    public FileUploadRequest(MultipartFile file) {
        this.file = file;
    }
    
    public FileUploadRequest(MultipartFile file, String description, String category) {
        this.file = file;
        this.description = description;
        this.category = category;
    }
    
    public MultipartFile getFile() {
        return file;
    }
    
    public void setFile(MultipartFile file) {
        this.file = file;
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
} 