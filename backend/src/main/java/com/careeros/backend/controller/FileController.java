package com.careeros.backend.controller;

import com.careeros.backend.model.FileUpload;
import com.careeros.backend.payload.request.FileUploadRequest;
import com.careeros.backend.payload.response.FileUploadResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.FileUploadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @PostMapping("/file-upload-and-get-url")
    public ResponseEntity<FileUploadResponse> uploadFileAndGetUrl(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category) {
        
        try {
            System.out.println("Received file upload request:");
            System.out.println("File name: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());
            System.out.println("Content type: " + file.getContentType());
            System.out.println("Description: " + description);
            System.out.println("Category: " + category);
            
            FileUploadRequest request = new FileUploadRequest(file, description, category);
            FileUploadResponse response = fileUploadService.uploadFile(request);
            
            if (response.isSuccess()) {
                System.out.println("File upload successful: " + response.getFileUrl());
                return ResponseEntity.ok(response);
            } else {
                System.out.println("File upload failed: " + response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("File upload exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(FileUploadResponse.error("File upload failed: " + e.getMessage()));
        }
    }
    
    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(@Valid FileUploadRequest request) {
        try {
            FileUploadResponse response = fileUploadService.uploadFile(request);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(FileUploadResponse.error("File upload failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my-uploads")
    public ResponseEntity<?> getMyFileUploads() {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest()
                        .body(FileUploadResponse.error("User not authenticated"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            List<FileUpload> fileUploads = fileUploadService.getUserFileUploads(userId);
            return ResponseEntity.ok(fileUploads);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(FileUploadResponse.error("Failed to retrieve file uploads: " + e.getMessage()));
        }
    }
    
    @GetMapping("/my-uploads/{category}")
    public ResponseEntity<?> getMyFileUploadsByCategory(@PathVariable String category) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest()
                        .body(FileUploadResponse.error("User not authenticated"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            List<FileUpload> fileUploads = fileUploadService.getUserFileUploadsByCategory(userId, category);
            return ResponseEntity.ok(fileUploads);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(FileUploadResponse.error("Failed to retrieve file uploads: " + e.getMessage()));
        }
    }
    
    @GetMapping("/upload/{fileId}")
    public ResponseEntity<?> getFileUploadById(@PathVariable Long fileId) {
        try {
            FileUpload fileUpload = fileUploadService.getFileUploadById(fileId);
            
            if (fileUpload == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(fileUpload);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(FileUploadResponse.error("Failed to retrieve file upload: " + e.getMessage()));
        }
    }

    @DeleteMapping("/upload/{fileId}")
    public ResponseEntity<FileUploadResponse> deleteFileUpload(@PathVariable Long fileId) {
        try {
            FileUploadResponse response = fileUploadService.deleteUserFile(fileId);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(FileUploadResponse.error("Failed to delete file upload: " + e.getMessage()));
        }
    }
    
    @GetMapping("/test-supabase")
    public ResponseEntity<?> testSupabaseConnection() {
        try {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Supabase configuration loaded",
                "url", fileUploadService.getSupabaseUrl(),
                "bucket", fileUploadService.getBucketName(),
                "keyLength", fileUploadService.getSupabaseKey().length()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Supabase configuration error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/test-supabase-bucket")
    public ResponseEntity<?> testSupabaseBucket() {
      try {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + fileUploadService.getSupabaseKey());
        headers.set("apikey", fileUploadService.getSupabaseKey());

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        // Test bucket access by trying to list objects
        String testUrl = fileUploadService.getSupabaseUrl() + "/storage/v1/object/list/" + fileUploadService.getBucketName();

        ResponseEntity<String> response = restTemplate.exchange(
            testUrl,
            HttpMethod.GET,
            requestEntity,
            String.class
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Supabase bucket accessible",
            "status", response.getStatusCode().toString(),
            "response", response.getBody()
        ));

      } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
            "success", false,
            "message", "Supabase bucket access failed: " + e.getMessage(),
            "error", e.getClass().getSimpleName()
        ));
      }
    }
} 