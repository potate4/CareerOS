package com.careeros.backend.repository;

import com.careeros.backend.model.LearningModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningModuleRepository extends JpaRepository<LearningModule, Long> {
    
    /**
     * Find all modules for a specific learning path
     * @param learningPathId The learning path ID
     * @return List of modules ordered by their index
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId ORDER BY lm.orderIndex ASC")
    List<LearningModule> findByLearningPathIdOrderByOrderIndex(@Param("learningPathId") Long learningPathId);
    
    /**
     * Find modules by status for a specific learning path
     * @param learningPathId The learning path ID
     * @param status The module status
     * @return List of modules with the specified status
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.status = :status")
    List<LearningModule> findByLearningPathIdAndStatus(@Param("learningPathId") Long learningPathId, 
                                                      @Param("status") LearningModule.ModuleStatus status);
    
    /**
     * Find modules by difficulty level for a specific learning path
     * @param learningPathId The learning path ID
     * @param difficultyLevel The difficulty level
     * @return List of modules with the specified difficulty level
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.difficultyLevel = :difficultyLevel")
    List<LearningModule> findByLearningPathIdAndDifficultyLevel(@Param("learningPathId") Long learningPathId, 
                                                               @Param("difficultyLevel") LearningModule.DifficultyLevel difficultyLevel);
    
    /**
     * Find modules by skill focus
     * @param skillFocus The skill focus to search for
     * @return List of modules with the specified skill focus
     */
    List<LearningModule> findBySkillFocusContainingIgnoreCase(String skillFocus);
    
    /**
     * Find completed modules for a specific learning path
     * @param learningPathId The learning path ID
     * @return List of completed modules
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.status = 'COMPLETED'")
    List<LearningModule> findCompletedModulesByLearningPathId(@Param("learningPathId") Long learningPathId);
    
    /**
     * Find modules in progress for a specific learning path
     * @param learningPathId The learning path ID
     * @return List of modules in progress
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.status = 'IN_PROGRESS'")
    List<LearningModule> findInProgressModulesByLearningPathId(@Param("learningPathId") Long learningPathId);
    
    /**
     * Find modules with progress above a certain threshold
     * @param learningPathId The learning path ID
     * @param minProgress The minimum progress percentage
     * @return List of modules with progress above the threshold
     */
    @Query("SELECT lm FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.progressPercentage >= :minProgress")
    List<LearningModule> findByLearningPathIdAndProgressAbove(@Param("learningPathId") Long learningPathId, 
                                                             @Param("minProgress") Double minProgress);
    
    /**
     * Count modules by status for a specific learning path
     * @param learningPathId The learning path ID
     * @param status The module status
     * @return Number of modules with the specified status
     */
    @Query("SELECT COUNT(lm) FROM LearningModule lm WHERE lm.learningPath.id = :learningPathId AND lm.status = :status")
    Long countByLearningPathIdAndStatus(@Param("learningPathId") Long learningPathId, 
                                       @Param("status") LearningModule.ModuleStatus status);
} 