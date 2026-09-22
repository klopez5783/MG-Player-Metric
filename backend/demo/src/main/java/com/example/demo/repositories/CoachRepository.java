package com.example.demo.repositories;

import com.example.demo.entities.Coaches;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CoachRepository extends JpaRepository<Coaches, UUID> {
    
}
