package com.careeros.backend.repository;

import com.careeros.backend.model.CandidateLearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateLearningProgressRepository extends JpaRepository<CandidateLearningProgress, Long> {
    
    Optional<CandidateLearningProgress> findByCandidateSubmissionId(Long candidateSubmissionId);
    
    @Query("SELECT clp FROM CandidateLearningProgress clp WHERE clp.candidateSubmission.candidate.id = :candidateId")
    List<CandidateLearningProgress> findByCandidateId(@Param("candidateId") Long candidateId);
    
    @Query("SELECT clp FROM CandidateLearningProgress clp WHERE clp.jobLearningPath.jobPosting.id = :jobPostingId")
    List<CandidateLearningProgress> findByJobPostingId(@Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT clp FROM CandidateLearningProgress clp WHERE clp.candidateSubmission.candidate.id = :candidateId AND clp.jobLearningPath.jobPosting.id = :jobPostingId")
    Optional<CandidateLearningProgress> findByCandidateIdAndJobPostingId(@Param("candidateId") Long candidateId, @Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT clp FROM CandidateLearningProgress clp WHERE clp.isCompleted = true")
    List<CandidateLearningProgress> findCompletedLearningPaths();
    
    @Query("SELECT AVG(clp.progressPercentage) FROM CandidateLearningProgress clp WHERE clp.jobLearningPath.jobPosting.id = :jobPostingId")
    Double getAverageProgressByJobPostingId(@Param("jobPostingId") Long jobPostingId);
}