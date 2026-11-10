package com.example.demo.repositories;

import com.example.demo.entities.DrillAssignment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DrillAssignmentRepository extends JpaRepository<DrillAssignment, Integer> {
    // A player's drills, newest first, with each drill joined in.
    @EntityGraph(attributePaths = {"drill"})
    List<DrillAssignment> findByPlayerIdOrderByAssignedAtDesc(UUID playerId);

    // Everything a coach has assigned, newest first, with the drill and the
    // player's name (player -> user) joined in.
    @EntityGraph(attributePaths = {"drill", "player", "player.user"})
    List<DrillAssignment> findByCoachIdOrderByAssignedAtDesc(UUID coachId);
}
