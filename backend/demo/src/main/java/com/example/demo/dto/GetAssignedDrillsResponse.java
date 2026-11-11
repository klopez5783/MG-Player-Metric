package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

// One drill assignment in a list: who it's for, which drill (enough to show
// a row without fetching the full drill), and where it is in
// assigned -> submitted -> reviewed.
public record GetAssignedDrillsResponse(
        Integer id,
        Integer drillId,
        String drillName,
        String description,
        String instructions,
        String equipment,
        String demoVideoUrl,
        String difficulty,
        Integer durationMinutes,
        boolean requiresVideo,
        UUID playerId,
        String playerName,
        LocalDate dueDate,
        String status,
        String coachNote,
        LocalDateTime assignedAt,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt) {
}
