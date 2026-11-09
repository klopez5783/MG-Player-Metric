package com.example.demo.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.dto.AttributeRatingResponse;
import com.example.demo.dto.EvaluationDetailResponse;
import com.example.demo.dto.SubAttributeRatingResponse;
import com.example.demo.entities.AttributeRating;
import com.example.demo.entities.Evaluation;
import com.example.demo.entities.Players;
import com.example.demo.repositories.AttributeRatingRepository;
import com.example.demo.repositories.SubAttributeRatingRepository;

// Builds the full evaluation response (attributes with their sub-attribute
// ratings nested). Shared by the coach and player endpoints so both return
// the same shape. Callers check who is allowed to see the evaluation first.
@Service
public class EvaluationDetailService {

    private final AttributeRatingRepository attributeRatingRepository;
    private final SubAttributeRatingRepository subAttributeRatingRepository;

    public EvaluationDetailService(
            AttributeRatingRepository attributeRatingRepository,
            SubAttributeRatingRepository subAttributeRatingRepository) {
        this.attributeRatingRepository = attributeRatingRepository;
        this.subAttributeRatingRepository = subAttributeRatingRepository;
    }

    // Two queries: the evaluation's attribute ratings, and all of its
    // sub-attribute ratings, grouped here under their attribute rating.
    // Attribute ratings load first on purpose: the sub-attribute rows point
    // at them (and at the attributes), and Hibernate reuses what's already
    // loaded instead of querying for each one again.
    public EvaluationDetailResponse build(Evaluation evaluation) {
        Integer evaluationId = evaluation.getId();

        List<AttributeRating> attributeRatings =
            attributeRatingRepository.findByEvaluationIdOrderByAttributeDisplayOrderAsc(evaluationId);

        Map<Integer, List<SubAttributeRatingResponse>> subRatingsByAttributeRating =
            subAttributeRatingRepository.findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(evaluationId).stream()
                .collect(Collectors.groupingBy(
                    sub -> sub.getAttributeRating().getId(),
                    Collectors.mapping(
                        sub -> new SubAttributeRatingResponse(
                            sub.getSubAttribute().getId(),
                            sub.getSubAttribute().getName(),
                            sub.getRating(),
                            sub.getComment()
                        ),
                        Collectors.toList()
                    )
                ));

        List<AttributeRatingResponse> attributes =
            attributeRatings.stream()
                .map(rating -> new AttributeRatingResponse(
                    rating.getAttribute().getId(),
                    rating.getAttribute().getName(),
                    rating.getRating(),
                    rating.getComment(),
                    subRatingsByAttributeRating.getOrDefault(rating.getId(), List.of())
                ))
                .toList();

        Players player = evaluation.getPlayer();
        return new EvaluationDetailResponse(
            evaluation.getId(),
            player.getId(),
            player.getUser().getName(),
            evaluation.getEvaluationDate(),
            evaluation.getEvaluationType(),
            evaluation.getOverallRating(),
            evaluation.getStrengths(),
            evaluation.getWeaknesses(),
            evaluation.getGeneralComment(),
            attributes
        );
    }
}
