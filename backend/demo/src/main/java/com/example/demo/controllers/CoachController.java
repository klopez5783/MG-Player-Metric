package com.example.demo.controllers;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.Comparator;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CreateEvaluationRequest;
import com.example.demo.dto.CreateEvaluationResponse;
import com.example.demo.dto.InviteCodeResponse;
import com.example.demo.dto.AttributeRatingRequest;
import com.example.demo.dto.CreateDrillAssignmentRequest;
import com.example.demo.dto.CreateDrillAssignmentResponse;
import com.example.demo.dto.SubAttributeRatingRequest;
import com.example.demo.dto.EvaluationDetailResponse;
import com.example.demo.dto.EvaluationSummaryResponse;
import com.example.demo.entities.Coaches;
import com.example.demo.entities.Players;
import com.example.demo.entities.Evaluation;
import com.example.demo.entities.Attribute;
import com.example.demo.entities.AttributeRating;
import com.example.demo.entities.SubAttribute;
import com.example.demo.entities.SubAttributeRating;
import com.example.demo.entities.Drill;
import com.example.demo.entities.DrillAssignment;
import com.example.demo.repositories.CoachRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.EvaluationRepository;
import com.example.demo.repositories.AttributeRepository;
import com.example.demo.repositories.AttributeRatingRepository;
import com.example.demo.repositories.SubAttributeRepository;
import com.example.demo.repositories.SubAttributeRatingRepository;
import com.example.demo.dto.RosterPlayerResponse;
import com.example.demo.dto.DrillResponse;
import com.example.demo.dto.DrillSubAttributeResponse;
import com.example.demo.repositories.DrillRepository;
import com.example.demo.repositories.DrillAssignmentRepository;
import com.example.demo.services.EvaluationDetailService;

@RestController
@RequestMapping("/coaches")
public class CoachController {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CoachRepository coachRepository;
    private final PlayerRepository playerRepository;
    private final EvaluationRepository evaluationRepository;
    private final AttributeRepository attributeRepository;
    private final AttributeRatingRepository attributeRatingRepository;
    private final SubAttributeRepository subAttributeRepository;
    private final SubAttributeRatingRepository subAttributeRatingRepository;
    private final EvaluationDetailService evaluationDetailService;
    private final DrillRepository drillRepository;
    private final DrillAssignmentRepository drillAssignmentRepository;

    public CoachController(
            DrillAssignmentRepository drillAssignmentRepository,
            CoachRepository coachRepository,
            PlayerRepository playerRepository,
            EvaluationRepository evaluationRepository,
            AttributeRepository attributeRepository,
            AttributeRatingRepository attributeRatingRepository,
            SubAttributeRepository subAttributeRepository,
            SubAttributeRatingRepository subAttributeRatingRepository,
            EvaluationDetailService evaluationDetailService,
            DrillRepository drillRepository) {
        this.coachRepository = coachRepository;
        this.playerRepository = playerRepository;
        this.evaluationRepository = evaluationRepository;
        this.attributeRepository = attributeRepository;
        this.attributeRatingRepository = attributeRatingRepository;
        this.subAttributeRepository = subAttributeRepository;
        this.subAttributeRatingRepository = subAttributeRatingRepository;
        this.evaluationDetailService = evaluationDetailService;
        this.drillRepository = drillRepository;
        this.drillAssignmentRepository = drillAssignmentRepository;
    }

