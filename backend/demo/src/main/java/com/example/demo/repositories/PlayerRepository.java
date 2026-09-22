package com.example.demo.repositories;

import com.example.demo.entities.Players;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PlayerRepository extends JpaRepository<Players, UUID> {
}
