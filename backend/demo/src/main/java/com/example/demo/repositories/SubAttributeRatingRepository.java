package com.example.demo.repositories;

import com.example.demo.entities.SubAttributeRating;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubAttributeRatingRepository extends JpaRepository<SubAttributeRating, Integer> {
    // Every sub-attribute rating for one evaluation in a single query, by
    // following attributeRating -> evaluation -> id. The sub-attribute and
    // attribute rating are joined in, instead of loaded one query per row.
    @EntityGraph(attributePaths = {"subAttribute", "attributeRating"})
    List<SubAttributeRating> findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(Integer evaluationId);
}
