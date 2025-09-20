package com.careeros.backend.repository;

import com.careeros.backend.model.MindFlowJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MindFlowJobRepository extends JpaRepository<MindFlowJob, Long> {
    
    Optional<MindFlowJob> findByJobId(String jobId);
    
    List<MindFlowJob> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<MindFlowJob> findByStatusOrderByCreatedAtDesc(String status);
    
    // Find the most recent job for each file ID for a specific user
    @Query("SELECT m FROM MindFlowJob m WHERE m.userId = :userId AND m.fileId IS NOT NULL " +
           "AND m.createdAt = (SELECT MAX(m2.createdAt) FROM MindFlowJob m2 WHERE m2.fileId = m.fileId AND m2.userId = :userId)")
    List<MindFlowJob> findMostRecentJobsByUserId(Long userId);
}