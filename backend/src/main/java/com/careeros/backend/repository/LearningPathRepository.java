package com.careeros.backend.repository;

import com.careeros.backend.model.LearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningPathRepository extends JpaRepository<LearningPath, Long> {
    
    /**
     * Find active learning path for a specific user
     * @param userId The user ID
     * @return Optional containing the active learning path if found
     */
    @Query("SELECT lp FROM LearningPath lp WHERE lp.user.id = :userId AND lp.isActive = true")
    Optional<LearningPath> findActiveLearningPathByUserId(@Param("userId") Long userId);
    
    /**
     * Find all learning paths for a specific user
     * @param userId The user ID
     * @return List of learning paths for the user
     */
    @Query("SELECT lp FROM LearningPath lp WHERE lp.user.id = :userId ORDER BY lp.createdAt DESC")
    List<LearningPath> findAllByUserId(@Param("userId") Long userId);
    
    /**
     * Find learning paths by career goal
     * @param careerGoal The career goal to search for
     * @return List of learning paths with the specified career goal
     */
    List<LearningPath> findByCareerGoalContainingIgnoreCase(String careerGoal);
    
    /**
     * Find learning paths by current stage
     * @param currentStage The current learning stage
     * @return List of learning paths at the specified stage
     */
    List<LearningPath> findByCurrentStage(LearningPath.LearningStage currentStage);
    
    /**
     * Find learning paths with progress above a certain threshold
     * @param minProgress The minimum progress percentage
     * @return List of learning paths with progress above the threshold
     */
    @Query("SELECT lp FROM LearningPath lp WHERE lp.overallProgress >= :minProgress")
    List<LearningPath> findByProgressAbove(@Param("minProgress") Double minProgress);
    
    /**
     * Count active learning paths for a user
     * @param userId The user ID
     * @return Number of active learning paths
     */
    @Query("SELECT COUNT(lp) FROM LearningPath lp WHERE lp.user.id = :userId AND lp.isActive = true")
    Long countActiveLearningPathsByUserId(@Param("userId") Long userId);
    
    /**
     * Find learning paths created within a date range
     * @param startDate Start date for the range
     * @param endDate End date for the range
     * @return List of learning paths created within the date range
     */
    @Query("SELECT lp FROM LearningPath lp WHERE lp.createdAt BETWEEN :startDate AND :endDate")
    List<LearningPath> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                             @Param("endDate") java.time.LocalDateTime endDate);
} 