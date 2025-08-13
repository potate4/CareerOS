package com.careeros.backend.controller;

import com.careeros.backend.config.AIConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {
    
    @Autowired
    private AIConfig aiConfig;
    
    @GetMapping("/ai")
    public ResponseEntity<Map<String, Object>> getAIConfig() {
        Map<String, Object> config = new HashMap<>();
        
        // OpenAI Configuration
        Map<String, Object> openai = new HashMap<>();
        openai.put("apiKey", aiConfig.getOpenai().getApiKey());
        openai.put("model", aiConfig.getOpenai().getModel());
        openai.put("maxTokens", aiConfig.getOpenai().getMaxTokens());
        openai.put("temperature", aiConfig.getOpenai().getTemperature());
        
        // Service Configuration
        config.put("openai", openai);
        config.put("primaryService", aiConfig.getPrimary());
        config.put("fallbackEnabled", aiConfig.getFallback().isEnabled());
        config.put("fallbackType", aiConfig.getFallback().getType());
        config.put("serviceUrl", aiConfig.getServiceUrl());
        
        return ResponseEntity.ok(config);
    }
}
