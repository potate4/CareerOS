package com.careeros.backend.repository;

import com.careeros.backend.model.LearningChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningChatRepository extends JpaRepository<LearningChat, Long> {
    
    /**
     * Find all chat messages for a specific user and module, ordered by creation time
     */
    @Query("SELECT lc FROM LearningChat lc WHERE lc.userId = :userId AND lc.moduleId = :moduleId ORDER BY lc.createdAt ASC")
    List<LearningChat> findByUserIdAndModuleIdOrderByCreatedAtAsc(@Param("userId") Long userId, @Param("moduleId") Long moduleId);
    
    /**
     * Find recent chat messages for a specific user and module, limited by count
     */
    @Query("SELECT lc FROM LearningChat lc WHERE lc.userId = :userId AND lc.moduleId = :moduleId ORDER BY lc.createdAt DESC")
    List<LearningChat> findRecentByUserIdAndModuleIdOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("moduleId") Long moduleId);
    
    /**
     * Count total messages for a user in a specific module
     */
    @Query("SELECT COUNT(lc) FROM LearningChat lc WHERE lc.userId = :userId AND lc.moduleId = :moduleId")
    long countByUserIdAndModuleId(@Param("userId") Long userId, @Param("moduleId") Long moduleId);
} 