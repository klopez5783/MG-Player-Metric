package com.example.demo.repositories;

import com.example.demo.entities.SubAttributeRating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubAttributeRatingRepository extends JpaRepository<SubAttributeRating, Integer> {
    // Every sub-attribute rating for one evaluation in a single query, by
    // following attributeRating -> evaluation -> id.
    List<SubAttributeRating> findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(Integer evaluationId);
}
