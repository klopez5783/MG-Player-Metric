package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.services.EvaluationDetailService;

import jakarta.validation.Valid;

import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.UserRepository;
import com.example.demo.repositories.CoachRepository;
import com.example.demo.repositories.EvaluationRepository;
import com.example.demo.repositories.DrillAssignmentRepository;

import com.example.demo.dto.CreatePlayerRequest;
import com.example.demo.dto.EvaluationDetailResponse;
import com.example.demo.dto.GetAssignedDrillsResponse;
import com.example.demo.dto.JoinCoachRequest;
import com.example.demo.dto.PlayerSummaryResponse;
import com.example.demo.dto.SubmitDrillRequest;
import com.example.demo.dto.UpdatePlayerRequest;

import com.example.demo.events.DrillSubmittedEvent;

import com.example.demo.entities.Coaches;
import com.example.demo.entities.Drill;
import com.example.demo.entities.DrillAssignment;
import com.example.demo.entities.Players;
import com.example.demo.entities.User;
import com.example.demo.entities.Evaluation;

// One login can manage several players (e.g. a parent with two children).
// "/me" lists and adds them; every other route names the player in the URL
// and checks this login manages it, since the token id is the account, not
// the player.
@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final UserRepository userRepository;
    private final CoachRepository coachRepository;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationDetailService evaluationDetailService;
    private final DrillAssignmentRepository drillAssignmentRepository;
    // Email notifications: NotificationListener sends them once the save commits.
    private final ApplicationEventPublisher events;

    public PlayerController(
            PlayerRepository playerRepository,
            UserRepository userRepository,
            CoachRepository coachRepository,
            EvaluationRepository evaluationRepository,
            EvaluationDetailService evaluationDetailService,
            DrillAssignmentRepository drillAssignmentRepository,
            ApplicationEventPublisher events) {
        this.playerRepository = playerRepository;
        this.userRepository = userRepository;
        this.coachRepository = coachRepository;
        this.evaluationRepository = evaluationRepository;
        this.evaluationDetailService = evaluationDetailService;
        this.drillAssignmentRepository = drillAssignmentRepository;
        this.events = events;
    }

    // The players this login manages, newest first.
    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PlayerSummaryResponse>> myPlayers(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<PlayerSummaryResponse> players = playerRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummary)
                .toList();
        return ResponseEntity.ok(players);
    }

    // Add a player to this login, e.g. a parent adding another child.
    // 403 for coach accounts.
    @PostMapping("/me")
    @Transactional
    public ResponseEntity<PlayerSummaryResponse> addPlayer(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreatePlayerRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || !"player".equals(user.getRole()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // not a player account

        LocalDateTime now = LocalDateTime.now();
        Players player = new Players();
        player.setUser(user);
        player.setName(request.name().trim());
        player.setDateOfBirth(request.dateOfBirth());
        player.setPosition(request.position());
        player.setTeam(request.team());
        player.setCreatedAt(now);
        player.setUpdatedAt(now);
        playerRepository.save(player); // the id is generated here

        return ResponseEntity.status(HttpStatus.CREATED).body(toSummary(player));
    }

    // Edit a player's name, date of birth, position and team, e.g. filling in
    // the auto-created first player. 404 if this login doesn't manage it.
    @PutMapping("/me/{playerId}")
    @Transactional
    public ResponseEntity<PlayerSummaryResponse> updatePlayer(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId,
            @Valid @RequestBody UpdatePlayerRequest request) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players

        player.setName(request.name().trim());
        player.setDateOfBirth(request.dateOfBirth());
        player.setPosition(request.position());
        player.setTeam(request.team());
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(toSummary(player));
    }

    // Remove a player added by mistake. 409 if it's the account's last player
    // (every player account keeps one), or if the player already has
    // evaluations or drill assignments: those reference the player and
    // would be lost. 404 if this login doesn't manage the player.
    @DeleteMapping("/me/{playerId}")
    @Transactional
    public ResponseEntity<Void> deletePlayer(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID playerId) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players
        if (playerRepository.countByUserId(player.getUser().getId()) <= 1)
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // last player
        if (evaluationRepository.existsByPlayerId(playerId) || drillAssignmentRepository.existsByPlayerId(playerId))
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // has history

        playerRepository.delete(player);
        return ResponseEntity.noContent().build();
    }

    // The player's most recent evaluation, with attribute and sub-attribute
    // ratings and comments nested. 204 if they have none yet, 404 if this
    // login doesn't manage the player.
    @GetMapping("/me/{playerId}/evaluations/latest")
    @Transactional(readOnly = true)
    public ResponseEntity<EvaluationDetailResponse> myLatestEvaluation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players

        Evaluation evaluation = evaluationRepository.findFirstByPlayerIdOrderByEvaluationDateDescIdDesc(player.getId())
                .orElse(null);
        if (evaluation == null)
            return ResponseEntity.noContent().build(); // no evaluation yet

        return ResponseEntity.ok(evaluationDetailService.build(evaluation));
    }

    // Player joins a coach with the code
    @PostMapping("/me/{playerId}/coach")
    @Transactional
    public ResponseEntity<Void> joinCoach(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId,
            @RequestBody JoinCoachRequest request) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players
        if (player.getCoach() != null)
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // already linked

        String code = request.code() == null ? "" : request.code().trim().toUpperCase();
        Coaches coach = coachRepository.findByInviteCode(code).orElse(null);
        if (coach == null)
            return ResponseEntity.notFound().build(); // wrong code

        player.setCoach(coach);
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/me/{playerId}/coach")
    @Transactional
    public ResponseEntity<Void> leaveCoach(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID playerId) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players
        if (player.getCoach() == null)
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // no coach to leave

        player.setCoach(null);
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/{playerId}/drill-assignments")
    @Transactional(readOnly = true)
    public ResponseEntity<List<GetAssignedDrillsResponse>> myDrills(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players

        List<GetAssignedDrillsResponse> drills = drillAssignmentRepository.findByPlayerIdOrderByAssignedAtDesc(player.getId())
                .stream()
                .map(assignment -> {
                    Drill drill = assignment.getDrill();
                    return new GetAssignedDrillsResponse(
                            assignment.getId(),
                            drill.getId(),
                            drill.getName(),
                            drill.getDescription(),
                            drill.getInstructions(),
                            drill.getEquipment(),
                            drill.getDemoVideoUrl(),
                            drill.getDifficulty(),
                            drill.getDurationMinutes(),
                            drill.isRequiresVideo(),
                            player.getId(),
                            player.getName(),
                            assignment.getDueDate(),
                            assignment.getStatus(),
                            assignment.getCoachNote(),
                            assignment.getAssignedAt(),
                            assignment.getSubmittedAt(),
                            assignment.getReviewedAt(),
                            assignment.getVideoPath(),
                            assignment.getPlayerNote(),
                            assignment.getCoachReviewComment()
                    );
                })
                .toList();

        return ResponseEntity.ok(drills);
    }

    @PostMapping("/me/{playerId}/drill-assignments/{assignmentId}/submit")
    @Transactional
    public ResponseEntity<Void> submitDrill(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId,
            @PathVariable Integer assignmentId,
            @Valid @RequestBody SubmitDrillRequest request) {
        Players player = ownedPlayer(jwt, playerId);
        if (player == null)
            return ResponseEntity.notFound().build(); // not one of this login's players

        DrillAssignment assignment = drillAssignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null)
            return ResponseEntity.notFound().build(); // no such assignment
        if (!assignment.getPlayer().getId().equals(player.getId()))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // another player's
        if ("reviewed".equals(assignment.getStatus()))
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // already reviewed

        // The video must be in this player's own folder: "<player id>/..."
        if (!request.videoPath().startsWith(player.getId() + "/"))
            return ResponseEntity.badRequest().build();

        assignment.setVideoPath(request.videoPath());
        assignment.setPlayerNote(request.playerNote());
        assignment.setStatus("submitted");
        assignment.setSubmittedAt(LocalDateTime.now());

        events.publishEvent(new DrillSubmittedEvent(
                assignment.getCoach().getUser().getEmail(), player.getName(), assignment.getDrill().getName()));
        return ResponseEntity.noContent().build();
    }

    // The player with this id if the logged-in account manages it, else null.
    // The token id is the account (users.id), not the player.
    private Players ownedPlayer(Jwt jwt, UUID playerId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return playerRepository.findByIdAndUserId(playerId, userId).orElse(null);
    }

    private PlayerSummaryResponse toSummary(Players player) {
        Coaches coach = player.getCoach();
        return new PlayerSummaryResponse(
                player.getId(),
                player.getName(),
                player.getDateOfBirth(),
                player.getAge(),
                player.getPosition(),
                player.getTeam(),
                coach == null ? null : coach.getId(),
                coach == null ? null : coach.getUser().getName());
    }
}
