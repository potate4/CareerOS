package com.careeros.backend.controller;

import com.careeros.backend.model.FileUpload;
import com.careeros.backend.payload.request.FileUploadRequest;
import com.careeros.backend.payload.response.FileUploadResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.FileUploadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
            FileUploadRequest request = new FileUploadRequest(file, description, category);
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
} 