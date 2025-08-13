package com.careeros.backend.repository;

import com.careeros.backend.model.InterviewConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewConversationRepository extends JpaRepository<InterviewConversation, Long> {
    List<InterviewConversation> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    List<InterviewConversation> findBySessionIdAndUserIdOrderByCreatedAtAsc(String sessionId, Long userId);
} 