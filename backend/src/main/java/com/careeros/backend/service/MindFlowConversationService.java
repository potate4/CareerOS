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
        
        // Generate initial soft skills scenario prompt based on session data
        String scenarioPrompt = buildScenarioPrompt(session, initialSessionData);
        String question = callAIToGenerateQuestion(sessionId, userId, initialSessionData, Collections.emptyList(), scenarioPrompt);
        String audioUrl = callAIForTTS(question);
        
        // Store AI message
        conversationRepository.save(new MindFlowConversation(sessionId, userId, "ai", question, audioUrl));
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
        // Store user message
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
                initialData = new ObjectMapper().readValue(sd, Map.class);
            }
        } catch (Exception e) {
            logger.warn("Failed to parse MindFlow sessionData as JSON: {}", e.getMessage());
        }
        
        // 4) Generate next soft skills scenario response
        String scenarioPrompt = buildScenarioPrompt(session, initialData);
        Map<String, Object> payload = new HashMap<>();
        payload.put("sessionId", sessionId);
        payload.put("userId", userId);
        payload.put("history", formatted);
        payload.put("initialData", initialData);
        payload.put("prompt", scenarioPrompt);
        
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

    private String callAIToGenerateQuestion(String sessionId, Long userId, Map<String, Object> initialData, 
                                           List<Map<String, String>> history, String prompt) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/generate-question";
            Map<String, Object> req = new HashMap<>();
            req.put("sessionId", sessionId);
            req.put("userId", userId);
            req.put("initialData", initialData);
            req.put("history", history);
            req.put("prompt", prompt);
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(req, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            return (String) body.get("question");
        } catch (Exception e) {
            logger.error("Failed to call MindFlow AI generate-question: {}", e.getMessage());
            return "Let's continue with our soft skills practice. Can you tell me about a challenging workplace situation you've faced?";
        }
    }

    private String callAIToGenerateNextQuestion(Map<String, Object> payload) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/generate-question";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            return (String) body.get("question");
        } catch (Exception e) {
            logger.error("Failed to call MindFlow AI next-question: {}", e.getMessage());
            return "That's an interesting perspective. How do you think you could approach that situation differently?";
        }
    }

    private String callAIForSTT(String audioUrl) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/stt";
            Map<String, String> req = Map.of("audioUrl", audioUrl);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(req, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            return (String) body.get("transcript");
        } catch (Exception e) {
            logger.error("Failed to call MindFlow AI STT: {}", e.getMessage());
            return "[Audio transcription unavailable]";
        }
    }

    private String callAIForTTS(String text) {
        try {
            String url = aiServiceUrl + "/api/v1/mindflow/tts";
            Map<String, String> req = Map.of("text", text, "language", "en");
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(req, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            Map<String, Object> body = response.getBody();
            return (String) body.get("audioUrl");
        } catch (Exception e) {
            logger.error("Failed to call MindFlow AI TTS: {}", e.getMessage());
            return null; // No audio URL available
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