    // Returns the coach's invite code, generating and saving one the first time.
    @GetMapping("/me/invite-code")
    @Transactional
    public ResponseEntity<InviteCodeResponse> myInviteCode(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        Coaches coach = coachRepository.findById(id).orElse(null);

        if (coach == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if (coach.getInviteCode() == null) {
            String inviteCode = generateUniqueCode();
            coach.setInviteCode(inviteCode);
            coachRepository.save(coach);
        }

        return ResponseEntity.ok(new InviteCodeResponse(coach.getInviteCode()));
    }

    // Lists the players who joined this coach; 403 if the caller isn't a coach.
    @GetMapping("/me/players")
    public ResponseEntity<List<RosterPlayerResponse>> myPlayers(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        if (coachRepository.findById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<RosterPlayerResponse> players = playerRepository.findByCoachId(id).stream()
                .map(player -> new RosterPlayerResponse(
                        player.getId(),
                        player.getUser().getName(),
                        player.getTeam(),
                        player.getPosition()))
                .toList();

        return ResponseEntity.ok(players);
    }

    // The coach's drill library: every built-in drill plus their own, minus
    // archived ones. One query, with sub-attributes listed in the same order
    // as the evaluation form. 403 if the caller isn't a coach.
    @GetMapping("/me/drills")
    public ResponseEntity<List<DrillResponse>> myDrills(@AuthenticationPrincipal Jwt jwt) {
        UUID id = UUID.fromString(jwt.getSubject());
        if (!coachRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<DrillResponse> drills = drillRepository.findLibraryForCoach(id).stream()
                .map(drill -> new DrillResponse(
                        drill.getId(),
                        drill.getName(),
                        drill.getDescription(),
                        drill.getInstructions(),
                        drill.getDurationMinutes(),
                        drill.getDifficulty(),
                        drill.getEquipment(),
                        drill.getDemoVideoUrl(),
                        drill.isRequiresVideo(),
                        drill.getCoach() != null,
                        drill.getSubAttributes().stream()
                                .sorted(Comparator
                                        .comparing((SubAttribute sub) -> sub.getAttribute().getDisplayOrder())
                                        .thenComparing(SubAttribute::getDisplayOrder))
                                .map(sub -> new DrillSubAttributeResponse(
                                        sub.getId(),
                                        sub.getName(),
                                        sub.getAttribute().getName()))
                                .toList()))
                .toList();

        return ResponseEntity.ok(drills);
    }

    // Saves an evaluation for one of the coach's own players, then a rating
    // row per attribute and per sub-attribute. 403 if the player belongs to
    // another coach, 400 if an attribute or sub-attribute id doesn't exist.
    @PostMapping("/me/evaluations")
    @Transactional
    public ResponseEntity<CreateEvaluationResponse> createEvaluation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateEvaluationRequest request) {
        System.out.println("Received request: " + request);
        UUID coachId = UUID.fromString(jwt.getSubject());
        Coaches coach = coachRepository.findById(coachId).orElse(null);
        if (coach == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Players player = playerRepository.findById(request.playerId()).orElse(null);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (player.getCoach() == null || !player.getCoach().getId().equals(coachId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setPlayer(player);
        evaluation.setCoach(coach);
        evaluation.setEvaluationDate(request.evaluationDate().atStartOfDay());
        evaluation.setEvaluationType(request.evaluationType());
        evaluation.setOverallRating(request.overallRating());
        evaluation.setStrengths(request.strengths());
        evaluation.setWeaknesses(request.weaknesses());
        evaluation.setGeneralComment(request.generalComment());
        evaluationRepository.save(evaluation);

        for (AttributeRatingRequest attrRequest : request.attributes()) {
            Attribute attribute = attributeRepository.findById(attrRequest.attributeId()).orElse(null);
            if (attribute == null) {
                System.out.println("Attribute not found: " + attrRequest.attributeId());
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown attribute id: " + attrRequest.attributeId());
            }

            AttributeRating attributeRating = new AttributeRating();
            attributeRating.setEvaluation(evaluation);
            attributeRating.setAttribute(attribute);
            attributeRating.setRating(attrRequest.rating());
            attributeRating.setComment(attrRequest.comment());
            attributeRatingRepository.save(attributeRating);

            for (SubAttributeRatingRequest subRequest : attrRequest.subAttributes()) {
                SubAttribute subAttribute = subAttributeRepository.findById(subRequest.subAttributeId()).orElse(null);
                if (subAttribute == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Unknown sub-attribute id: " + subRequest.subAttributeId());
                }

                SubAttributeRating subAttributeRating = new SubAttributeRating();
                subAttributeRating.setAttributeRating(attributeRating);
                subAttributeRating.setSubAttribute(subAttribute);
                subAttributeRating.setRating(subRequest.rating());
                subAttributeRating.setComment(subRequest.comment());
                subAttributeRatingRepository.save(subAttributeRating);
            }
        }

        return ResponseEntity.ok(new CreateEvaluationResponse(evaluation.getId()));
    }

    // Lists one of the coach's players' evaluations, newest first. 404 if the
    // player doesn't exist, 403 if they belong to another coach.
    @GetMapping("/me/players/{playerId}/evaluations")
    @Transactional(readOnly = true)
    public ResponseEntity<List<EvaluationSummaryResponse>> getPlayerEvaluations(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID playerId) {
        UUID coachId = UUID.fromString(jwt.getSubject());
        Players player = playerRepository.findById(playerId).orElse(null);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (player.getCoach() == null || !player.getCoach().getId().equals(coachId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<EvaluationSummaryResponse> evaluations = evaluationRepository
                .findByPlayerIdOrderByEvaluationDateDescIdDesc(playerId).stream()
                .map(evaluation -> new EvaluationSummaryResponse(
                        evaluation.getId(),
                        evaluation.getEvaluationDate(),
                        evaluation.getEvaluationType(),
                        evaluation.getOverallRating()))
                .toList();

        return ResponseEntity.ok(evaluations);
    }

    // Returns one of the coach's evaluations with its attribute and
    // sub-attribute ratings nested. 404 if it doesn't exist, 403 if another
    // coach wrote it. The nesting is built by EvaluationDetailService.
    @GetMapping("/me/evaluations/{evaluationId}")
    @Transactional(readOnly = true)
    public ResponseEntity<EvaluationDetailResponse> getEvaluationDetail(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer evaluationId) {
        UUID coachId = UUID.fromString(jwt.getSubject());
        Evaluation evaluation = evaluationRepository.findById(evaluationId).orElse(null);
        if (evaluation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (!evaluation.getCoach().getId().equals(coachId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(evaluationDetailService.build(evaluation));
    }

    // Deletes one of the coach's evaluations with all of its ratings. 404 if
    // it doesn't exist, 403 if another coach wrote it. The tables have no
    // ON DELETE CASCADE, so children go first: sub-attribute ratings, then
    // attribute ratings, then the evaluation.
    @DeleteMapping("/me/evaluations/{evaluationId}")
    @Transactional
    public ResponseEntity<Void> deleteEvaluation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer evaluationId) {
        UUID coachId = UUID.fromString(jwt.getSubject());
        Evaluation evaluation = evaluationRepository.findById(evaluationId).orElse(null);
        if (evaluation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (!evaluation.getCoach().getId().equals(coachId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        subAttributeRatingRepository.deleteAll(
                subAttributeRatingRepository
                        .findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(evaluationId));
        attributeRatingRepository.deleteAll(
                attributeRatingRepository.findByEvaluationIdOrderByAttributeDisplayOrderAsc(evaluationId));
        evaluationRepository.delete(evaluation);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/me/drill-assignments")
    public ResponseEntity<CreateDrillAssignmentResponse> assignDrill(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateDrillAssignmentRequest request) {
        UUID coachId = UUID.fromString(jwt.getSubject());
        Coaches coach = coachRepository.findById(coachId).orElse(null);
        if (coach == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Players player = playerRepository.findById(request.playerId()).orElse(null);
        if (player == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (player.getCoach() == null || !player.getCoach().getId().equals(coachId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Drill drill = drillRepository.findById(request.drillId()).orElse(null);
        boolean otherCoachesDrill = drill != null
                && drill.getCoach() != null
                && !drill.getCoach().getId().equals(coachId);
        if (drill == null || drill.isArchived() || otherCoachesDrill) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        if (drillAssignmentRepository.existsByDrillIdAndPlayerIdAndStatus(drill.getId(), player.getId(), "assigned")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        DrillAssignment assignment = new DrillAssignment();
        assignment.setDrill(drill);
        assignment.setPlayer(player);
        assignment.setCoach(coach);
        assignment.setDueDate(request.dueDate());
        assignment.setCoachNote(request.coachNote());
        DrillAssignment saved = drillAssignmentRepository.save(assignment);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CreateDrillAssignmentResponse(saved.getId()));
    }

    // Keeps generating codes until one isn't already taken by another coach.
    private String generateUniqueCode() {
        String code;
        do {
            code = generateCode();
        } while (coachRepository.existsByInviteCode(code));
        return code;
    }

    // 8 random characters, leaving out look-alikes (0/O, 1/I).
    private String generateCode() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
