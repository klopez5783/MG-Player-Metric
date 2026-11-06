package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EvaluationSummaryResponse(
    Integer id,
    LocalDateTime evaluationDate,
    String evaluationType,
    BigDecimal overallRating
) {
}
