package com.example.demo.dto;

// A sub-attribute a drill trains, with its parent attribute's name so the
// frontend can show "Passing · Vision" without another request.
public record DrillSubAttributeResponse(
    Integer id,
    String name,
    String attributeName
) {
}
