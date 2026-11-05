package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;

public record AttributeRatingRequest(
    Integer attributeId,
    BigDecimal rating,
    String comment,
    List<SubAttributeRatingRequest> subAttributes
) {
}
