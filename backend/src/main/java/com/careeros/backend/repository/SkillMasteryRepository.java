package com.careeros.backend.repository;

import com.careeros.backend.model.SkillMastery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillMasteryRepository extends JpaRepository<SkillMastery, Long> {
    
    /**
     * Find all skill mastery records for a specific user
     * @param userId The user ID
     * @return List of skill mastery records
     */
    List<SkillMastery> findByUserId(Long userId);
    
    /**
     * Find skill mastery by user ID and skill name
     * @param userId The user ID
     * @param skillName The skill name
     * @return Optional containing the skill mastery record if found
     */
    Optional<SkillMastery> findByUserIdAndSkillName(Long userId, String skillName);
    
    /**
     * Find skills with mastery level above threshold
     * @param userId The user ID
     * @param threshold The mastery threshold
     * @return List of skill mastery records above threshold
     */
    @Query("SELECT sm FROM SkillMastery sm WHERE sm.user.id = :userId AND sm.masteryLevel >= :threshold")
    List<SkillMastery> findByUserIdAndMasteryLevelAbove(@Param("userId") Long userId, @Param("threshold") Double threshold);
    
    /**
     * Find skills that need practice (below threshold)
     * @param userId The user ID
     * @param threshold The mastery threshold
     * @return List of skill mastery records below threshold
     */
    @Query("SELECT sm FROM SkillMastery sm WHERE sm.user.id = :userId AND sm.masteryLevel < :threshold")
    List<SkillMastery> findByUserIdAndMasteryLevelBelow(@Param("userId") Long userId, @Param("threshold") Double threshold);
    
    /**
     * Find trending skills (trending up)
     * @param userId The user ID
     * @return List of trending skills
     */
    @Query("SELECT sm FROM SkillMastery sm WHERE sm.user.id = :userId AND sm.trendingUp = true")
    List<SkillMastery> findTrendingSkillsByUserId(Long userId);
    
    /**
     * Find skills by market demand level
     * @param userId The user ID
     * @param minDemandLevel The minimum market demand level
     * @return List of skills with high market demand
     */
    @Query("SELECT sm FROM SkillMastery sm WHERE sm.user.id = :userId AND sm.marketDemandLevel >= :minDemandLevel")
    List<SkillMastery> findByUserIdAndMarketDemandAbove(@Param("userId") Long userId, @Param("minDemandLevel") Double minDemandLevel);
}
