package com.example.demo.repositories;

import com.example.demo.entities.AttributeRating;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttributeRatingRepository extends JpaRepository<AttributeRating, Integer> {
    // Joins the attribute into the same query, instead of loading each
    // attribute with its own query afterwards.
    @EntityGraph(attributePaths = {"attribute"})
    List<AttributeRating> findByEvaluationIdOrderByAttributeDisplayOrderAsc(Integer evaluationId);
}
