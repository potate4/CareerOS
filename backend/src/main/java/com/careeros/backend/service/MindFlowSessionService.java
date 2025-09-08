package com.careeros.backend.service;

import com.careeros.backend.model.MindFlowSession;
import com.careeros.backend.payload.request.CreateMindFlowSessionRequest;
import com.careeros.backend.payload.request.UpdateMindFlowSessionRequest;
import com.careeros.backend.payload.response.MindFlowSessionResponse;
import com.careeros.backend.repository.MindFlowSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MindFlowSessionService {

    @Autowired
    private MindFlowSessionRepository mindFlowSessionRepository;

    public MindFlowSessionResponse createSession(Long userId, CreateMindFlowSessionRequest request) {
        MindFlowSession session = new MindFlowSession();
        session.setSessionId("mindflow_sess_" + UUID.randomUUID().toString());
        session.setUserId(userId);
        session.setStatus("ACTIVE");
        
        if (request != null) {
            if (request.getInitialSessionData() != null) {
                session.setSessionData(request.getInitialSessionData());
            } else {
                session.setSessionData("{}");
            }
            if (request.getScenarioType() != null) {
                session.setScenarioType(request.getScenarioType());
            }
        } else {
            session.setSessionData("{}");
        }
        
        MindFlowSession saved = mindFlowSessionRepository.save(session);
        return toResponse(saved);
    }

    public MindFlowSessionResponse getSession(String sessionId, Long userId) {
        MindFlowSession session = mindFlowSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        return toResponse(session);
    }

    public MindFlowSessionResponse updateSession(String sessionId, Long userId, UpdateMindFlowSessionRequest request) {
        MindFlowSession session = mindFlowSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        if (request.getSessionData() != null) {
            session.setSessionData(request.getSessionData());
        }
        if (request.getScenarioType() != null) {
            session.setScenarioType(request.getScenarioType());
        }
        if (request.getStatus() != null) {
            session.setStatus(request.getStatus());
            if ("ENDED".equalsIgnoreCase(request.getStatus())) {
                session.setEndedAt(LocalDateTime.now());
            }
        }
        MindFlowSession saved = mindFlowSessionRepository.save(session);
        return toResponse(saved);
    }

    public List<MindFlowSessionResponse> listSessions(Long userId, String status) {
        List<MindFlowSession> sessions;
        if (status == null || status.isEmpty()) {
            sessions = mindFlowSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } else {
            sessions = mindFlowSessionRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        }
        return sessions.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MindFlowSessionResponse endSession(String sessionId, Long userId) {
        MindFlowSession session = mindFlowSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        session.setStatus("ENDED");
        session.setEndedAt(LocalDateTime.now());
        MindFlowSession saved = mindFlowSessionRepository.save(session);
        return toResponse(saved);
    }

    private MindFlowSessionResponse toResponse(MindFlowSession session) {
        return new MindFlowSessionResponse(
                session.getSessionId(),
                session.getUserId(),
                session.getStatus(),
                session.getSessionData(),
                session.getScenarioType(),
                session.getCreatedAt(),
                session.getUpdatedAt(),
                session.getEndedAt()
        );
    }
}