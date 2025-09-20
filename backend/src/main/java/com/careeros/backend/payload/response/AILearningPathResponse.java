package com.careeros.backend.payload.response;

import java.util.List;

public class AILearningPathResponse {
    
    private List<AILearningModule> modules;
    
    // Constructors
    public AILearningPathResponse() {}
    
    public AILearningPathResponse(List<AILearningModule> modules) {
        this.modules = modules;
    }
    
    // Getters and Setters
    public List<AILearningModule> getModules() {
        return modules;
    }
    
    public void setModules(List<AILearningModule> modules) {
        this.modules = modules;
    }
    
    // Inner class for AI Learning Module
    public static class AILearningModule {
        private String module_name;
        private String module_description;
        
        // Constructors
        public AILearningModule() {}
        
        public AILearningModule(String module_name, String module_description) {
            this.module_name = module_name;
            this.module_description = module_description;
        }
        
        // Getters and Setters
        public String getModule_name() {
            return module_name;
        }
        
        public void setModule_name(String module_name) {
            this.module_name = module_name;
        }
        
        public String getModule_description() {
            return module_description;
        }
        
        public void setModule_description(String module_description) {
            this.module_description = module_description;
        }
    }
} 