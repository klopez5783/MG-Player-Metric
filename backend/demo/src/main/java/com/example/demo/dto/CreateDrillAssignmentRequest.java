package com.example.demo.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Body of POST /coaches/me/drill-assignments. dueDate and coachNote are
// optional; a null dueDate passes @FutureOrPresent.
public record CreateDrillAssignmentRequest(
    @NotNull Integer drillId,
    @NotNull UUID playerId,
    @FutureOrPresent LocalDate dueDate,
    @Size(max = 1000) String coachNote
) {
}
