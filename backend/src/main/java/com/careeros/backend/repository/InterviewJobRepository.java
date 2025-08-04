package com.careeros.backend.repository;

import com.careeros.backend.model.InterviewJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewJobRepository extends JpaRepository<InterviewJob, Long> {
    
    Optional<InterviewJob> findByJobId(String jobId);
    
    List<InterviewJob> findByUserId(Long userId);
    
    List<InterviewJob> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<InterviewJob> findByStatus(String status);
    
    List<InterviewJob> findByUserIdAndStatus(Long userId, String status);
} 