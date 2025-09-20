package com.careeros.backend.repository;

import com.careeros.backend.model.Subtask;
import com.careeros.backend.model.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByMilestone(Milestone milestone);
    List<Subtask> findByMilestoneId(Long milestoneId);

    @Query("SELECT s FROM Subtask s WHERE s.milestone.id = :milestoneId ORDER BY s.position ASC, s.id ASC")
    List<Subtask> findOrderedByMilestone(@Param("milestoneId") Long milestoneId);
} 