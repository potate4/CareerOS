package com.careeros.backend.service;

import com.careeros.backend.model.MindFlowConversation;
import com.careeros.backend.model.MindFlowSession;
import com.careeros.backend.payload.request.MindFlowConversationMessageRequest;
import com.careeros.backend.payload.response.MindFlowConversationMessageResponse;
import com.careeros.backend.repository.MindFlowConversationRepository;
import com.careeros.backend.repository.MindFlowSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class MindFlowConversationService {

    private static final Logger logger = LoggerFactory.getLogger(MindFlowConversationService.class);

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Autowired
    private MindFlowConversationRepository conversationRepository;

    @Autowired
    private MindFlowSessionRepository sessionRepository;

    private final RestTemplate restTemplate;

    public MindFlowConversationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<MindFlowConversationMessageResponse> getConversation(String sessionId, Long userId) {
        MindFlowSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        List<MindFlowConversation> messages = conversationRepository
                .findBySessionIdAndUserIdOrderByCreatedAtAsc(sessionId, userId);
        return messages.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public MindFlowConversationMessageResponse appendMessage(String sessionId, Long userId, MindFlowConversationMessageRequest request) {
        MindFlowSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        MindFlowConversation entity = new MindFlowConversation(sessionId, userId,
                request.getSpeaker(), request.getMessage(), request.getAudioUrl());
        MindFlowConversation saved = conversationRepository.save(entity);
        return toResponse(saved);
    }

    // Orchestrations with AI service for soft skills scenarios
    public Map<String, Object> generateFirstQuestionAndTTS(String sessionId, Long userId, Map<String, Object> initialSessionData) {
        MindFlowSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        
        logger.info("MindFlow: Starting question generation for session {}", sessionId);
        String question = callAIToGenerateQuestion(sessionId, userId, initialSessionData, Collections.emptyList(), buildScenarioPrompt(session, initialSessionData));
        logger.info("MindFlow: Question generated successfully: {}", question.substring(0, Math.min(50, question.length())));
        
        logger.info("MindFlow: Starting TTS generation for session {}", sessionId);
        String audioUrl = callAIForTTS(question);
        logger.info("MindFlow: TTS generated successfully: {}", audioUrl != null ? "Success" : "Failed");
        
        // store AI message
        conversationRepository.save(new MindFlowConversation(sessionId, userId, "ai", question, audioUrl));
        logger.info("MindFlow: First question flow completed for session {}", sessionId);
        
        return Map.of(
                "question", question,
                "audioUrl", audioUrl
        );
    }

    public Map<String, Object> processUserAnswerAndGenerateNext(String sessionId, Long userId, String audioFileUrl) {
        MindFlowSession session = sessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("MindFlow session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }
        // 1) STT on audio
        String transcript = callAIForSTT(audioFileUrl);
        // store user message
        conversationRepository.save(new MindFlowConversation(sessionId, userId, "user", transcript, null));
        // 2) Fetch full history
        List<MindFlowConversation> history = conversationRepository.findBySessionIdAndUserIdOrderByCreatedAtAsc(sessionId, userId);
        List<Map<String, String>> formatted = history.stream()
                .map(m -> Map.of("speaker", m.getSpeaker(), "message", m.getMessage()))
                .collect(Collectors.toList());
        // 3) Prepare initialData from session.sessionData if present
        Map<String, Object> initialData = new HashMap<>();
        try {
            String sd = session.getSessionData();
            if (sd != null && !sd.isBlank()) {
                // naive JSON parse via Jackson-like map (RestTemplate will serialize fine)
                initialData = new ObjectMapper().readValue(sd, Map.class);
            }
        } catch (Exception e) {
            logger.warn("Failed to parse MindFlow sessionData as JSON: {}", e.getMessage());
        }
        // 4) Call AI to generate next question with prompt + history + initialData
        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", sessionId);
        payload.put("userId", userId);
        payload.put("history", formatted);
        payload.put("initialData", initialData);
        payload.put("prompt", buildScenarioPrompt(session, initialData));
        String nextQuestion = callAIToGenerateNextQuestion(payload);
        String ttsUrl = callAIForTTS(nextQuestion);
        conversationRepository.save(new MindFlowConversation(sessionId, userId, "ai", nextQuestion, ttsUrl));
        return Map.of(
                "transcript", transcript,
                "nextQuestion", nextQuestion,
                "audioUrl", ttsUrl
        );
    }

    // Async variant returning jobId immediately
    @Async
    public CompletableFuture<String> processUserAnswerAsync(String sessionId, Long userId, String audioFileUrl) {
        try {
            // Process in background
            processUserAnswerAndGenerateNext(sessionId, userId, audioFileUrl);
            return CompletableFuture.completedFuture(UUID.randomUUID().toString());
        } catch (Exception e) {
            logger.error("MindFlow async processing failed: {}", e.getMessage());
            return CompletableFuture.completedFuture("ERROR:" + e.getMessage());
        }
    }

    private String buildScenarioPrompt(MindFlowSession session, Map<String, Object> initialData) {
        String scenarioType = session.getScenarioType() != null ? session.getScenarioType() : "GENERAL_COMMUNICATION";
        
        String basePrompt = "You are an expert soft skills trainer facilitating workplace communication scenarios. ";
        
        switch (scenarioType) {
            case "SALARY_NEGOTIATION":
                return basePrompt + "You are roleplaying as a manager in a salary negotiation scenario. " +
                       "Be realistic, professional, and challenging but fair. Help the user practice negotiation skills.";
            case "DIFFICULT_CONVERSATION":
                return basePrompt + "You are roleplaying a workplace situation requiring difficult conversation skills. " +
                       "Present realistic challenges and help the user practice giving feedback, handling conflicts, or addressing performance issues.";
            case "TEAM_CONFLICT":
                return basePrompt + "You are facilitating a team conflict resolution scenario. " +
                       "Present realistic interpersonal challenges and help the user practice mediation and leadership skills.";
            case "CLIENT_RELATIONS":
                return basePrompt + "You are roleplaying as a client or customer in a professional services scenario. " +
                       "Help the user practice client communication, expectation management, and relationship building.";
            case "LEADERSHIP":
                return basePrompt + "You are facilitating a leadership scenario. " +
                       "Present situations requiring decision-making, team inspiration, and strategic communication skills.";
            default:
                return basePrompt + "Create realistic workplace communication scenarios that help develop professional soft skills. " +
                       "Adapt the scenario based on the conversation context.";
        }
    }

    private String callAIToGenerateQuestion(String sessionId, Long userId, Map<String, Object> initialData, List<Map<String, String>> history, String prompt) {
        try {
            logger.info("MindFlow: Calling AI generate-question for session {}", sessionId);
            String url = aiServiceUrl + "/api/v1/mindflow/generate-question";
            Map<String, Object> req = new HashMap<>();
            req.put("sessionId", sessionId);
            req.put("userId", userId);
            req.put("initialData", initialData);
            req.put("history", history);
            req.put("prompt", prompt);
            System.out.println("MindFlow history: " + history);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            logger.info("MindFlow: Making request to AI service at {}", url);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            logger.info("MindFlow: AI service responded with status {}", res.getStatusCode());
            Object q = res.getBody() != null ? res.getBody().get("question") : null;
            return q != null ? q.toString() : "";
        } catch (Exception e) {
            logger.error("Failed to generate MindFlow first question: {}", e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("MindFlow AI question generation failed: " + e.getMessage());
        }
    }

    private String callAIToGenerateNextQuestion(Map<String, Object> payload) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/generate-question";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(payload, headers), Map.class);
            Object q = res.getBody() != null ? res.getBody().get("question") : null;
            return q != null ? q.toString() : "";
        } catch (Exception e) {
            logger.error("Failed to generate MindFlow next question: {}", e.getMessage());
            throw new RuntimeException("MindFlow AI next question generation failed");
        }
    }

    private String callAIForSTT(String audioUrl) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/stt";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            Map<String, Object> req = Map.of("audioUrl", audioUrl);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            Object t = res.getBody() != null ? res.getBody().get("transcript") : null;
            return t != null ? t.toString() : "";
        } catch (Exception e) {
            logger.error("MindFlow STT failed: {}", e.getMessage());
            throw new RuntimeException("MindFlow AI STT failed");
        }
    }

    private String callAIForTTS(String text) {
        try {
            logger.info("MindFlow: Calling AI TTS with text length: {}", text.length());
            String url = aiServiceUrl + "/api/v1/mindflow/tts";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            Map<String, Object> req = Map.of("text", text);
            logger.info("MindFlow: Making TTS request to AI service at {}", url);
            ResponseEntity<Map> res = restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(req, headers), Map.class);
            logger.info("MindFlow: TTS AI service responded with status {}", res.getStatusCode());
            Object audio = res.getBody() != null ? res.getBody().get("audioUrl") : null;
            logger.info("MindFlow: TTS audio URL received: {}", audio != null ? "Yes" : "No");
            return audio != null ? audio.toString() : null;
        } catch (Exception e) {
            logger.error("MindFlow TTS failed: {}", e.getMessage());
            e.printStackTrace();
            return null; // non-fatal
        }
    }

    private MindFlowConversationMessageResponse toResponse(MindFlowConversation conversation) {
        return new MindFlowConversationMessageResponse(
                conversation.getId(),
                conversation.getSessionId(),
                conversation.getUserId(),
                conversation.getSpeaker(),
                conversation.getMessage(),
                conversation.getAudioUrl(),
                conversation.getCreatedAt()
        );
    }
}