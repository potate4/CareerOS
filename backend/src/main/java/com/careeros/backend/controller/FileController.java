package com.careeros.backend.controller;

import com.careeros.backend.model.FileUpload;
import com.careeros.backend.payload.request.FileUploadRequest;
import com.careeros.backend.payload.response.FileUploadResponse;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.FileUploadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/files")
public class FileController {
    
    @Autowired
    private FileUploadService fileUploadService;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    private final WebClient webClient;
    
    public FileController() {
        this.webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024))
            .build();
    }
    
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
    
    /**
     * Bulk upload files for a learning module
     */
    @PostMapping("/bulk-upload-module")
    public ResponseEntity<?> bulkUploadModuleFiles(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("moduleId") Long moduleId) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "User not authenticated"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            System.out.println("📁 Bulk uploading " + files.size() + " files for module: " + moduleId + ", user: " + userId);
            
            List<FileUploadResponse> responses = fileUploadService.bulkUploadModuleFiles(files, moduleId, userId);
            
            long successCount = responses.stream().filter(FileUploadResponse::isSuccess).count();
            long failCount = responses.size() - successCount;
            
            System.out.println("✅ Bulk upload completed - Success: " + successCount + ", Failed: " + failCount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Bulk upload completed",
                "totalFiles", files.size(),
                "successCount", successCount,
                "failCount", failCount,
                "results", responses
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Bulk upload failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Bulk upload failed: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Get files for a specific learning module
     */
    @GetMapping("/module/{moduleId}")
    public ResponseEntity<?> getModuleFiles(@PathVariable Long moduleId) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "User not authenticated"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            List<FileUpload> moduleFiles = fileUploadService.getModuleFiles(userId, moduleId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "files", moduleFiles,
                "count", moduleFiles.size()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to get module files: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Update indexing status of a file
     */
    @PostMapping("/update-indexing-status/{fileId}")
    public ResponseEntity<?> updateIndexingStatus(
            @PathVariable Long fileId,
            @RequestParam("status") String status) {
        try {
            FileUpload updatedFile = fileUploadService.updateIndexingStatus(fileId, status);
            
            if (updatedFile != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Indexing status updated successfully",
                    "file", updatedFile
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to update indexing status: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Index a file using the Python AI service
     */
    @PostMapping("/index-file/{fileId}")
    public ResponseEntity<?> indexFile(@PathVariable Long fileId) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || 
                authentication.getName().equals("anonymousUser")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "User not authenticated"));
            }
            
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Get file information
            FileUpload fileUpload = fileUploadService.getFileUploadById(fileId);
            if (fileUpload == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Verify file belongs to user
            if (!fileUpload.getUserId().equals(userId)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "File does not belong to user"
                ));
            }
            
            System.out.println("📄 Starting indexing for file: " + fileUpload.getOriginalFileName() + " (ID: " + fileId + ")");
            
            // Update status to processing
            fileUploadService.updateIndexingStatus(fileId, "processing");
            
            // Prepare request for Python AI service
            Map<String, Object> indexRequest = new HashMap<>();
            indexRequest.put("user_id", userId.intValue());
            indexRequest.put("file_id", fileId.toString());
            indexRequest.put("file_name", fileUpload.getOriginalFileName());
            indexRequest.put("file_type", fileUpload.getContentType());
            indexRequest.put("file_url", fileUpload.getFileUrl());
            indexRequest.put("module_id", fileUpload.getModuleId());
            
            // Call Python AI service asynchronously
            webClient.post()
                .uri(aiServiceUrl + "/api/v1/learning-path/index-file")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(indexRequest)
                .retrieve()
                .bodyToMono(Map.class)
                .subscribe(
                    response -> {
                        System.out.println("✅ File indexing started successfully for file ID: " + fileId);
                    },
                    error -> {
                        System.err.println("❌ File indexing request failed for file ID: " + fileId + " - " + error.getMessage());
                        fileUploadService.updateIndexingStatus(fileId, "failed");
                    }
                );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "File indexing started",
                "fileId", fileId,
                "status", "processing"
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Failed to start file indexing: " + e.getMessage());
            e.printStackTrace();
            fileUploadService.updateIndexingStatus(fileId, "failed");
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to start file indexing: " + e.getMessage()
            ));
        }
    }
    
    /**
     * Callback endpoint for Python AI service to update file indexing status
     */
    @PostMapping("/indexing-callback")
    public ResponseEntity<?> handleIndexingCallback(@RequestBody Map<String, Object> callbackData) {
        try {
            String fileIdStr = (String) callbackData.get("fileId");
            String status = (String) callbackData.get("status");
            String errorMessage = (String) callbackData.get("errorMessage");
            String completedAt = (String) callbackData.get("completedAt");
            
            if (fileIdStr == null || status == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Missing required fields: fileId or status"
                ));
            }
            
            Long fileId = Long.parseLong(fileIdStr);
            
            System.out.println("📥 Received indexing callback for file ID: " + fileId + ", status: " + status);
            
            // Update file status in database
            FileUpload updatedFile = fileUploadService.updateIndexingStatus(fileId, status);
            
            if (updatedFile != null) {
                if ("completed".equals(status)) {
                    System.out.println("✅ File indexing completed successfully for file ID: " + fileId);
                } else if ("failed".equals(status)) {
                    System.out.println("❌ File indexing failed for file ID: " + fileId + 
                        (errorMessage != null ? " - " + errorMessage : ""));
                }
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Status updated successfully",
                    "fileId", fileId,
                    "status", status
                ));
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Invalid file ID format"
            ));
        } catch (Exception e) {
            System.err.println("❌ Error handling indexing callback: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to process callback: " + e.getMessage()
            ));
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