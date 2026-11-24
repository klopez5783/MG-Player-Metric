package com.example.demo.dto;

import java.time.LocalDate;
import java.util.UUID;

// One player on the logged-in account. Age is worked out from the date of
// birth; coach fields are null until the player joins a coach.
public record PlayerSummaryResponse(
        UUID id,
        String name,
        LocalDate dateOfBirth,
        Integer age,
        String position,
        String team,
        UUID coachId,
        String coachName) {
}
