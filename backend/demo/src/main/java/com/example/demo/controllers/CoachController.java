package com.example.demo.controllers;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import com.example.demo.dto.SubAttributeRatingRequest;
import com.example.demo.dto.EvaluationDetailResponse;
import com.example.demo.dto.EvaluationSummaryResponse;
import com.example.demo.dto.AttributeRatingResponse;
import com.example.demo.dto.SubAttributeRatingResponse;
import com.example.demo.entities.Coaches;
import com.example.demo.entities.Players;
import com.example.demo.entities.Evaluation;
import com.example.demo.entities.Attribute;
import com.example.demo.entities.AttributeRating;
import com.example.demo.entities.SubAttribute;
import com.example.demo.entities.SubAttributeRating;
import com.example.demo.repositories.CoachRepository;
import com.example.demo.repositories.PlayerRepository;
import com.example.demo.repositories.EvaluationRepository;
import com.example.demo.repositories.AttributeRepository;
import com.example.demo.repositories.AttributeRatingRepository;
import com.example.demo.repositories.SubAttributeRepository;
import com.example.demo.repositories.SubAttributeRatingRepository;
import com.example.demo.dto.RosterPlayerResponse;


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

    public CoachController(
            CoachRepository coachRepository,
            PlayerRepository playerRepository,
            EvaluationRepository evaluationRepository,
            AttributeRepository attributeRepository,
            AttributeRatingRepository attributeRatingRepository,
            SubAttributeRepository subAttributeRepository,
            SubAttributeRatingRepository subAttributeRatingRepository) {
        this.coachRepository = coachRepository;
        this.playerRepository = playerRepository;
        this.evaluationRepository = evaluationRepository;
        this.attributeRepository = attributeRepository;
        this.attributeRatingRepository = attributeRatingRepository;
        this.subAttributeRepository = subAttributeRepository;
        this.subAttributeRatingRepository = subAttributeRatingRepository;
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
                player.getPosition()
            ))
            .toList();

        return ResponseEntity.ok(players);
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
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown attribute id: " + attrRequest.attributeId());
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
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown sub-attribute id: " + subRequest.subAttributeId());
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
                evaluation.getOverallRating()
            ))
            .toList();

        return ResponseEntity.ok(evaluations);
    }

    // Returns one of the coach's evaluations with its attribute and
    // sub-attribute ratings nested. 404 if it doesn't exist, 403 if another
    // coach wrote it. Three queries: the evaluation, its attribute ratings,
    // and all of its sub-attribute ratings, grouped here.
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

        Map<Integer, List<SubAttributeRatingResponse>> subRatingsByAttributeRating =
            subAttributeRatingRepository.findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(evaluationId).stream()
                .collect(Collectors.groupingBy(
                    sub -> sub.getAttributeRating().getId(),
                    Collectors.mapping(
                        sub -> new SubAttributeRatingResponse(
                            sub.getSubAttribute().getId(),
                            sub.getSubAttribute().getName(),
                            sub.getRating(),
                            sub.getComment()
                        ),
                        Collectors.toList()
                    )
                ));

        List<AttributeRatingResponse> attributes =
            attributeRatingRepository.findByEvaluationIdOrderByAttributeDisplayOrderAsc(evaluationId).stream()
                .map(rating -> new AttributeRatingResponse(
                    rating.getAttribute().getId(),
                    rating.getAttribute().getName(),
                    rating.getRating(),
                    rating.getComment(),
                    subRatingsByAttributeRating.getOrDefault(rating.getId(), List.of())
                ))
                .toList();

        Players player = evaluation.getPlayer();
        return ResponseEntity.ok(new EvaluationDetailResponse(
            evaluation.getId(),
            player.getId(),
            player.getUser().getName(),
            evaluation.getEvaluationDate(),
            evaluation.getEvaluationType(),
            evaluation.getOverallRating(),
            evaluation.getStrengths(),
            evaluation.getWeaknesses(),
            evaluation.getGeneralComment(),
            attributes
        ));
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
            subAttributeRatingRepository.findByAttributeRatingEvaluationIdOrderBySubAttributeDisplayOrderAsc(evaluationId));
        attributeRatingRepository.deleteAll(
            attributeRatingRepository.findByEvaluationIdOrderByAttributeDisplayOrderAsc(evaluationId));
        evaluationRepository.delete(evaluation);

        return ResponseEntity.noContent().build();
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
