package com.careeros.backend.service;

import com.careeros.backend.model.InterviewConversation;
import com.careeros.backend.model.InterviewSession;
import com.careeros.backend.payload.request.ConversationMessageRequest;
import com.careeros.backend.payload.response.ConversationMessageResponse;
import com.careeros.backend.payload.response.InterviewSessionResponse;
import com.careeros.backend.repository.InterviewConversationRepository;
import com.careeros.backend.repository.InterviewSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InterviewConversationService {

    private static final Logger logger = LoggerFactory.getLogger(InterviewConversationService.class);

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Autowired
    private InterviewConversationRepository conversationRepository;

    @Autowired
    private InterviewSessionRepository sessionRepository;

    private final RestTemplate restTemplate;

    public InterviewConversationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<ConversationMessageResponse> getConversation(String sessionId, Long userId) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        List<InterviewConversation> messages = conversationRepository
                .findBySessionIdAndUserIdOrderByCreatedAtAsc(sessionId, userId);
        return messages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ConversationMessageResponse appendMessage(String sessionId, Long userId, ConversationMessageRequest request) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        InterviewConversation entity = new InterviewConversation(sessionId, userId,
                request.getSpeaker(), request.getMessage(), request.getAudioUrl());
        InterviewConversation saved = conversationRepository.save(entity);
        return toResponse(saved);
    }

    // Orchestrations with AI service
    public Map<String, Object> generateFirstQuestionAndTTS(String sessionId, Long userId, Map<String, Object> initialSessionData) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        String question = callAIToGenerateQuestion(sessionId, userId, initialSessionData, Collections.emptyList());
        String audioUrl = callAIForTTS(question);
        // store AI message
        conversationRepository.save(new InterviewConversation(sessionId, userId, "ai", question, audioUrl));
        return Map.of(
                "question", question,
                "audioUrl", audioUrl
        );
    }

    public Map<String, Object> processUserAnswerAndGenerateNext(String sessionId, Long userId, String audioFileUrl) {
        InterviewSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        // 1) STT on audio
        String transcript = callAIForSTT(audioFileUrl);
        // store user message
        conversationRepository.save(new InterviewConversation(sessionId, userId, "user", transcript, null));
        // 2) Fetch full history
        List<InterviewConversation> history = conversationRepository.findBySessionIdAndUserIdOrderByCreatedAtAsc(sessionId, userId);
        List<Map<String, String>> formatted = history.stream()
                .map(m -> Map.of("speaker", m.getSpeaker(), "message", m.getMessage()))
                .collect(Collectors.toList());
        // 3) Call AI to generate next question with prompt + history
        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", sessionId);
        payload.put("userId", userId);
        payload.put("history", formatted);
        payload.put("prompt", "You are an interview simulator. Ask concise, relevant questions one at a time.");
        String nextQuestion = callAIToGenerateNextQuestion(payload);
        String ttsUrl = callAIForTTS(nextQuestion);
        conversationRepository.save(new InterviewConversation(sessionId, userId, "ai", nextQuestion, ttsUrl));
        return Map.of(
                "transcript", transcript,
                "nextQuestion", nextQuestion,
                "audioUrl", ttsUrl
        );
    }

    private String callAIToGenerateQuestion(String sessionId, Long userId, Map<String, Object> initialData, List<Map<String, String>> history) {
        try {
            String url = aiServiceUrl + "/api/v1/interview/generate-question";
            Map<String, Object> req = new HashMap<>();
            req.put("sessionId", sessionId);
            req.put("userId", userId);
            req.put("initialData", initialData);
            req.put("history", history);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            Object q = res.getBody() != null ? res.getBody().get("question") : null;
            return q != null ? q.toString() : "";
        } catch (Exception e) {
            logger.error("Failed to generate first question: {}", e.getMessage());
            throw new RuntimeException("AI question generation failed");
        }
    }

    private String callAIToGenerateNextQuestion(Map<String, Object> payload) {
        try {
            String url = aiServiceUrl + "/api/v1/interview/sim/next-question";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), Map.class);
            Object q = res.getBody() != null ? res.getBody().get("question") : null;
            return q != null ? q.toString() : "";
        } catch (Exception e) {
            logger.error("Failed to generate next question: {}", e.getMessage());
            throw new RuntimeException("AI next question generation failed");
        }
    }

    private String callAIForTTS(String text) {
        try {
            String url = aiServiceUrl + "/api/v1/interview/sim/tts";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            Map<String, Object> req = Map.of("text", text);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            Object audio = res.getBody() != null ? res.getBody().get("audioUrl") : null;
            return audio != null ? audio.toString() : null;
        } catch (Exception e) {
            logger.error("TTS failed: {}", e.getMessage());
            return null; // non-fatal
        }
    }

    private String callAIForSTT(String audioUrl) {
        try {
            String url = aiServiceUrl + "/api/v1/interview/sim/stt";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            Map<String, Object> req = Map.of("audioUrl", audioUrl);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            Object t = res.getBody() != null ? res.getBody().get("transcript") : null;
            return t != null ? t.toString() : "";
        } catch (Exception e) {
            logger.error("STT failed: {}", e.getMessage());
            throw new RuntimeException("AI STT failed");
        }
    }

    private ConversationMessageResponse toResponse(InterviewConversation m) {
        return new ConversationMessageResponse(
                m.getSessionId(),
                m.getUserId(),
                m.getSpeaker(),
                m.getMessage(),
                m.getAudioUrl(),
                m.getCreatedAt()
        );
    }
} 