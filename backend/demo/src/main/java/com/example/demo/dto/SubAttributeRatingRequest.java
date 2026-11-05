package com.example.demo.dto;

import java.math.BigDecimal;

public record SubAttributeRatingRequest(
    Integer subAttributeId,
    BigDecimal rating,
    String comment
) {
}
