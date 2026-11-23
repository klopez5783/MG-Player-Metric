package com.example.demo.dto;

import jakarta.validation.constraints.Size;

// What the coach sends when marking a submission reviewed: an optional
// comment the player will see on the drill.
public record ReviewDrillRequest(
        @Size(max = 2000) String comment) {
}
