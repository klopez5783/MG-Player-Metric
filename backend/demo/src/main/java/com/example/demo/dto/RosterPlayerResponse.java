package com.example.demo.dto;

import java.util.UUID;

public record RosterPlayerResponse(UUID id, String name, String team, String position) {
    
}