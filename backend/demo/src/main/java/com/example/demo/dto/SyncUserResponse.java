package com.example.demo.dto;

import java.util.UUID;

public record SyncUserResponse(UUID id, String email, String role) {
}
