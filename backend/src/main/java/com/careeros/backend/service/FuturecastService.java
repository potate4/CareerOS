package com.careeros.backend.service;

import com.careeros.backend.model.*;
import com.careeros.backend.payload.request.FuturecastRequest;
import com.careeros.backend.payload.response.FuturecastResponse;
import com.careeros.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class FuturecastService {
    
    private static final Logger logger = LoggerFactory.getLogger(FuturecastService.class);
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private FuturecastRoadmapRepository roadmapRepository;
    
    @Autowired
    private CareerPathRepository careerPathRepository;
    
    @Autowired
    private MilestoneRepository milestoneRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserProfileRepository userProfileRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Generate a new career roadmap using AI services
     */
    public FuturecastRoadmap generateRoadmap(Long userId, FuturecastRequest request) {
        try {
            // Get user and profile
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElse(null);
            
            // Prepare request for AI service
            Map<String, Object> aiRequest = prepareAIRequest(request, userProfile);
            
            // Call AI service
            FuturecastResponse aiResponse = callAIService(aiRequest);
            
            // Save roadmap to database
            FuturecastRoadmap savedRoadmap = saveRoadmapFromAIResponse(user, request, aiResponse);
            
            logger.info("Generated roadmap for user {} with ID {}", userId, savedRoadmap.getId());
            return savedRoadmap;
            
        } catch (Exception e) {
            logger.error("Failed to generate roadmap for user {}: {}", userId, e.getMessage());
            throw new RuntimeException("Failed to generate career roadmap: " + e.getMessage());
        }
    }
    
    /**
     * Get user's roadmaps with pagination
     */
    public Page<FuturecastRoadmap> getUserRoadmaps(Long userId, Pageable pageable) {
        return roadmapRepository.findByUserId(userId, pageable);
    }
    
    /**
     * Get a specific roadmap by ID
     */
    public FuturecastRoadmap getRoadmapById(Long roadmapId, Long userId) {
        FuturecastRoadmap roadmap = roadmapRepository.findById(roadmapId)
            .orElseThrow(() -> new RuntimeException("Roadmap not found"));
        
        // Check if user owns this roadmap or if it's public
        if (!roadmap.getUser().getId().equals(userId) && !roadmap.getIsPublic()) {
            throw new RuntimeException("Access denied to this roadmap");
        }
        
        // Update last accessed time
        roadmap.setLastAccessedAt(LocalDateTime.now());
        roadmapRepository.save(roadmap);
        
        return roadmap;
    }
    
    /**
     * Select a career path within a roadmap
     */
    public CareerPath selectCareerPath(Long roadmapId, String pathId, Long userId) {
        FuturecastRoadmap roadmap = getRoadmapById(roadmapId, userId);
        
        // Deselect all paths for this roadmap
        List<CareerPath> allPaths = careerPathRepository.findByRoadmapId(roadmapId);
        allPaths.forEach(path -> path.setIsSelected(false));
        careerPathRepository.saveAll(allPaths);
        
        // Select the specific path
        CareerPath selectedPath = careerPathRepository.findByRoadmapIdAndPathId(roadmapId, pathId)
            .orElseThrow(() -> new RuntimeException("Career path not found"));
        
        selectedPath.setIsSelected(true);
        selectedPath.setSelectionReason("User selected this path");
        
        return careerPathRepository.save(selectedPath);
    }
    
    /**
     * Update milestone progress
     */
    public Milestone updateMilestoneProgress(Long milestoneId, Boolean isCompleted, String userNotes, Long userId) {
        Milestone milestone = milestoneRepository.findById(milestoneId)
            .orElseThrow(() -> new RuntimeException("Milestone not found"));
        
        // Check if user owns this milestone
        if (!milestone.getCareerPath().getRoadmap().getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied to this milestone");
        }
        
        milestone.setIsCompleted(isCompleted);
        milestone.setUserNotes(userNotes);
        
        if (isCompleted) {
            milestone.setCompletedAt(LocalDateTime.now());
        } else {
            milestone.setCompletedAt(null);
        }
        
        Milestone savedMilestone = milestoneRepository.save(milestone);
        
        // Update career path completion percentage
        updateCareerPathProgress(milestone.getCareerPath().getId());
        
        return savedMilestone;
    }
    
    /**
     * Get market data (dummy implementation - will be replaced with real RAG)
     */
    public Map<String, Object> getMarketData(String careerGoal, String industry) {
        // TODO: Replace with real RAG-based market data retrieval
        Map<String, Object> marketData = new HashMap<>();
        marketData.put("averageSalaryGrowth", 0.08);
        marketData.put("jobDemandTrend", "increasing");
        marketData.put("industryGrowthRate", 0.10);
        marketData.put("competitionLevel", "medium");
        marketData.put("emergingSkills", Arrays.asList("AI/ML", "Cloud Computing", "Data Analysis"));
        marketData.put("decliningSkills", Arrays.asList("Legacy Systems", "Manual Testing"));
        
        logger.info("Retrieved market data for career goal: {} in industry: {}", careerGoal, industry);
        return marketData;
    }
    
    /**
     * Delete a roadmap
     */
    public void deleteRoadmap(Long roadmapId, Long userId) {
        FuturecastRoadmap roadmap = getRoadmapById(roadmapId, userId);
        roadmapRepository.delete(roadmap);
        logger.info("Deleted roadmap {} for user {}", roadmapId, userId);
    }
    
    // Private helper methods
    
    private Map<String, Object> prepareAIRequest(FuturecastRequest request, UserProfile userProfile) {
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("careerGoal", request.getCareerGoal());
        aiRequest.put("timelineYears", request.getTimelineYears());
        aiRequest.put("userId", request.getUserId());
        
        // Prepare preferences
        Map<String, Object> preferences = request.getPreferences() != null ? 
            request.getPreferences() : new HashMap<>();
        aiRequest.put("preferences", preferences);
        
        // Prepare user profile from database or request
        Map<String, Object> userProfileData = new HashMap<>();
        if (userProfile != null) {
            userProfileData.put("currentRole", userProfile.getCurrentRole());
            userProfileData.put("skills", userProfile.getSkills() != null ? userProfile.getSkills() : new ArrayList<>());
            userProfileData.put("education", userProfile.getEducation());
            userProfileData.put("yearsOfExperience", userProfile.getYearsOfExperience());
            userProfileData.put("currentSalary", userProfile.getCurrentSalary());
            userProfileData.put("certifications", userProfile.getCertifications());
            userProfileData.put("portfolioProjects", userProfile.getPortfolioProjects());
            userProfileData.put("strengths", userProfile.getStrengths());
            userProfileData.put("weaknesses", userProfile.getWeaknesses());
        } else if (request.getUserProfile() != null) {
            userProfileData = request.getUserProfile();
        }
        aiRequest.put("userProfile", userProfileData);
        
        // Get market data
        String industry = userProfile != null ? userProfile.getIndustry() : "Technology";
        Map<String, Object> marketData = request.getMarketData() != null ? 
            request.getMarketData() : getMarketData(request.getCareerGoal(), industry);
        aiRequest.put("marketData", marketData);
        
        return aiRequest;
    }
    
    private FuturecastResponse callAIService(Map<String, Object> request) {
        try {
            String url = aiServiceUrl + "/api/v1/futurecast/generate-roadmap";
            logger.info("Calling AI service for roadmap generation: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ResponseEntity<FuturecastResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                FuturecastResponse.class
            );
            
            logger.info("AI roadmap generation completed successfully");
            return response.getBody();
            
        } catch (HttpClientErrorException e) {
            logger.error("AI service error: {}", e.getMessage());
            throw new RuntimeException("AI roadmap generation failed: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error calling AI service: {}", e.getMessage());
            throw new RuntimeException("AI service unavailable");
        }
    }
    
    @SuppressWarnings("unchecked")
    private FuturecastRoadmap saveRoadmapFromAIResponse(User user, FuturecastRequest request, FuturecastResponse aiResponse) {
        try {
            // Create and save roadmap
            FuturecastRoadmap roadmap = new FuturecastRoadmap();
            roadmap.setUser(user);
            roadmap.setCareerGoal(request.getCareerGoal());
            roadmap.setTimelineYears(request.getTimelineYears());
            roadmap.setExplanation(aiResponse.getExplanation());
            roadmap.setConfidence(aiResponse.getConfidence());
            
            // Store request data as JSON
            roadmap.setPreferences(request.getPreferences());
            roadmap.setUserProfileSnapshot(request.getUserProfile());
            roadmap.setMarketData(request.getMarketData());
            
            // Extract market insights and recommended path from AI response
            Map<String, Object> roadmapData = aiResponse.getRoadmap();
            if (roadmapData != null) {
                roadmap.setMarketInsights((Map<String, Object>) roadmapData.get("marketInsights"));
                roadmap.setRecommendedPathId((String) roadmapData.get("recommendedPath"));
            }
            
            FuturecastRoadmap savedRoadmap = roadmapRepository.save(roadmap);
            
            // Save career paths and milestones
            if (roadmapData != null && roadmapData.get("paths") != null) {
                List<Map<String, Object>> paths = (List<Map<String, Object>>) roadmapData.get("paths");
                
                for (Map<String, Object> pathData : paths) {
                    CareerPath careerPath = new CareerPath();
                    careerPath.setRoadmap(savedRoadmap);
                    careerPath.setPathId((String) pathData.get("pathId"));
                    careerPath.setDescription((String) pathData.get("description"));
                    
                    // Set difficulty and risk level
                    String difficulty = (String) pathData.get("difficulty");
                    if (difficulty != null) {
                        careerPath.setDifficulty(CareerPath.Difficulty.valueOf(difficulty.toUpperCase()));
                    }
                    
                    String riskLevel = (String) pathData.get("riskLevel");
                    if (riskLevel != null) {
                        careerPath.setRiskLevel(CareerPath.RiskLevel.valueOf(riskLevel.toUpperCase()));
                    }
                    
                    careerPath.setProbability((Double) pathData.get("probability"));
                    
                    Object totalInvestment = pathData.get("totalInvestment");
                    if (totalInvestment instanceof Number) {
                        careerPath.setTotalInvestment(BigDecimal.valueOf(((Number) totalInvestment).doubleValue()));
                    }
                    
                    List<String> altOptions = (List<String>) pathData.get("alternativeOptions");
                    careerPath.setAlternativeOptions(altOptions);
                    
                    // Check if this is the recommended path
                    boolean isRecommended = careerPath.getPathId().equals(savedRoadmap.getRecommendedPathId());
                    careerPath.setIsSelected(isRecommended);
                    
                    CareerPath savedPath = careerPathRepository.save(careerPath);
                    
                    // Save milestones
                    List<Map<String, Object>> milestones = (List<Map<String, Object>>) pathData.get("milestones");
                    if (milestones != null) {
                        for (Map<String, Object> milestoneData : milestones) {
                            Milestone milestone = new Milestone();
                            milestone.setCareerPath(savedPath);
                            milestone.setYear((Integer) milestoneData.get("year"));
                            milestone.setTitle((String) milestoneData.get("title"));
                            
                            Object expectedSalary = milestoneData.get("expectedSalary");
                            if (expectedSalary instanceof Number) {
                                milestone.setExpectedSalary(BigDecimal.valueOf(((Number) expectedSalary).doubleValue()));
                            }
                            
                            milestone.setSkillsToLearn((List<String>) milestoneData.get("skillsToLearn"));
                            milestone.setNotes((String) milestoneData.get("notes"));
                            milestone.setEstimatedTimeToComplete((String) milestoneData.get("estimatedTimeToComplete"));
                            milestone.setPrerequisites((List<String>) milestoneData.get("prerequisites"));
                            milestone.setResources((List<String>) milestoneData.get("resources"));
                            
                            milestoneRepository.save(milestone);
                        }
                    }
                }
            }
            
            return savedRoadmap;
            
        } catch (Exception e) {
            logger.error("Error saving roadmap from AI response: {}", e.getMessage());
            throw new RuntimeException("Failed to save roadmap: " + e.getMessage());
        }
    }
    
    private void updateCareerPathProgress(Long careerPathId) {
        Long totalMilestones = milestoneRepository.countByCareerPathId(careerPathId);
        Long completedMilestones = milestoneRepository.countCompletedByCareerPathId(careerPathId);
        
        if (totalMilestones > 0) {
            int percentage = (int) ((completedMilestones * 100) / totalMilestones);
            CareerPath careerPath = careerPathRepository.findById(careerPathId).orElse(null);
            if (careerPath != null) {
                careerPath.setCompletionPercentage(percentage);
                careerPathRepository.save(careerPath);
            }
        }
    }
} 