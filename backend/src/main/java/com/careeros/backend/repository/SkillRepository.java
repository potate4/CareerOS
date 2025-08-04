package com.careeros.backend.repository;

import com.careeros.backend.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    /**
     * Find all skills for a specific user
     * @param userId The user ID
     * @return List of skills for the user
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId ORDER BY s.name ASC")
    List<Skill> findByUserId(@Param("userId") Long userId);
    
    /**
     * Find skills by category for a specific user
     * @param userId The user ID
     * @param category The skill category
     * @return List of skills in the specified category
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND s.category = :category")
    List<Skill> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);
    
    /**
     * Find skills by proficiency level for a specific user
     * @param userId The user ID
     * @param proficiencyLevel The proficiency level
     * @return List of skills at the specified proficiency level
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND s.proficiencyLevel = :proficiencyLevel")
    List<Skill> findByUserIdAndProficiencyLevel(@Param("userId") Long userId, 
                                               @Param("proficiencyLevel") Skill.ProficiencyLevel proficiencyLevel);
    
    /**
     * Find a specific skill by name for a user
     * @param userId The user ID
     * @param skillName The skill name
     * @return Optional containing the skill if found
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND LOWER(s.name) = LOWER(:skillName)")
    Optional<Skill> findByUserIdAndSkillName(@Param("userId") Long userId, @Param("skillName") String skillName);
    
    /**
     * Find skills with experience above a certain threshold
     * @param userId The user ID
     * @param minYears The minimum years of experience
     * @return List of skills with experience above the threshold
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND s.yearsOfExperience >= :minYears")
    List<Skill> findByUserIdAndExperienceAbove(@Param("userId") Long userId, @Param("minYears") Double minYears);
    
    /**
     * Find certified skills for a user
     * @param userId The user ID
     * @return List of certified skills
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND s.isCertified = true")
    List<Skill> findCertifiedSkillsByUserId(@Param("userId") Long userId);
    
    /**
     * Find skills by name pattern (for search functionality)
     * @param userId The user ID
     * @param skillNamePattern The skill name pattern to search for
     * @return List of skills matching the pattern
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND LOWER(s.name) LIKE LOWER(CONCAT('%', :skillNamePattern, '%'))")
    List<Skill> findByUserIdAndSkillNameContaining(@Param("userId") Long userId, @Param("skillNamePattern") String skillNamePattern);
    
    /**
     * Count skills by proficiency level for a user
     * @param userId The user ID
     * @param proficiencyLevel The proficiency level
     * @return Number of skills at the specified proficiency level
     */
    @Query("SELECT COUNT(s) FROM Skill s WHERE s.user.id = :userId AND s.proficiencyLevel = :proficiencyLevel")
    Long countByUserIdAndProficiencyLevel(@Param("userId") Long userId, 
                                         @Param("proficiencyLevel") Skill.ProficiencyLevel proficiencyLevel);
    
    /**
     * Find skills that haven't been used recently
     * @param userId The user ID
     * @param daysThreshold Number of days threshold
     * @return List of skills not used within the threshold
     */
    @Query("SELECT s FROM Skill s WHERE s.user.id = :userId AND (s.lastUsedDate IS NULL OR s.lastUsedDate < :threshold)")
    List<Skill> findSkillsNotUsedRecently(@Param("userId") Long userId, 
                                         @Param("threshold") java.time.LocalDateTime threshold);
} 