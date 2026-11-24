package com.example.demo.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

// A player added to the logged-in account, e.g. a parent adding a child.
public record CreatePlayerRequest(
        @NotBlank @Size(max = 100) String name,
        @Past LocalDate dateOfBirth,
        @Size(max = 50) String position,
        @Size(max = 100) String team) {
}
