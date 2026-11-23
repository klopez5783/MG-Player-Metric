package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// What the player sends after uploading: where the file landed in Storage,
// plus an optional note for the coach.
public record SubmitDrillRequest(
        @NotBlank String videoPath,
        @Size(max = 1000) String playerNote) {
}
