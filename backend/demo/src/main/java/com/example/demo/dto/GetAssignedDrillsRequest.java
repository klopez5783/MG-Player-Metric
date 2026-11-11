package com.example.demo.dto;

import java.util.UUID;

import jakarta.validation.constraints.Pattern;

// Optional filters for listing drill assignments, read from the query string
// (e.g. ?playerId=...&status=assigned) rather than a body, since it's a GET.
// Bind it with @Valid @ModelAttribute. Both fields null = no filter.
public record GetAssignedDrillsRequest(
    UUID playerId,
    @Pattern(regexp = "assigned|submitted|reviewed") String status
) {
}
