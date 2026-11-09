package com.example.demo.repositories;

import com.example.demo.entities.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EvaluationRepository extends JpaRepository<Evaluation, Integer> {
    // Newest first, for a player's evaluation history.
    List<Evaluation> findByPlayerIdOrderByEvaluationDateDescIdDesc(UUID playerId);

    // The player's most recent evaluation, same ordering as above.
    Optional<Evaluation> findFirstByPlayerIdOrderByEvaluationDateDescIdDesc(UUID playerId);
}
