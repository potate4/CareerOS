package com.careeros.backend.repository;

import com.careeros.backend.model.JobAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobAssessmentRepository extends JpaRepository<JobAssessment, Long> {
    
    List<JobAssessment> findByJobPostingIdOrderByCreatedAtDesc(Long jobPostingId);
    
    List<JobAssessment> findByJobPostingIdAndIsActiveOrderByCreatedAtDesc(Long jobPostingId, Boolean isActive);
    
    @Query("SELECT ja FROM JobAssessment ja WHERE ja.jobPosting.recruiter.id = :recruiterId AND ja.jobPosting.id = :jobPostingId ORDER BY ja.createdAt DESC")
    List<JobAssessment> findByJobPostingIdAndRecruiterIdOrderByCreatedAtDesc(@Param("jobPostingId") Long jobPostingId, @Param("recruiterId") Long recruiterId);
    
    @Query("SELECT ja FROM JobAssessment ja WHERE ja.jobPosting.recruiter.id = :recruiterId AND ja.id = :assessmentId")
    Optional<JobAssessment> findByIdAndRecruiterId(@Param("assessmentId") Long assessmentId, @Param("recruiterId") Long recruiterId);
    
    @Query("SELECT COUNT(ja) FROM JobAssessment ja WHERE ja.jobPosting.id = :jobPostingId AND ja.isActive = true")
    Long countActiveAssessmentsByJobPostingId(@Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT ja FROM JobAssessment ja WHERE ja.assessmentType = :assessmentType AND ja.isActive = true ORDER BY ja.createdAt DESC")
    List<JobAssessment> findByAssessmentTypeAndIsActive(@Param("assessmentType") JobAssessment.AssessmentType assessmentType);
    
    List<JobAssessment> findByJobPostingIdAndIsActive(Long jobPostingId, Boolean isActive);
    
    @Query("SELECT ja FROM JobAssessment ja LEFT JOIN FETCH ja.questions WHERE ja.jobPosting.id = :jobPostingId AND ja.isActive = true ORDER BY ja.createdAt DESC")
    List<JobAssessment> findByJobPostingIdWithQuestions(@Param("jobPostingId") Long jobPostingId);
}