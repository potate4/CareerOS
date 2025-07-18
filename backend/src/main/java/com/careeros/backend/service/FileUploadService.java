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
            
            // Generate unique filename with timestamp
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
            String uniqueFilename = originalFilename + "_" + timestamp;
            
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
            
            fileUploadRepository.save(fileUpload);
            
            return FileUploadResponse.success(publicUrl);
            
        } catch (Exception e) {
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
    
    private String uploadToSupabase(MultipartFile file, String filename) throws IOException {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // Prepare headers for Supabase API
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.set("Authorization", "Bearer " + supabaseKey);
            headers.set("apikey", supabaseKey);
            
            // Read file bytes
            byte[] fileBytes = file.getBytes();
            
            // Create HTTP entity with file data
            HttpEntity<byte[]> requestEntity = new HttpEntity<>(fileBytes, headers);
            
            // Construct Supabase storage upload URL
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filename;
            
            // Upload file to Supabase
            ResponseEntity<String> response = restTemplate.exchange(
                uploadUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
                // Get public URL
                String publicUrl = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + filename;
                return publicUrl;
            } else {
                throw new IOException("Failed to upload file to Supabase: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            throw new IOException("Error uploading to Supabase: " + e.getMessage());
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