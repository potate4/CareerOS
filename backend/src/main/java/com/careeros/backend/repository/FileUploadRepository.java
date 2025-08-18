package com.careeros.backend.repository;

import com.careeros.backend.model.FileUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileUploadRepository extends JpaRepository<FileUpload, Long> {
    
    List<FileUpload> findByUserId(Long userId);
    
    List<FileUpload> findByUserIdAndCategory(Long userId, String category);
    
    List<FileUpload> findByUserIdOrderByUploadedAtDesc(Long userId);
    
    // Module-specific queries
    List<FileUpload> findByModuleIdOrderByUploadedAtDesc(Long moduleId);
    
    List<FileUpload> findByUserIdAndModuleId(Long userId, Long moduleId);
    
    @Query("SELECT f FROM FileUpload f WHERE f.userId = :userId AND f.category = 'learning_module' AND f.moduleId = :moduleId ORDER BY f.uploadedAt DESC")
    List<FileUpload> findModuleLearningFiles(@Param("userId") Long userId, @Param("moduleId") Long moduleId);
    
    @Query("SELECT f FROM FileUpload f WHERE f.indexingStatus = :status ORDER BY f.uploadedAt ASC")
    List<FileUpload> findByIndexingStatus(@Param("status") String status);
} 