package com.example.demo.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

public record SubAttributeRatingRequest(
    @NotNull Integer subAttributeId,
    @NotNull @DecimalMin("1") @DecimalMax("10") BigDecimal rating,
    String comment
) {
}
