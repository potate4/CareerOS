package com.careeros.backend.repository;

import com.careeros.backend.model.Milestone;
import com.careeros.backend.model.CareerPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    
    List<Milestone> findByCareerPath(CareerPath careerPath);
    
    List<Milestone> findByCareerPathId(Long careerPathId);
    
    List<Milestone> findByCareerPathIdOrderByYear(Long careerPathId);
    
    @Query("SELECT m FROM Milestone m WHERE m.careerPath.roadmap.user.id = :userId")
    List<Milestone> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Milestone m WHERE m.careerPath.roadmap.user.id = :userId AND m.isCompleted = :isCompleted")
    List<Milestone> findByUserIdAndCompletionStatus(@Param("userId") Long userId, @Param("isCompleted") Boolean isCompleted);
    
    @Query("SELECT m FROM Milestone m WHERE m.careerPath.roadmap.id = :roadmapId")
    List<Milestone> findByRoadmapId(@Param("roadmapId") Long roadmapId);
    
    @Query("SELECT m FROM Milestone m WHERE m.careerPath.roadmap.id = :roadmapId AND m.isCompleted = :isCompleted")
    List<Milestone> findByRoadmapIdAndCompletionStatus(@Param("roadmapId") Long roadmapId, @Param("isCompleted") Boolean isCompleted);
    
    @Query("SELECT m FROM Milestone m WHERE m.careerPath.id = :careerPathId AND m.year = :year")
    Optional<Milestone> findByCareerPathIdAndYear(@Param("careerPathId") Long careerPathId, @Param("year") Integer year);
    
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.careerPath.id = :careerPathId")
    Long countByCareerPathId(@Param("careerPathId") Long careerPathId);
    
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.careerPath.id = :careerPathId AND m.isCompleted = true")
    Long countCompletedByCareerPathId(@Param("careerPathId") Long careerPathId);
    
    @Query("SELECT COUNT(m) FROM Milestone m WHERE m.careerPath.roadmap.user.id = :userId AND m.isCompleted = true")
    Long countCompletedByUserId(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Milestone m WHERE m.reminderDate <= :currentDate AND m.isCompleted = false")
    List<Milestone> findMilestonesWithUpcomingReminders(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT m FROM Milestone m WHERE m.targetCompletionDate <= :currentDate AND m.isCompleted = false")
    List<Milestone> findOverdueMilestones(@Param("currentDate") LocalDateTime currentDate);
    
    @Query("SELECT m FROM Milestone m WHERE " +
           "m.careerPath.roadmap.user.id = :userId AND " +
           "m.careerPath.isSelected = true AND " +
           "m.isCompleted = false " +
           "ORDER BY m.year ASC")
    List<Milestone> findNextMilestonesForUser(@Param("userId") Long userId);
} 