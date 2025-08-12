package com.careeros.backend.controller;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.FuturecastRequest;
import com.careeros.backend.payload.request.UpdateMilestoneRequest;
import com.careeros.backend.payload.response.MessageResponse;
import com.careeros.backend.repository.UserProfileRepository;
import com.careeros.backend.security.UserDetailsImpl;
import com.careeros.backend.service.FuturecastService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/futurecast")
public class FuturecastController {
    
    @Autowired
    private FuturecastService futurecastService;
    
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    /**
     * Generate a new career roadmap
     */
    @PostMapping("/generate-roadmap")
    public ResponseEntity<?> generateRoadmap(@Valid @RequestBody FuturecastRequest request) {
        try {
            // Get current user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Set the user ID in the request
            request.setUserId(userId.intValue());
            
            // Generate roadmap
            FuturecastRoadmap roadmap = futurecastService.generateRoadmap(userId, request);
            
            return ResponseEntity.ok(Map.of(
                "message", "Roadmap generated successfully",
                "roadmapId", roadmap.getId(),
                "careerGoal", roadmap.getCareerGoal(),
                "timelineYears", roadmap.getTimelineYears(),
                "confidence", roadmap.getConfidence(),
                "createdAt", roadmap.getCreatedAt()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to generate roadmap: " + e.getMessage()));
        }
    }
    
    /**
     * Get user's roadmaps with pagination
     */
    @GetMapping("/roadmaps")
    public ResponseEntity<?> getUserRoadmaps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Create pageable
            Sort sort = sortDir.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Get roadmaps
            Page<FuturecastRoadmap> roadmaps = futurecastService.getUserRoadmaps(userId, pageable);
            
            return ResponseEntity.ok(Map.of(
                "roadmaps", roadmaps.getContent(),
                "currentPage", roadmaps.getNumber(),
                "totalItems", roadmaps.getTotalElements(),
                "totalPages", roadmaps.getTotalPages(),
                "hasNext", roadmaps.hasNext(),
                "hasPrevious", roadmaps.hasPrevious()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to fetch roadmaps: " + e.getMessage()));
        }
    }
    
    /**
     * Get a specific roadmap by ID
     */
    @GetMapping("/roadmaps/{roadmapId}")
    public ResponseEntity<?> getRoadmapById(@PathVariable Long roadmapId) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Get roadmap
            FuturecastRoadmap roadmap = futurecastService.getRoadmapById(roadmapId, userId);
            
            return ResponseEntity.ok(roadmap);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to fetch roadmap: " + e.getMessage()));
        }
    }
    
    /**
     * Select a career path within a roadmap
     */
    @PutMapping("/roadmaps/{roadmapId}/paths/{pathId}/select")
    public ResponseEntity<?> selectCareerPath(
            @PathVariable Long roadmapId,
            @PathVariable String pathId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Select path
            CareerPath selectedPath = futurecastService.selectCareerPath(roadmapId, pathId, userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Career path selected successfully",
                "selectedPath", Map.of(
                    "id", selectedPath.getId(),
                    "pathId", selectedPath.getPathId(),
                    "description", selectedPath.getDescription(),
                    "isSelected", selectedPath.getIsSelected()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to select career path: " + e.getMessage()));
        }
    }
    
    /**
     * Update milestone progress
     */
    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<?> updateMilestoneProgress(
            @PathVariable Long milestoneId,
            @Valid @RequestBody UpdateMilestoneRequest requestBody) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Update milestone
            Milestone updatedMilestone = futurecastService.updateMilestoneProgress(
                milestoneId, requestBody.getIsCompleted(), requestBody.getUserNotes(), userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Milestone updated successfully",
                "milestone", Map.of(
                    "id", updatedMilestone.getId(),
                    "title", updatedMilestone.getTitle(),
                    "isCompleted", updatedMilestone.getIsCompleted(),
                    "completedAt", updatedMilestone.getCompletedAt(),
                    "userNotes", updatedMilestone.getUserNotes()
                )
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update milestone: " + e.getMessage()));
        }
    }

    /**
     * Mark milestone complete (shortcut)
     */
    @PostMapping("/milestones/{milestoneId}/complete")
    public ResponseEntity<?> completeMilestone(@PathVariable Long milestoneId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            Milestone updated = futurecastService.updateMilestoneProgress(milestoneId, true, null, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Milestone marked complete",
                "milestoneId", updated.getId(),
                "completedAt", updated.getCompletedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to complete milestone: " + e.getMessage()));
        }
    }

