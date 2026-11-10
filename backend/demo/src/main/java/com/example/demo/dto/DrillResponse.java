package com.example.demo.dto;

import java.util.List;

// One drill in the coach's library. custom = true for the coach's own
// drills, false for built-in ones.
public record DrillResponse(
    Integer id,
    String name,
    String description,
    String instructions,
    Integer durationMinutes,
    String difficulty,
    String equipment,
    String demoVideoUrl,
    boolean requiresVideo,
    boolean custom,
    List<DrillSubAttributeResponse> subAttributes
) {
}
