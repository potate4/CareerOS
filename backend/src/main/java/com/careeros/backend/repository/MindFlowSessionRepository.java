package com.careeros.backend.repository;

import com.careeros.backend.model.MindFlowSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MindFlowSessionRepository extends JpaRepository<MindFlowSession, Long> {
    
    Optional<MindFlowSession> findBySessionId(String sessionId);
    
    Optional<MindFlowSession> findBySessionIdAndUserId(String sessionId, Long userId);
    
    List<MindFlowSession> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<MindFlowSession> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
}