package com.example.demo.events;

// A player submitted a drill video; emails the coach.
public record DrillSubmittedEvent(String toEmail, String playerName, String drillName) {
}
