package com.example.demo.dto;

import java.util.UUID;

public record MeResponse(UUID id, String email, String name, String role, UUID coachId, String coachName) {}
