package com.careeros.backend.repository;

import com.careeros.backend.model.FuturecastRoadmap;
import com.careeros.backend.model.FuturecastRoadmap.RoadmapStatus;
import com.careeros.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FuturecastRoadmapRepository extends JpaRepository<FuturecastRoadmap, Long> {
    
    List<FuturecastRoadmap> findByUser(User user);
    
    List<FuturecastRoadmap> findByUserId(Long userId);
    
    Page<FuturecastRoadmap> findByUserId(Long userId, Pageable pageable);
    
    Page<FuturecastRoadmap> findByUserIdAndStatus(Long userId, RoadmapStatus status, Pageable pageable);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE fr.user.id = :userId AND fr.status = :status ORDER BY fr.createdAt DESC")
    List<FuturecastRoadmap> findByUserIdAndStatusOrderByCreatedAtDesc(@Param("userId") Long userId, @Param("status") RoadmapStatus status);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE fr.user.id = :userId ORDER BY fr.lastAccessedAt DESC NULLS LAST, fr.updatedAt DESC")
    List<FuturecastRoadmap> findByUserIdOrderByLastAccessedDesc(@Param("userId") Long userId);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE fr.isPublic = true AND fr.status = :status")
    Page<FuturecastRoadmap> findPublicRoadmapsByStatus(@Param("status") RoadmapStatus status, Pageable pageable);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE fr.careerGoal ILIKE %:careerGoal% AND fr.isPublic = true")
    List<FuturecastRoadmap> findPublicRoadmapsByCareerGoal(@Param("careerGoal") String careerGoal);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE " +
           "fr.user.id = :userId AND " +
           "fr.careerGoal = :careerGoal AND " +
           "fr.timelineYears = :timelineYears AND " +
           "fr.status = 'ACTIVE'")
    Optional<FuturecastRoadmap> findExistingRoadmap(
        @Param("userId") Long userId,
        @Param("careerGoal") String careerGoal,
        @Param("timelineYears") Integer timelineYears
    );
    
    @Query("SELECT COUNT(fr) FROM FuturecastRoadmap fr WHERE fr.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(fr) FROM FuturecastRoadmap fr WHERE fr.user.id = :userId AND fr.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") RoadmapStatus status);
    
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE fr.createdAt >= :startDate AND fr.createdAt <= :endDate")
    List<FuturecastRoadmap> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // Find roadmaps that haven't been accessed recently
    @Query("SELECT fr FROM FuturecastRoadmap fr WHERE " +
           "fr.lastAccessedAt < :thresholdDate OR fr.lastAccessedAt IS NULL")
    List<FuturecastRoadmap> findInactiveRoadmaps(@Param("thresholdDate") LocalDateTime thresholdDate);
} 