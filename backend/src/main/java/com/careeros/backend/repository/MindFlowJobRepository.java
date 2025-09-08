package com.careeros.backend.repository;

import com.careeros.backend.model.MindFlowJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MindFlowJobRepository extends JpaRepository<MindFlowJob, Long> {
    
    Optional<MindFlowJob> findByJobId(String jobId);
    
    List<MindFlowJob> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<MindFlowJob> findByStatusOrderByCreatedAtDesc(String status);
}