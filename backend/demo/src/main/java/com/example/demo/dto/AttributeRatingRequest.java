package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record AttributeRatingRequest(
    @NotNull Integer attributeId,
    @DecimalMin("1") @DecimalMax("10") BigDecimal rating,
    String comment,
    @NotNull @Valid List<SubAttributeRatingRequest> subAttributes
) {
}
