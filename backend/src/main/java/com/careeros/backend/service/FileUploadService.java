package com.careeros.backend.service;

import com.careeros.backend.model.FileUpload;
import com.careeros.backend.payload.request.FileUploadRequest;
import com.careeros.backend.payload.response.FileUploadResponse;
import com.careeros.backend.repository.FileUploadRepository;
import com.careeros.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FileUploadService {
    
    @Autowired
    private FileUploadRepository fileUploadRepository;
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    @Value("${supabase.bucket}")
    private String bucketName;
    
    // Getter methods for Supabase configuration
    public String getSupabaseUrl() {
        return supabaseUrl;
    }
    
    public String getSupabaseKey() {
        return supabaseKey;
    }
    
    public String getBucketName() {
        return bucketName;
    }
    
    public FileUploadResponse uploadFile(FileUploadRequest request) {
        try {
            MultipartFile file = request.getFile();
            
            // Validate file
            if (file == null || file.isEmpty()) {
                return FileUploadResponse.error("File is empty");
            }
            
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return FileUploadResponse.error("User not authenticated");
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Generate unique filename with timestamp BEFORE extension
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                originalFilename = "unknown_file";
            }
            
            // Clean the filename to remove special characters
            String cleanFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
            
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String ext = getFileExtension(cleanFilename); // includes leading dot or empty
            String baseName = ext.isEmpty() ? cleanFilename : cleanFilename.substring(0, cleanFilename.length() - ext.length());
            String uniqueFilename = baseName + "_" + timestamp + ext;
            
            System.out.println("Original filename: " + originalFilename);
            System.out.println("Clean filename: " + cleanFilename);
            System.out.println("Unique filename: " + uniqueFilename);
            
            // Upload to Supabase
            String publicUrl = uploadToSupabase(file, uniqueFilename);
            
            // Save file upload record to database
            FileUpload fileUpload = new FileUpload(
                userId,
                uniqueFilename,
                originalFilename,
                publicUrl,
                file.getSize(),
                file.getContentType(),
                request.getDescription(),
                request.getCategory(),
                bucketName
            );
            
            FileUpload savedFileUpload = fileUploadRepository.save(fileUpload);
            
            // Return complete response with file upload data
            return FileUploadResponse.success(savedFileUpload);
            
        } catch (Exception e) {
            System.err.println("File upload error: " + e.getMessage());
            e.printStackTrace();
            return FileUploadResponse.error("File upload failed: " + e.getMessage());
        }
    }
    
    public FileUploadResponse uploadFile(MultipartFile file) {
        FileUploadRequest request = new FileUploadRequest(file);
        return uploadFile(request);
    }
    
    public List<FileUpload> getUserFileUploads(Long userId) {
        return fileUploadRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }
    
    public List<FileUpload> getUserFileUploadsByCategory(Long userId, String category) {
        return fileUploadRepository.findByUserIdAndCategory(userId, category);
    }
    
    public FileUpload getFileUploadById(Long fileId) {
        return fileUploadRepository.findById(fileId).orElse(null);
    }
    
    public FileUploadResponse deleteUserFile(Long fileId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return FileUploadResponse.error("User not authenticated");
            }
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            FileUpload fileUpload = fileUploadRepository.findById(fileId).orElse(null);
            if (fileUpload == null) {
                return FileUploadResponse.error("File not found");
            }
            if (!fileUpload.getUserId().equals(userId)) {
                return FileUploadResponse.error("Forbidden: cannot delete file that does not belong to you");
            }
            
            // Delete from Supabase first
            deleteFromSupabase(fileUpload.getFileName());
            // Delete DB record
            fileUploadRepository.delete(fileUpload);
            
            FileUploadResponse resp = new FileUploadResponse(true, "File deleted successfully");
            resp.setFileId(fileId.intValue());
            resp.setFileName(fileUpload.getFileName());
            resp.setFileUrl(fileUpload.getFileUrl());
            return resp;
        } catch (Exception e) {
            return FileUploadResponse.error("Failed to delete file: " + e.getMessage());
        }
    }
    
    private String uploadToSupabase(MultipartFile file, String filename) throws IOException {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // Prepare headers for Supabase Storage API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            headers.set("Cache-Control", "3600");
            
            // Read file bytes
            byte[] fileBytes = file.getBytes();
            
            // Create HTTP entity with file data
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(fileBytes, headers);
            
            // Construct Supabase storage upload URL - using the correct endpoint
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;
            
            System.out.println("Uploading to Supabase URL: " + uploadUrl);
            System.out.println("File size: " + fileBytes.length + " bytes");
            System.out.println("Supabase URL: " + supabaseUrl);
            System.out.println("Bucket: " + bucketName);
            System.out.println("API Key length: " + supabaseKey.length());
            
            // Upload file to Supabase
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            System.out.println("Supabase response status: " + response.getStatusCode());
            System.out.println("Supabase response body: " + response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                // Get public URL - using the correct public URL format
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
                System.out.println("Public URL: " + publicUrl);
                return publicUrl;
            } else {
                throw new IOException("Failed to upload file to Supabase: " + response.getStatusCode() + " - " + response.getBody());
            }
            
        } catch (Exception e) {
            System.err.println("Error uploading to Supabase: " + e.getMessage());
            System.err.println("Supabase URL: " + supabaseUrl);
            System.err.println("Bucket: " + bucketName);
            System.err.println("API Key length: " + supabaseKey.length());
            e.printStackTrace();
            throw new IOException("Error uploading to Supabase: " + e.getMessage());
        }
    }
    
    private void deleteFromSupabase(String filename) throws IOException {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;
            ResponseEntity<String> response = restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
            if (!response.getStatusCode().is2xxSuccessful() && response.getStatusCode() != HttpStatus.NO_CONTENT) {
                throw new IOException("Failed to delete from Supabase: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (Exception e) {
            throw new IOException("Error deleting from Supabase: " + e.getMessage());
        }
    }
    
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }
} 