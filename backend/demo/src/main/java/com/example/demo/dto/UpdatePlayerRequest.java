package com.example.demo.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

// Edit one of the logged-in account's players. Replaces every field, so send
// the current values for anything not being changed; null clears a field.
public record UpdatePlayerRequest(
        @NotBlank @Size(max = 100) String name,
        @Past LocalDate dateOfBirth,
        @Size(max = 50) String position,
        @Size(max = 100) String team) {
}
