package com.example.demo.events;

// A coach reviewed a submitted drill; emails the account that manages the player.
public record DrillReviewedEvent(
        String toEmail, String playerName, String coachName, String drillName, String comment) {
}
