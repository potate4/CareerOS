package com.careeros.backend.repository;

import com.careeros.backend.model.MindFlowConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MindFlowConversationRepository extends JpaRepository<MindFlowConversation, Long> {
    
    List<MindFlowConversation> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    List<MindFlowConversation> findBySessionIdAndUserIdOrderByCreatedAtAsc(String sessionId, Long userId);
    
    void deleteBySessionId(String sessionId);
}