    /**
     * Mark milestone incomplete (shortcut)
     */
    @PostMapping("/milestones/{milestoneId}/uncomplete")
    public ResponseEntity<?> uncompleteMilestone(@PathVariable Long milestoneId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            Milestone updated = futurecastService.updateMilestoneProgress(milestoneId, false, null, userId);
            return ResponseEntity.ok(Map.of(
                "message", "Milestone marked incomplete",
                "milestoneId", updated.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to uncomplete milestone: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a roadmap
     */
    @DeleteMapping("/roadmaps/{roadmapId}")
    public ResponseEntity<?> deleteRoadmap(@PathVariable Long roadmapId) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Delete roadmap
            futurecastService.deleteRoadmap(roadmapId, userId);
            
            return ResponseEntity.ok(new MessageResponse("Roadmap deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to delete roadmap: " + e.getMessage()));
        }
    }
    
    /**
     * Get user profile for futurecast
     */
    @GetMapping("/user-profile")
    public ResponseEntity<?> getUserProfile() {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Get user profile
            UserProfile userProfile = userProfileRepository.findByUserId(userId).orElse(null);
            
            if (userProfile == null) {
                return ResponseEntity.ok(Map.of(
                    "message", "No profile found",
                    "hasProfile", false
                ));
            }
            
            return ResponseEntity.ok(Map.of(
                "hasProfile", true,
                "profile", userProfile
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to fetch user profile: " + e.getMessage()));
        }
    }
    
    /**
     * Create or update user profile
     */
    @PostMapping("/user-profile")
    public ResponseEntity<?> createOrUpdateUserProfile(@RequestBody UserProfile profileData) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Find existing profile or create new one
            UserProfile userProfile = userProfileRepository.findByUserId(userId)
                    .orElse(new UserProfile());
            
            // Update profile data
            if (userProfile.getId() == null) {
                // New profile - set user
                User user = new User();
                user.setId(userId);
                userProfile.setUser(user);
            }
            
            // Copy data from request (you can customize which fields to update)
            if (profileData.getCurrentRole() != null) {
                userProfile.setCurrentRole(profileData.getCurrentRole());
            }
            if (profileData.getEducation() != null) {
                userProfile.setEducation(profileData.getEducation());
            }
            if (profileData.getYearsOfExperience() != null) {
                userProfile.setYearsOfExperience(profileData.getYearsOfExperience());
            }
            if (profileData.getCurrentSalary() != null) {
                userProfile.setCurrentSalary(profileData.getCurrentSalary());
            }
            if (profileData.getSkills() != null) {
                userProfile.setSkills(profileData.getSkills());
            }
            if (profileData.getLocation() != null) {
                userProfile.setLocation(profileData.getLocation());
            }
            if (profileData.getIndustry() != null) {
                userProfile.setIndustry(profileData.getIndustry());
            }
            if (profileData.getCertifications() != null) {
                userProfile.setCertifications(profileData.getCertifications());
            }
            if (profileData.getWorkEnvironment() != null) {
                userProfile.setWorkEnvironment(profileData.getWorkEnvironment());
            }
            if (profileData.getLearningStyle() != null) {
                userProfile.setLearningStyle(profileData.getLearningStyle());
            }
            if (profileData.getRiskTolerance() != null) {
                userProfile.setRiskTolerance(profileData.getRiskTolerance());
            }
            
            // Save profile
            UserProfile savedProfile = userProfileRepository.save(userProfile);
            
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully",
                "profile", savedProfile
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to update profile: " + e.getMessage()));
        }
    }
    
    /**
     * Get market data for a career goal
     */
    @GetMapping("/market-data")
    public ResponseEntity<?> getMarketData(
            @RequestParam String careerGoal,
            @RequestParam(required = false) String industry) {
        try {
            // Get market data
            Map<String, Object> marketData = futurecastService.getMarketData(careerGoal, industry);
            
            return ResponseEntity.ok(Map.of(
                "marketData", marketData,
                "timestamp", LocalDateTime.now()
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to fetch market data: " + e.getMessage()));
        }
    }
    
    /**
     * Get roadmap progress analytics
     */
    @GetMapping("/roadmaps/{roadmapId}/progress")
    public ResponseEntity<?> getRoadmapProgress(@PathVariable Long roadmapId) {
        try {
            // Get current user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            
            // Get roadmap to verify access
            FuturecastRoadmap roadmap = futurecastService.getRoadmapById(roadmapId, userId);
            
            // Calculate progress statistics
            Map<String, Object> progress = new HashMap<>();
            
            // Count milestones
            int totalMilestones = 0;
            int completedMilestones = 0;
            
            for (CareerPath path : roadmap.getPaths()) {
                for (Milestone milestone : path.getMilestones()) {
                    totalMilestones++;
                    if (milestone.getIsCompleted()) {
                        completedMilestones++;
                    }
                }
            }
            
            double overallProgress = totalMilestones > 0 ? 
                (double) completedMilestones / totalMilestones * 100 : 0;
            
            progress.put("totalMilestones", totalMilestones);
            progress.put("completedMilestones", completedMilestones);
            progress.put("overallProgress", Math.round(overallProgress * 100.0) / 100.0);
            progress.put("roadmapId", roadmapId);
            
            return ResponseEntity.ok(progress);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Failed to fetch progress: " + e.getMessage()));
        }
    }
} 