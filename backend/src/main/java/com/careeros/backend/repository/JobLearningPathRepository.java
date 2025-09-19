package com.careeros.backend.repository;

import com.careeros.backend.model.JobLearningPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JobLearningPathRepository extends JpaRepository<JobLearningPath, Long> {
    
    Optional<JobLearningPath> findByJobPostingId(Long jobPostingId);
    
    @Query("SELECT jlp FROM JobLearningPath jlp WHERE jlp.jobPosting.id = :jobPostingId AND jlp.isActive = true")
    Optional<JobLearningPath> findActiveByJobPostingId(@Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT jlp FROM JobLearningPath jlp WHERE jlp.jobPosting.recruiter.id = :recruiterId AND jlp.jobPosting.id = :jobPostingId")
    Optional<JobLearningPath> findByJobPostingIdAndRecruiterId(@Param("jobPostingId") Long jobPostingId, @Param("recruiterId") Long recruiterId);
}