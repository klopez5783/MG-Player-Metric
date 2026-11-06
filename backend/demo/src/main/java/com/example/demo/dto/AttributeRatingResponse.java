package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

public record AttributeRatingResponse(
    Integer attributeId,
    String name,
    BigDecimal rating,
    String comment,
    List<SubAttributeRatingResponse> subAttributes
) {
}
