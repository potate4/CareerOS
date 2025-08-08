package com.careeros.backend.service;

import com.careeros.backend.model.InterviewSession;
import com.careeros.backend.payload.request.CreateInterviewSessionRequest;
import com.careeros.backend.payload.request.UpdateInterviewSessionRequest;
import com.careeros.backend.payload.response.InterviewSessionResponse;
import com.careeros.backend.repository.InterviewSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InterviewSessionService {

    @Autowired
    private InterviewSessionRepository interviewSessionRepository;

    public InterviewSessionResponse createSession(Long userId, CreateInterviewSessionRequest request) {
        InterviewSession session = new InterviewSession();
        session.setSessionId("sess_" + UUID.randomUUID().toString());
        session.setUserId(userId);
        session.setStatus("ACTIVE");
        if (request != null && request.getInitialSessionData() != null) {
            session.setSessionData(request.getInitialSessionData());
        } else {
            session.setSessionData("{}");
        }
        InterviewSession saved = interviewSessionRepository.save(session);
        return toResponse(saved);
    }

    public InterviewSessionResponse getSession(String sessionId, Long userId) {
        InterviewSession session = interviewSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        return toResponse(session);
    }

    public InterviewSessionResponse updateSession(String sessionId, Long userId, UpdateInterviewSessionRequest request) {
        InterviewSession session = interviewSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        if (request.getSessionData() != null) {
            session.setSessionData(request.getSessionData());
        }
        if (request.getStatus() != null) {
            session.setStatus(request.getStatus());
            if ("ENDED".equalsIgnoreCase(request.getStatus())) {
                session.setEndedAt(LocalDateTime.now());
            }
        }
        InterviewSession saved = interviewSessionRepository.save(session);
        return toResponse(saved);
    }

    public List<InterviewSessionResponse> listSessions(Long userId, String status) {
        List<InterviewSession> sessions;
        if (status == null || status.isEmpty()) {
            sessions = interviewSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            sessions = interviewSessionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        }
        return sessions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InterviewSessionResponse endSession(String sessionId, Long userId) {
        InterviewSession session = interviewSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        session.setStatus("ENDED");
        session.setEndedAt(LocalDateTime.now());
        InterviewSession saved = interviewSessionRepository.save(session);
        return toResponse(saved);
    }

    private InterviewSessionResponse toResponse(InterviewSession session) {
        return new InterviewSessionResponse(
                session.getSessionId(),
                session.getUserId(),
                session.getStatus(),
                session.getSessionData(),
                session.getCreatedAt(),
                session.getUpdatedAt(),
                session.getEndedAt()
        );
    }
} 