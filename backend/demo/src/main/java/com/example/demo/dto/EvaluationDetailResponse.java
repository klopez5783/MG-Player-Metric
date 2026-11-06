package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EvaluationDetailResponse(
    Integer id,
    UUID playerId,
    String playerName,
    LocalDateTime evaluationDate,
    String evaluationType,
    BigDecimal overallRating,
    String strengths,
    String weaknesses,
    String generalComment,
    List<AttributeRatingResponse> attributes
) {
}
