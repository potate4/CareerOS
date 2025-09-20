package com.careeros.backend.repository;

import com.careeros.backend.model.CandidateSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateSubmissionRepository extends JpaRepository<CandidateSubmission, Long> {
    
    List<CandidateSubmission> findByJobPostingIdOrderBySubmittedAtDesc(Long jobPostingId);
    
    List<CandidateSubmission> findByCandidateIdOrderBySubmittedAtDesc(Long candidateId);
    
    @Query("SELECT cs FROM CandidateSubmission cs WHERE cs.jobPosting.recruiter.id = :recruiterId AND cs.jobPosting.id = :jobPostingId ORDER BY cs.submittedAt DESC")
    List<CandidateSubmission> findByJobPostingIdAndRecruiterIdOrderBySubmittedAtDesc(@Param("jobPostingId") Long jobPostingId, @Param("recruiterId") Long recruiterId);
    
    @Query("SELECT cs FROM CandidateSubmission cs WHERE cs.jobPosting.recruiter.id = :recruiterId ORDER BY cs.submittedAt DESC")
    List<CandidateSubmission> findByRecruiterIdOrderBySubmittedAtDesc(@Param("recruiterId") Long recruiterId);
    
    Optional<CandidateSubmission> findByJobPostingIdAndCandidateId(Long jobPostingId, Long candidateId);
    
    @Query("SELECT cs FROM CandidateSubmission cs WHERE cs.applicationStatus = :status ORDER BY cs.submittedAt DESC")
    List<CandidateSubmission> findByApplicationStatusOrderBySubmittedAtDesc(@Param("status") CandidateSubmission.ApplicationStatus status);
    
    @Query("SELECT cs FROM CandidateSubmission cs WHERE cs.jobPosting.id = :jobPostingId AND cs.overallScore >= :minScore ORDER BY cs.overallScore DESC")
    List<CandidateSubmission> findByJobPostingIdAndScoreGreaterThanEqualOrderByScoreDesc(@Param("jobPostingId") Long jobPostingId, @Param("minScore") Double minScore);
    
    @Query("SELECT COUNT(cs) FROM CandidateSubmission cs WHERE cs.jobPosting.id = :jobPostingId")
    Long countByJobPostingId(@Param("jobPostingId") Long jobPostingId);
    
    @Query("SELECT COUNT(cs) FROM CandidateSubmission cs WHERE cs.jobPosting.recruiter.id = :recruiterId")
    Long countByRecruiterId(@Param("recruiterId") Long recruiterId);
    
    @Query("SELECT cs FROM CandidateSubmission cs WHERE cs.jobPosting.id = :jobPostingId AND cs.learningPathCompleted = true ORDER BY cs.averageAssessmentScore DESC")
    List<CandidateSubmission> findQualifiedCandidatesByJobPostingIdOrderByScoreDesc(@Param("jobPostingId") Long jobPostingId);
    
    List<CandidateSubmission> findByJobPostingId(Long jobPostingId);
}