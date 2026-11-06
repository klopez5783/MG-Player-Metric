package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.Valid;

public record CreateEvaluationRequest(
    @NotNull UUID playerId,
    @NotNull LocalDate evaluationDate,
    @NotNull @Pattern(regexp = "initial|monthly|quarterly") String evaluationType,
    @DecimalMin("1") @DecimalMax("10") BigDecimal overallRating,
    String strengths,
    String weaknesses,
    String generalComment,
    @NotNull @Valid List<AttributeRatingRequest> attributes
) {
}
