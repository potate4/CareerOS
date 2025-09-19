package com.careeros.backend.repository;

import com.careeros.backend.model.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    
    List<JobPosting> findByRecruiterIdOrderByCreatedAtDesc(Long recruiterId);
    
    List<JobPosting> findByRecruiterIdAndIsActiveOrderByCreatedAtDesc(Long recruiterId, Boolean isActive);
    
    List<JobPosting> findByIsActiveOrderByCreatedAtDesc(Boolean isActive);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.isActive = :isActive AND " +
           "(LOWER(jp.jobTitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(jp.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(jp.jobDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY jp.createdAt DESC")
    List<JobPosting> findByKeywordAndIsActive(@Param("keyword") String keyword, @Param("isActive") Boolean isActive);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.recruiter.id = :recruiterId AND jp.id = :jobId")
    Optional<JobPosting> findByIdAndRecruiterId(@Param("jobId") Long jobId, @Param("recruiterId") Long recruiterId);
    
    @Query("SELECT COUNT(jp) FROM JobPosting jp WHERE jp.recruiter.id = :recruiterId AND jp.isActive = true")
    Long countActiveJobsByRecruiterId(@Param("recruiterId") Long recruiterId);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.experienceLevel = :experienceLevel AND jp.isActive = true ORDER BY jp.createdAt DESC")
    List<JobPosting> findByExperienceLevelAndIsActive(@Param("experienceLevel") JobPosting.ExperienceLevel experienceLevel);
    
    @Query("SELECT jp FROM JobPosting jp WHERE jp.jobType = :jobType AND jp.isActive = true ORDER BY jp.createdAt DESC")
    List<JobPosting> findByJobTypeAndIsActive(@Param("jobType") JobPosting.JobType jobType);
}