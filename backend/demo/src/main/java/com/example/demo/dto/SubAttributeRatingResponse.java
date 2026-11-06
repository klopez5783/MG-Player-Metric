package com.example.demo.dto;

import java.math.BigDecimal;

public record SubAttributeRatingResponse(
    Integer subAttributeId,
    String name,
    BigDecimal rating,
    String comment
) {
}
