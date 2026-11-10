package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

// One drill in the library. coach == null means a built-in drill shared by
// every coach; otherwise a custom drill only that coach sees.
@Entity
@Table(name = "drills")
public class Drill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // LAZY: listing the library never needs the coach row, so don't load it.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coach_id")
    private Coaches coach;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    // 'beginner', 'intermediate' or 'advanced' (CHECK constraint in V9).
    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "equipment")
    private String equipment;

    @Column(name = "demo_video_url")
    private String demoVideoUrl;

    @Column(name = "requires_video", nullable = false)
    private boolean requiresVideo;

    @Column(name = "archived", nullable = false)
    private boolean archived;

    // Filled by the database default (now()), so Hibernate never writes it.
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // The sub-attributes this drill trains, through the drill_sub_attributes
    // link table. That table only holds the two ids, so it needs no entity
    // of its own. LAZY by default; DrillRepository joins it in when needed.
    @ManyToMany
    @JoinTable(
        name = "drill_sub_attributes",
        joinColumns = @JoinColumn(name = "drill_id"),
        inverseJoinColumns = @JoinColumn(name = "sub_attribute_id")
    )
    private Set<SubAttribute> subAttributes = new HashSet<>();

    // Getters and Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Coaches getCoach() {
        return coach;
    }

    public void setCoach(Coaches coach) {
        this.coach = coach;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public String getDemoVideoUrl() {
        return demoVideoUrl;
    }

    public void setDemoVideoUrl(String demoVideoUrl) {
        this.demoVideoUrl = demoVideoUrl;
    }

    public boolean isRequiresVideo() {
        return requiresVideo;
    }

    public void setRequiresVideo(boolean requiresVideo) {
        this.requiresVideo = requiresVideo;
    }

    public boolean isArchived() {
        return archived;
    }

    public void setArchived(boolean archived) {
        this.archived = archived;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Set<SubAttribute> getSubAttributes() {
        return subAttributes;
    }

    public void setSubAttributes(Set<SubAttribute> subAttributes) {
        this.subAttributes = subAttributes;
    }

}
