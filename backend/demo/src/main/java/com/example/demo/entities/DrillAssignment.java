package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

// One drill given to one player. Status moves over time:
// assigned -> submitted (player completed it) -> reviewed (coach responded).
@Entity
@Table(name = "drill_assignments")
public class DrillAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // All three LAZY: each repository query joins in only what its page needs.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "drill_id", nullable = false)
    private Drill drill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Players player;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id", nullable = false)
    private Coaches coach;

    @Column(name = "due_date")
    private LocalDate dueDate;

    // 'assigned', 'submitted' or 'reviewed' (CHECK constraint in V9).
    @Column(name = "status", nullable = false)
    private String status = "assigned";

    @Column(name = "coach_note")
    private String coachNote;

    // Filled by the database default (now()), so Hibernate never writes it.
    @Column(name = "assigned_at", insertable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Drill getDrill() {
        return drill;
    }

    public void setDrill(Drill drill) {
        this.drill = drill;
    }

    public Players getPlayer() {
        return player;
    }

    public void setPlayer(Players player) {
        this.player = player;
    }

    public Coaches getCoach() {
        return coach;
    }

    public void setCoach(Coaches coach) {
        this.coach = coach;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCoachNote() {
        return coachNote;
    }

    public void setCoachNote(String coachNote) {
        this.coachNote = coachNote;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

}
