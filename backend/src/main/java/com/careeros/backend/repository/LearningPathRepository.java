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
     * Find all learning paths for a specific user ordered by creation date descending
     * @param userId The user ID
     * @return List of learning paths for the user ordered by creation date
     */
    @Query("SELECT lp FROM LearningPath lp WHERE lp.user.id = :userId ORDER BY lp.createdAt DESC")
    List<LearningPath> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    /**
     * Find learning paths by career goal
     * @param careerGoal The career goal to search for
     * @return List of learning paths with the specified career goal
     */
    List<LearningPath> findByCareerGoalContainingIgnoreCase(String careerGoal);
    
    /**
     * Count active learning paths for a user
     * @param userId The user ID
     * @return Number of active learning paths
     */
    @Query("SELECT COUNT(lp) FROM LearningPath lp WHERE lp.user.id = :userId AND lp.isActive = true")
    Long countActiveLearningPathsByUserId(@Param("userId") Long userId);
} 