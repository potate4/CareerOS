package com.careeros.backend.repository;

import com.careeros.backend.model.CandidateModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateModuleProgressRepository extends JpaRepository<CandidateModuleProgress, Long> {
    
    List<CandidateModuleProgress> findByCandidateLearningProgressId(Long candidateLearningProgressId);
    
    List<CandidateModuleProgress> findByCandidateLearningProgressIdOrderByJobLearningModuleOrderIndex(Long candidateLearningProgressId);
    
    @Query("SELECT cmp FROM CandidateModuleProgress cmp WHERE cmp.candidateLearningProgress.candidateSubmission.candidate.id = :candidateId AND cmp.jobLearningModule.id = :moduleId")
    Optional<CandidateModuleProgress> findByCandidateIdAndModuleId(@Param("candidateId") Long candidateId, @Param("moduleId") Long moduleId);
    
    @Query("SELECT cmp FROM CandidateModuleProgress cmp WHERE cmp.candidateLearningProgress.candidateSubmission.candidate.id = :candidateId AND cmp.candidateLearningProgress.jobLearningPath.jobPosting.id = :jobPostingId ORDER BY cmp.jobLearningModule.orderIndex")
    List<CandidateModuleProgress> findByCandidateIdAndJobPostingIdOrderByModuleOrder(@Param("candidateId") Long candidateId, @Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT COUNT(cmp) FROM CandidateModuleProgress cmp WHERE cmp.candidateLearningProgress.id = :learningProgressId AND cmp.isCompleted = true")
    Long countCompletedModulesByLearningProgressId(@Param("learningProgressId") Long learningProgressId);
    
    @Query("SELECT cmp FROM CandidateModuleProgress cmp WHERE cmp.isCompleted = true AND cmp.candidateLearningProgress.jobLearningPath.jobPosting.id = :jobPostingId")
    List<CandidateModuleProgress> findCompletedModulesByJobPostingId(@Param("jobPostingId") Long jobPostingId);
}