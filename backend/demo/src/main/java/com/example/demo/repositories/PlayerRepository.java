package com.example.demo.repositories;

import com.example.demo.entities.Players;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<Players, UUID> {
    List<Players> findByCoachId(UUID coachId);

    // Every player one account manages (a parent's children, or just the
    // player themselves).
    List<Players> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // The player only if this account manages it; empty otherwise.
    Optional<Players> findByIdAndUserId(UUID playerId, UUID userId);

    boolean existsByUserId(UUID userId);

    long countByUserId(UUID userId);
}
