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
} 