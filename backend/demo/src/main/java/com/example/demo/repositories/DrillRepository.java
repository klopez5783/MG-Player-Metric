package com.example.demo.repositories;

import com.example.demo.entities.Drill;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface DrillRepository extends JpaRepository<Drill, Integer> {
    // The library a coach sees: every built-in drill plus their own custom
    // ones, skipping archived drills. Sub-attributes (and their attribute)
    // are joined into the same query, instead of one query per drill.
    @EntityGraph(attributePaths = {"subAttributes", "subAttributes.attribute"})
    @Query("SELECT d FROM Drill d " +
           "WHERE d.archived = false AND (d.coach IS NULL OR d.coach.id = :coachId) " +
           "ORDER BY d.name")
    List<Drill> findLibraryForCoach(@Param("coachId") UUID coachId);
}
