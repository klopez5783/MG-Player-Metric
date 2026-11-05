package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateEvaluationRequest(
    UUID playerId,
    LocalDate evaluationDate,
    String evaluationType,
    BigDecimal overallRating,
    String strengths,
    String weaknesses,
    String generalComment,
    List<AttributeRatingRequest> attributes
) {
}
