package com.careeros.backend.repository;

import com.careeros.backend.model.JobLearningModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobLearningModuleRepository extends JpaRepository<JobLearningModule, Long> {
    
    List<JobLearningModule> findByJobLearningPathIdOrderByOrderIndex(Long jobLearningPathId);
    
    @Query("SELECT jlm FROM JobLearningModule jlm WHERE jlm.jobLearningPath.jobPosting.id = :jobPostingId ORDER BY jlm.orderIndex")
    List<JobLearningModule> findByJobPostingIdOrderByOrderIndex(@Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT jlm FROM JobLearningModule jlm WHERE jlm.jobLearningPath.jobPosting.recruiter.id = :recruiterId AND jlm.jobLearningPath.jobPosting.id = :jobPostingId ORDER BY jlm.orderIndex")
    List<JobLearningModule> findByJobPostingIdAndRecruiterIdOrderByOrderIndex(@Param("jobPostingId") Long jobPostingId, @Param("recruiterId") Long recruiterId);
    
    @Query("SELECT COUNT(jlm) FROM JobLearningModule jlm WHERE jlm.jobLearningPath.id = :jobLearningPathId")
    Long countByJobLearningPathId(@Param("jobLearningPathId") Long jobLearningPathId);
}