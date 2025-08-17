package com.careeros.backend.repository;

import com.careeros.backend.model.CareerPath;
import com.careeros.backend.model.FuturecastRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CareerPathRepository extends JpaRepository<CareerPath, Long> {
    
    List<CareerPath> findByRoadmap(FuturecastRoadmap roadmap);
    
    List<CareerPath> findByRoadmapId(Long roadmapId);
    
    Optional<CareerPath> findByRoadmapIdAndPathId(Long roadmapId, String pathId);
    
    @Query("SELECT cp FROM CareerPath cp WHERE cp.roadmap.id = :roadmapId AND cp.isSelected = true")
    Optional<CareerPath> findSelectedPathByRoadmapId(@Param("roadmapId") Long roadmapId);
    
    @Query("SELECT cp FROM CareerPath cp WHERE cp.roadmap.user.id = :userId AND cp.isSelected = true")
    List<CareerPath> findSelectedPathsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT cp FROM CareerPath cp WHERE cp.roadmap.id = :roadmapId ORDER BY cp.pathId")
    List<CareerPath> findByRoadmapIdOrderByPathId(@Param("roadmapId") Long roadmapId);
    
    @Query("SELECT COUNT(cp) FROM CareerPath cp WHERE cp.roadmap.id = :roadmapId")
    Long countByRoadmapId(@Param("roadmapId") Long roadmapId);
} 