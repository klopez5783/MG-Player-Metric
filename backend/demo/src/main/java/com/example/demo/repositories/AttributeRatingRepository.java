package com.example.demo.repositories;

import com.example.demo.entities.AttributeRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeRatingRepository extends JpaRepository<AttributeRating, Integer> {
    List<AttributeRating> findByEvaluationIdOrderByAttributeDisplayOrderAsc(Integer evaluationId);
}
