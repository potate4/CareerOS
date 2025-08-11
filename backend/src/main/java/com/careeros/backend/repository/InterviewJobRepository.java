package com.careeros.backend.repository;

import com.careeros.backend.model.InterviewJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@Repository
public interface InterviewJobRepository extends JpaRepository<InterviewJob, Long> {
    
    Optional<InterviewJob> findByJobId(String jobId);
    
    List<InterviewJob> findByUserId(Long userId);
    
    List<InterviewJob> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<InterviewJob> findByStatus(String status);
    
    List<InterviewJob> findByUserIdAndStatus(Long userId, String status);
    
    // Find the most recent job for each file ID for a specific user
    @Query("SELECT i FROM InterviewJob i WHERE i.userId = :userId AND i.fileId IS NOT NULL " +
           "AND i.createdAt = (SELECT MAX(i2.createdAt) FROM InterviewJob i2 WHERE i2.fileId = i.fileId AND i2.userId = :userId)")
    List<InterviewJob> findMostRecentJobsByUserId(Long userId);
} 