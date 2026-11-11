package com.example.demo.controllers;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.demo.services.EvaluationDetailService;

import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.CoachRepository;
import com.example.demo.repositories.EvaluationRepository;
import com.example.demo.repositories.DrillAssignmentRepository;

import com.example.demo.dto.EvaluationDetailResponse;
import com.example.demo.dto.GetAssignedDrillsResponse;
import com.example.demo.dto.JoinCoachRequest;

import com.example.demo.entities.Coaches;
import com.example.demo.entities.Drill;
import com.example.demo.entities.Players;
import com.example.demo.entities.Evaluation;

@RestController
@RequestMapping("/players")
public class PlayerController {

    private final PlayerRepository playerRepository;
    private final CoachRepository coachRepository;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationDetailService evaluationDetailService;
    private final DrillAssignmentRepository drillAssignmentRepository;

    public PlayerController(
            PlayerRepository playerRepository,
            CoachRepository coachRepository,
            EvaluationRepository evaluationRepository,
            EvaluationDetailService evaluationDetailService,
            DrillAssignmentRepository drillAssignmentRepository) {
        this.playerRepository = playerRepository;
        this.coachRepository = coachRepository;
        this.evaluationRepository = evaluationRepository;
        this.evaluationDetailService = evaluationDetailService;
        this.drillAssignmentRepository = drillAssignmentRepository;
    }

    // The logged-in player's most recent evaluation, with attribute and
    // sub-attribute ratings and comments nested. 204 if they have none yet,
    // 403 if the caller isn't a player. Uses the id from the token, so a
    // player can only ever see their own.
    @GetMapping("/me/evaluations/latest")
    @Transactional(readOnly = true)
    public ResponseEntity<EvaluationDetailResponse> myLatestEvaluation(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        if (playerRepository.findById(id).isEmpty())
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // not a player

        Evaluation evaluation = evaluationRepository.findFirstByPlayerIdOrderByEvaluationDateDescIdDesc(id)
                .orElse(null);
        if (evaluation == null)
            return ResponseEntity.noContent().build(); // no evaluation yet

        return ResponseEntity.ok(evaluationDetailService.build(evaluation));
    }

    // Player joins a coach with the code
    @PostMapping("/me/coach")
    @Transactional
    public ResponseEntity<Void> joinCoach(@AuthenticationPrincipal Jwt jwt, @RequestBody JoinCoachRequest request) {
        UUID id = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(id).orElse(null);
        if (player == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // not a player
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

    @DeleteMapping("/me/coach")
    @Transactional
    public ResponseEntity<Void> leaveCoach(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(id).orElse(null);
        if (player == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // not a player
        if (player.getCoach() == null)
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // no coach to leave

        player.setCoach(null);
        player.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/me/drill-assignments")
    @Transactional(readOnly = true)
    public ResponseEntity<List<GetAssignedDrillsResponse>> myDrills(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(id).orElse(null);
        if (player == null)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // not a player

        List<GetAssignedDrillsResponse> drills = drillAssignmentRepository.findByPlayerIdOrderByAssignedAtDesc(id)
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
                            player.getUser().getName(),
                            assignment.getDueDate(),
                            assignment.getStatus(),
                            assignment.getCoachNote(),
                            assignment.getAssignedAt(),
                            assignment.getSubmittedAt(),
                            assignment.getReviewedAt());
                })
                .toList();

        return ResponseEntity.ok(drills);
    }

}
