package com.careeros.backend.payload.response;

public class FileUploadResponse {
    
    private String url;
    private String message;
    private boolean success;
    
    public FileUploadResponse() {}
    
    public FileUploadResponse(String url, String message, boolean success) {
        this.url = url;
        this.message = message;
        this.success = success;
    }
    
    public static FileUploadResponse success(String url) {
        return new FileUploadResponse(url, "File uploaded successfully", true);
    }
    
    public static FileUploadResponse error(String message) {
        return new FileUploadResponse(null, message, false);
    }
    
    public String getUrl() {
        return url;
    }
    
    public void setUrl(String url) {
        this.url = url;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
} 