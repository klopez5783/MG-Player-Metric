package com.example.demo.repositories;

import com.example.demo.entities.Players;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;

public interface PlayerRepository extends JpaRepository<Players, UUID> {
    // Joins each player's user row (where the name lives) into the same
    // query, instead of one query per player.
    @EntityGraph(attributePaths = {"user"})
    List<Players> findByCoachId(UUID coachId);
}
