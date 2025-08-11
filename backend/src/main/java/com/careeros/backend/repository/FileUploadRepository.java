package com.careeros.backend.repository;

import com.careeros.backend.model.FileUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileUploadRepository extends JpaRepository<FileUpload, Long> {
    
    List<FileUpload> findByUserId(Long userId);
    
    List<FileUpload> findByUserIdAndCategory(Long userId, String category);
    
    List<FileUpload> findByUserIdOrderByUploadedAtDesc(Long userId);
} 