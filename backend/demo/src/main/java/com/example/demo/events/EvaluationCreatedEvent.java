package com.example.demo.events;

// A coach saved an evaluation; emails the account that manages the player.
// Events carry plain values, not entities: the listener runs after the
// transaction has closed, when lazy relations can no longer be loaded.
public record EvaluationCreatedEvent(String toEmail, String playerName, String coachName) {
}
