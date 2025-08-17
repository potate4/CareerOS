package com.careeros.backend.payload.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class AILearningPathRequest {
    
    @NotNull(message = "User ID is required")
    private Integer user_id;
    
    @NotBlank(message = "Learning path info is required")
    private String learning_path_info;
    
    // Constructors
    public AILearningPathRequest() {}
    
    public AILearningPathRequest(Integer user_id, String learning_path_info) {
        this.user_id = user_id;
        this.learning_path_info = learning_path_info;
    }
    
    // Getters and Setters
    public Integer getUser_id() {
        return user_id;
    }
    
    public void setUser_id(Integer user_id) {
        this.user_id = user_id;
    }
    
    public String getLearning_path_info() {
        return learning_path_info;
    }
    
    public void setLearning_path_info(String learning_path_info) {
        this.learning_path_info = learning_path_info;
    }
} 