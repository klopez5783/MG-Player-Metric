package com.example.demo.events;

import java.time.LocalDate;

// A coach assigned a drill; emails the account that manages the player.
public record DrillAssignedEvent(
        String toEmail, String playerName, String coachName, String drillName, LocalDate dueDate) {
}
